import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import os, { endianness, platform, tmpdir } from "node:os";
import path, { join } from "node:path";
import EventEmitter from "node:events";

const RESPONSE_META_KEY = "codex/browserUse";
const TURN_METADATA_HEADER = "x-codex-turn-metadata";
const SITE_STATUS_BASE = "https://chatgpt.com/backend-api";
const DEFAULT_TIMEOUT_MS = 3000;
const MAX_TIMEOUT_MS = 3000;
const BACKEND_DISCOVERY_TIMEOUT_MS = 3000;
const FRAME_HEADER_BYTES = 4;
const PLAYWRIGHT_INJECTED_GLOBAL = "__codexPlaywrightInjected";
const IAB_INPUT_TOKEN_PARAM = "__codexIabExpectedInputTargetToken";
const IAB_INPUT_TARGET_TOKEN = "__codexIabInputTargetToken";

function command(type, handler) {
  handler.type = type;
  return handler;
}

function positiveInteger(value, label = "Expected a positive integer") {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(label);
  }
  return number;
}

function timeoutMs(params = {}) {
  const value = typeof params.timeout_ms === "number" ? params.timeout_ms : DEFAULT_TIMEOUT_MS;
  return Math.min(Math.max(0, value), MAX_TIMEOUT_MS);
}

function validatePoint(commandName, point) {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new Error(`${commandName} requires finite x and y coordinates`);
  }
}

function isMac() {
  return platform() === "darwin";
}

function normalizeModifier(key) {
  return key === "ControlOrMeta" ? (isMac() ? "Meta" : "Control") : key;
}

function modifierMask(keys) {
  if (!keys) return 0;
  let mask = 0;
  for (const key of keys) {
    switch (normalizeModifier(key)) {
      case "Alt":
        mask |= 1;
        break;
      case "Control":
        mask |= 2;
        break;
      case "Meta":
        mask |= 4;
        break;
      case "Shift":
        mask |= 8;
        break;
    }
  }
  return mask;
}

function mouseButtonFromCua(value) {
  switch (value) {
    case undefined:
    case 1:
      return "left";
    case 2:
      return "middle";
    case 3:
      return "right";
    default:
      throw new Error(`Unsupported CUA mouse button: ${value}`);
  }
}

function cdpButtonMask(button) {
  switch (button) {
    case "left":
      return 1;
    case "right":
      return 2;
    case "middle":
      return 4;
    default:
      return 0;
  }
}

async function deviceScaleFactor(tabId, ctx) {
  try {
    const result = await ctx.cdp.call(tabId, "Runtime.evaluate", {
      expression: "window.devicePixelRatio",
      returnByValue: true,
    });
    const value = result?.result?.value;
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return 1 / value;
    }
  } catch {}
  return 1;
}

function encodeFrame(json) {
  const payload = Buffer.from(json, "utf8");
  const frame = Buffer.alloc(FRAME_HEADER_BYTES + payload.length);
  if (endianness() === "LE") frame.writeUInt32LE(payload.length, 0);
  else frame.writeUInt32BE(payload.length, 0);
  payload.copy(frame, FRAME_HEADER_BYTES);
  return frame;
}

function decodeFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (buffer.length - offset >= FRAME_HEADER_BYTES) {
    const length =
      endianness() === "LE" ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
    const total = FRAME_HEADER_BYTES + length;
    if (buffer.length - offset < total) break;
    messages.push(buffer.subarray(offset + FRAME_HEADER_BYTES, offset + total).toString("utf8"));
    offset += total;
  }
  return { messages, remainingData: buffer.subarray(offset) };
}

function nativePipeBridge() {
  const bridge = import.meta.__codexNativePipe;
  return bridge == null || typeof bridge.createConnection !== "function" ? null : bridge;
}

class NativePipeTransport {
  constructor(socket) {
    this.socket = socket;
  }

  messageCallback = null;
  pendingData = Buffer.alloc(0);
  closeListeners = new Set();
  closePromise = null;

  static async create(pipePath) {
    const bridge = nativePipeBridge();
    if (bridge == null) {
      throw new Error("privileged native pipe bridge is not available");
    }
    const socket = await bridge.createConnection(pipePath);
    const transport = new NativePipeTransport(socket);
    socket.on("data", (data) => transport.handleData(data));
    socket.on("close", () => {
      if (transport.socket === socket) transport.socket = null;
    });
    return transport;
  }

  sendMessage(message) {
    this.socket?.write(encodeFrame(JSON.stringify(message)));
  }

  setMessageCallback(callback) {
    this.messageCallback = callback;
  }

  addCloseListener(callback) {
    this.closeListeners.add(callback);
    return () => this.closeListeners.delete(callback);
  }

  async close() {
    this.closePromise ??= (async () => {
      await Promise.allSettled([...this.closeListeners].map((listener) => listener()));
      this.socket?.end();
      this.socket = null;
    })();
    await this.closePromise;
  }

  handleData(chunk) {
    this.pendingData = Buffer.concat([
      this.pendingData,
      Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength),
    ]);
    const { messages, remainingData } = decodeFrames(this.pendingData);
    this.pendingData = remainingData;
    for (const message of messages) {
      this.messageCallback?.(JSON.parse(message));
    }
  }
}

class JsonRpcPeer {
  constructor(transport) {
    this.transport = transport;
    transport.setMessageCallback((message) => {
      void this.handleIncomingMessage(message);
    });
  }

  nextId = 1;
  pendingRequests = new Map();
  requestHandlers = new Map();
  eventHandlers = new Map();

  registerRequestHandlerObject(target) {
    const names = [
      ...Object.getOwnPropertyNames(target),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(target)),
    ];
    for (const name of names) {
      if (name !== "constructor" && typeof target[name] === "function") {
        this.registerRequestHandler(name, target[name].bind(target));
      }
    }
  }

  registerRequestHandler(method, handler) {
    this.requestHandlers.set(method, handler);
  }

  addEventListener(method, listener) {
    const key = method.toString();
    const listeners = this.eventHandlers.get(key) ?? [];
    listeners.push(listener);
    this.eventHandlers.set(key, listeners);
  }

  removeEventListener(method, listener) {
    const key = method.toString();
    const listeners = this.eventHandlers.get(key) ?? [];
    this.eventHandlers.set(
      key,
      listeners.filter((candidate) => candidate !== listener),
    );
  }

  sendRequest(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.transport.sendMessage({ jsonrpc: "2.0", method: method.toString(), params, id });
    });
  }

  async handleIncomingMessage(message) {
    if ("method" in message) return this.handleIncomingRequest(message);
    if (message.id === undefined) return;
    const pending = this.pendingRequests.get(message.id);
    if (!pending) return;
    this.pendingRequests.delete(message.id);
    if ("error" in message) pending.reject(message.error?.message || "Something went wrong");
    else pending.resolve(message.result);
  }

  async handleIncomingRequest(message) {
    if (message.id === undefined) {
      for (const listener of this.eventHandlers.get(message.method ?? "") ?? []) {
        listener(message.params);
      }
      return;
    }
    const handler = this.requestHandlers.get(message.method ?? "");
    if (!handler) {
      this.transport.sendMessage({
        jsonrpc: "2.0",
        id: message.id,
        error: { code: -1, message: `No handler registered for method: ${message.method}` },
      });
      return;
    }
    try {
      this.transport.sendMessage({ jsonrpc: "2.0", id: message.id, result: await handler(message.params) });
    } catch (error) {
      this.transport.sendMessage({
        jsonrpc: "2.0",
        id: message.id,
        error: { code: 1, message: error instanceof Error ? error.message : String(error) },
      });
    }
  }
}

class LocalRequestHandlers {
  ping() {
    return "pong";
  }
}

class BrowserApi extends JsonRpcPeer {
  constructor(transport, localHandlers, getTurnMetadata) {
    super(transport);
    this.apiTransport = transport;
    this.getTurnMetadata = getTurnMetadata;
    this.registerRequestHandlerObject(localHandlers);
  }

  addEventListener = super.addEventListener;

  ping() {
    return this.sendRequest("ping");
  }

  executeCdp(params) {
    return this.sendSessionRequest("executeCdp", params);
  }

  attach(tabId) {
    return this.sendSessionRequest("attach", { tabId });
  }

  detach(tabId) {
    return this.sendSessionRequest("detach", { tabId });
  }

  getTabs() {
    return this.sendSessionRequest("getTabs", {});
  }

  getUserTabs() {
    return this.sendSessionRequest("getUserTabs", {});
  }

  claimUserTab(tabId) {
    return this.sendSessionRequest("claimUserTab", { tabId });
  }

  createTab() {
    return this.sendSessionRequest("createTab", {});
  }

  finalizeTabs(keep) {
    return this.sendSessionRequest("finalizeTabs", { keep });
  }

  nameSession(name) {
    return this.sendSessionRequest("nameSession", { name });
  }

  moveMouse(params) {
    return this.sendSessionRequest("moveMouse", params);
  }

  getInfo() {
    return this.sendSessionRequest("getInfo", {});
  }

  addCloseListener(listener) {
    return this.apiTransport.addCloseListener?.(listener) ?? (() => {});
  }

  async close() {
    await this.apiTransport.close?.();
  }

  sendSessionRequest(method, params) {
    return this.sendRequest(method, { ...params, ...this.getSessionParams() });
  }

  getSessionParams() {
    const metadata = this.getTurnMetadata();
    const sessionId = metadata?.session_id;
    if (typeof sessionId !== "string") throw new Error("Missing required browser session_id");
    const turnId = metadata?.turn_id;
    if (typeof turnId !== "string") throw new Error("Missing required browser turn_id");
    return { session_id: sessionId, turn_id: turnId };
  }
}

function pipeBase(currentPlatform) {
  return currentPlatform === "win32" ? "\\\\.\\pipe\\codex-browser-use" : "/tmp/codex-browser-use";
}

const extensionPipe =
  platform() === "win32" ? "\\\\.\\pipe\\codex-browser-use" : "/tmp/codex-browser-use.sock";
const iabPipe =
  platform() === "win32" ? "\\\\.\\pipe\\codex-browser-use-iab" : "/tmp/codex-browser-use-iab.sock";

async function discoverBackend(kind) {
  const localHandlers = new LocalRequestHandlers();
  const backends = await connectToDiscoveredBackends((transport) =>
    new BrowserApi(
      transport,
      localHandlers,
      () => globalThis.nodeRepl?.requestMeta?.[TURN_METADATA_HEADER],
    ),
  );
  return kind === "iab"
    ? selectIabBackend(backends)
    : backends.find((backend) => backend.info.type === kind) ?? null;
}

async function selectIabBackend(backends) {
  const iabBackends = backends.filter((backend) => backend.info.type === "iab");
  const sessionId = currentCodexSessionId();
  const matches =
    sessionId == null
      ? []
      : iabBackends.filter((backend) => backend.info.metadata?.codexSessionId === sessionId);

  await Promise.all(backends.filter((backend) => !matches.includes(backend)).map(({ api }) => api.close()));
  if (matches.length === 1) return matches[0] ?? null;
  await Promise.all(matches.map(({ api }) => api.close()));
  if (matches.length === 0) throw new Error(iabDiscoveryError(iabBackends, sessionId));
  throw new Error('Failed to connect to browser-use backend "iab". Multiple Codex IAB backends own this session.');
}

async function connectToDiscoveredBackends(createApi) {
  const candidates = await discoverPipePaths();
  candidates.push(iabPipe, extensionPipe);
  const attempts = candidates.map(async (candidate) => {
    let api = null;
    try {
      const transport = await NativePipeTransport.create(candidate);
      api = createApi(transport);
      const info = fallbackInfo(candidate) ?? (await api.getInfo());
      return { id: candidate, api, info };
    } catch {
      await api?.close();
      return null;
    }
  });
  const withTimeout = attempts.map((attempt) =>
    Promise.race([new Promise((resolve) => setTimeout(() => resolve(null), BACKEND_DISCOVERY_TIMEOUT_MS)), attempt]),
  );
  return (await Promise.all(withTimeout)).filter(Boolean);
}

async function discoverPipePaths() {
  return platform() === "win32" ? discoverWindowsPipePaths() : discoverUnixPipePaths();
}

async function discoverUnixPipePaths() {
  const base = pipeBase(os.platform());
  try {
    return (await readdir(base)).map((entry) => path.resolve(base, entry));
  } catch {
    return [];
  }
}

async function discoverWindowsPipePaths() {
  const prefix = "\\\\.\\pipe\\";
  try {
    return (await readdir(prefix)).map((entry) => path.resolve(prefix, entry)).filter((entry) => entry.startsWith(pipeBase("win32")));
  } catch {
    return [];
  }
}

function fallbackInfo(pipePath) {
  if (pipePath !== extensionPipe) return null;
  return { name: "Chrome", version: "0.0.1", type: "extension", capabilities: { fileUploads: false } };
}

function currentCodexSessionId() {
  const sessionId = globalThis.nodeRepl?.requestMeta?.[TURN_METADATA_HEADER]?.session_id;
  return typeof sessionId === "string" ? sessionId : undefined;
}

function iabDiscoveryError(iabBackends, sessionId) {
  if (sessionId == null) {
    return 'Failed to connect to browser-use backend "iab". No current Codex session metadata was available, so IAB ownership could not be checked.';
  }
  if (iabBackends.length === 0) {
    return 'Failed to connect to browser-use backend "iab". No Codex IAB backends were discovered.';
  }
  const scoped = iabBackends.filter((backend) => backend.info.metadata?.codexSessionId != null).length;
  const unscoped = iabBackends.length - scoped;
  return `Failed to connect to browser-use backend "iab". No discovered Codex IAB backend matched this session. Discovered ${iabBackends.length} IAB backend(s): ${scoped} route-scoped for other sessions, ${unscoped} without session metadata.`;
}

class CdpClient extends EventEmitter {
  constructor(api) {
    super();
    this.api = api;
    this.api.addEventListener("onCDPEvent", (event) => this.emit("event", event));
  }

  fileChoosersById = new Map();
  attachedTabIds = new Set();
  tabAttachHandlers = new Set();
  tabCleanupHandlers = new Set();

  async call(tabId, method, commandParams = {}) {
    const id = Number(tabId);
    if (!Number.isFinite(id)) throw new Error("callCdp requires numeric tab_id");
    await this.ensureAttachedTab(id);
    return this.api.executeCdp({ target: { tabId: id }, method, commandParams });
  }

  async evaluateJavascript(tabId, expression, options = {}) {
    const result = await this.call(tabId, "Runtime.evaluate", {
      expression,
      returnByValue: options.returnByValue ?? true,
      ...(options.awaitPromise != null ? { awaitPromise: options.awaitPromise } : {}),
    });
    if (result.exceptionDetails != null) throw new Error(formatRuntimeException(result.exceptionDetails));
    return result.result?.value;
  }

  async readDocumentState(tabId) {
    try {
      return await this.evaluateJavascript(tabId, "({ href: window.location.href, readyState: document.readyState })");
    } catch {
      return undefined;
    }
  }

  async waitForPageLoadEvent(tabId, options) {
    const classificationTimeoutMs = options.classificationTimeoutMs ?? 250;
    let startEvent;
    try {
      startEvent = await this.waitForEvent(tabId, (event) => isNavigationBlocked(event) || isNavigationStartEvent(event), {
        timeoutMs: classificationTimeoutMs,
        timeoutMessage: "Timed out waiting for page load start.",
      });
    } catch {
      return;
    }
    throwIfNavigationBlocked(startEvent);

    let completeEvent;
    try {
      completeEvent = await this.waitForEvent(tabId, (event) => isNavigationBlocked(event) || isNavigationCompleteEvent(event), {
        timeoutMs: options.timeoutMs,
        timeoutMessage: "Timed out waiting for page load completion.",
      });
    } catch {
      return;
    }
    throwIfNavigationBlocked(completeEvent);
  }

  waitForEvent(tabId, predicate, options) {
    const id = Number(tabId);
    if (!Number.isFinite(id)) throw new Error("waitForEvent requires numeric tab_id");
    return new Promise((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        this.removeListener("event", onEvent);
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", onAbort);
      };
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback(value);
      };
      const onAbort = () => finish(reject, new Error("waitForEvent aborted"));
      const onEvent = (event) => {
        if (event.source?.tabId !== id) return;
        try {
          if (predicate(event)) finish(resolve, event);
        } catch (error) {
          finish(reject, error instanceof Error ? error : new Error(`waitForEvent predicate failed: ${String(error)}`));
        }
      };
      const timer = setTimeout(() => finish(reject, new Error(options.timeoutMessage)), options.timeoutMs);
      if (options.signal?.aborted) return onAbort();
      options.signal?.addEventListener("abort", onAbort, { once: true });
      this.addListener("event", onEvent);
    });
  }

  async detachAllTabs() {
    await Promise.allSettled([...this.attachedTabIds].map((tabId) => this.detachTab(tabId)));
  }

  async closeTab(tabId) {
    const id = Number(tabId);
    if (!Number.isFinite(id)) throw new Error("closeTab requires numeric tab_id");
    await this.ensureAttachedTab(id);
    try {
      await this.runTabCleanupHandlers(id);
      await this.api.executeCdp({ target: { tabId: id }, method: "Page.close", commandParams: {} });
    } finally {
      this.forgetAttachedTab(id);
    }
  }

  async detachTab(tabId) {
    const id = Number(tabId);
    if (!Number.isFinite(id)) throw new Error("detachTab requires numeric tab_id");
    if (!this.attachedTabIds.has(id)) return;
    try {
      await this.runTabCleanupHandlers(id);
      await this.api.detach(id);
    } finally {
      this.forgetAttachedTab(id);
    }
  }

  addTabCleanupHandler(handler) {
    this.tabCleanupHandlers.add(handler);
    return () => this.tabCleanupHandlers.delete(handler);
  }

  addTabAttachHandler(handler) {
    this.tabAttachHandlers.add(handler);
    return () => this.tabAttachHandlers.delete(handler);
  }

  async ensureAttachedTab(tabId) {
    if (this.attachedTabIds.has(tabId)) return;
    await this.api.attach(tabId);
    await this.enableFocusEmulation(tabId);
    this.attachedTabIds.add(tabId);
    this.emit("tabAttached", tabId);
    await Promise.allSettled([...this.tabAttachHandlers].map((handler) => handler(tabId)));
  }

  async enableFocusEmulation(tabId) {
    try {
      await this.api.executeCdp({
        target: { tabId },
        method: "Emulation.setFocusEmulationEnabled",
        commandParams: { enabled: true },
      });
    } catch {}
  }

  async runTabCleanupHandlers(tabId) {
    await Promise.allSettled([...this.tabCleanupHandlers].map((handler) => handler(tabId)));
  }

  forgetAttachedTab(tabId) {
    if (!this.attachedTabIds.has(tabId)) return;
    for (const [id, chooser] of this.fileChoosersById) {
      if (chooser.tabId === tabId) this.fileChoosersById.delete(id);
    }
    this.attachedTabIds.delete(tabId);
    this.emit("tabDetached", tabId);
  }
}

function formatRuntimeException(details) {
  const value = details.exception?.value;
  const message =
    typeof value === "string"
      ? value
      : details.exception?.description ?? details.text ?? "JavaScript evaluation failed";
  return `Browser Use encountered an error interacting with this webpage: ${message}`;
}

function isNavigationBlocked(event) {
  return event.method === "Page.navigationBlocked";
}

function throwIfNavigationBlocked(event) {
  if (event != null && isNavigationBlocked(event)) {
    throw new Error(`Browser Use is not permitted on ${displayUrl(event.params?.url) ?? "this page"}.`);
  }
}

function isNavigationStartEvent(event) {
  return (
    event.method === "Page.frameStartedLoading" ||
    event.method === "Page.frameNavigated" ||
    event.method === "Page.navigatedWithinDocument"
  );
}

function isNavigationCompleteEvent(event) {
  return event.method === "Page.domContentEventFired" || event.method === "Page.loadEventFired";
}

function displayUrl(url) {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    parsed.username = "";
    parsed.password = "";
    parsed.search = "";
    parsed.hash = "";
    const text = parsed.toString();
    return parsed.pathname === "/" ? text.slice(0, -1) : text;
  } catch {
    return null;
  }
}

class BrowserUser {
  constructor(api, clientInfo) {
    this.api = api;
    this.clientInfo = clientInfo;
  }

  async openTabs() {
    return this.api.getUserTabs();
  }

  async claimTab(tabId) {
    if (this.clientInfo?.type !== "extension") {
      throw new Error("browser.user.claimTab is only available with the Chrome backend.");
    }
    return this.api.claimUserTab(tabId);
  }
}

class UiBridge {
  constructor(api) {
    this.api = api;
  }

  async moveMouse(tabId, x, y, options = {}) {
    try {
      const move = this.api.moveMouse({
        tabId,
        ...(options.waitForArrival === false ? { waitForArrival: false } : {}),
        x,
        y,
      });
      if (options.waitForArrival === false) {
        move.catch(() => {});
        return;
      }
      await move;
    } catch {}
  }
}

class CuaController {
  constructor(cdp, ui) {
    this.cdp = cdp;
    this.ui = ui;
  }

  async dispatchKeyPress({ commandName, keys, tabId, iabInputTargetToken }) {
    if (!Array.isArray(keys) || keys.length === 0) {
      throw new Error(`${commandName} requires a non-empty keys array`);
    }
    await dispatchKeyChord(this.cdp, positiveInteger(tabId), keys, { iabInputTargetToken });
  }

  async dispatchMouseMove(tabId, point, modifiers) {
    await this.ui.moveMouse(tabId, point.x, point.y);
    await this.cdp.call(tabId, "Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: point.x,
      y: point.y,
      button: "none",
      buttons: 0,
      modifiers,
    });
  }

  async clickPoint({ tabId, point, button = "left", clickCount, modifiers, timeoutMs: rawTimeout }) {
    const id = positiveInteger(tabId);
    const boundedTimeout = timeoutMs({ timeout_ms: rawTimeout });
    await this.ui.moveMouse(id, point.x, point.y);
    const navigation = this.cdp.waitForPageLoadEvent(id, { timeoutMs: boundedTimeout });
    const ignoredNavigation = navigation.catch(() => {});
    try {
      for (let count = 1; count <= clickCount; count += 1) {
        await this.dispatchMouseDown({ tabId: id, point, button, clickCount: count, modifiers });
        await this.dispatchMouseUp({ tabId: id, point, button, clickCount: count, modifiers });
      }
    } catch (error) {
      await ignoredNavigation;
      throw error;
    }
    await navigation;
  }

  async dispatchMouseDown({ tabId, point, button, clickCount, modifiers }) {
    await this.cdp.call(tabId, "Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: point.x,
      y: point.y,
      button,
      buttons: cdpButtonMask(button),
      clickCount,
      modifiers,
    });
  }

  async dispatchMouseUp({ tabId, point, button, clickCount, modifiers }) {
    await this.cdp.call(tabId, "Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: point.x,
      y: point.y,
      button,
      buttons: 0,
      clickCount,
      modifiers,
    });
  }

  async dragPath({ tabId, path: dragPath, modifiers }) {
    const id = positiveInteger(tabId);
    const [first, ...rest] = dragPath;
    if (!first) throw new Error("cua_drag requires a non-empty path");
    const button = "left";
    await this.dispatchMouseMove(id, first, modifiers);
    await this.dispatchMouseDown({ tabId: id, point: first, button, clickCount: 1, modifiers });
    let current = first;
    let completed = false;
    try {
      for (const point of rest) {
        current = point;
        await this.ui.moveMouse(id, point.x, point.y, { waitForArrival: false });
        await this.cdp.call(id, "Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: point.x,
          y: point.y,
          button,
          buttons: cdpButtonMask(button),
          modifiers,
        });
      }
      completed = true;
      await this.dispatchMouseUp({ tabId: id, point: current, button, clickCount: 1, modifiers });
    } finally {
      if (!completed) {
        await this.dispatchMouseUp({ tabId: id, point: current, button, clickCount: 1, modifiers }).catch(() => {});
      }
    }
  }

  async scrollPoint({ tabId, point, scrollX, scrollY, modifiers }) {
    const id = positiveInteger(tabId);
    await this.dispatchMouseMove(id, point, modifiers);
    await this.cdp.call(id, "Input.synthesizeScrollGesture", {
      x: point.x,
      y: point.y,
      xDistance: scrollX === 0 ? 0 : -scrollX,
      yDistance: scrollY === 0 ? 0 : -scrollY,
      gestureSourceType: "mouse",
      preventFling: true,
    });
  }
}

async function dispatchKeyChord(cdp, tabId, keys, options = {}) {
  const normalized = normalizeKeyChord(keys);
  const pressed = new Set();
  const last = normalized.at(-1);
  if (!last) throw new Error("keypress requires at least one key");
  for (const key of normalized.slice(0, -1)) {
    await dispatchKey(cdp, tabId, key, "down", pressed, options.iabInputTargetToken);
  }
  await dispatchKey(cdp, tabId, last, "down", pressed, options.iabInputTargetToken);
  await dispatchKey(cdp, tabId, last, "up", pressed, options.iabInputTargetToken);
  for (const key of normalized.slice(0, -1).reverse()) {
    await dispatchKey(cdp, tabId, key, "up", pressed, options.iabInputTargetToken);
  }
}

function normalizeKeyChord(keys) {
  const parts = keys.flatMap((key) => String(key).split("+").filter(Boolean));
  const joined = parts.map((part) => part.toLowerCase()).join("+");
  const aliases = {
    "ctrl+a": ["ControlOrMeta", "a"],
    "ctrl+c": ["ControlOrMeta", "c"],
    "ctrl+l": ["ControlOrMeta", "l"],
    "ctrl+n": ["ControlOrMeta", "n"],
    "ctrl+shift+v": ["ControlOrMeta", "Shift", "v"],
    "ctrl+v": ["ControlOrMeta", "v"],
    "ctrl+x": ["ControlOrMeta", "x"],
    "ctrl+y": ["ControlOrMeta", "Shift", "z"],
    "ctrl+z": ["ControlOrMeta", "z"],
  };
  return aliases[joined] ?? parts.map(normalizeKeyName);
}

function normalizeKeyName(key) {
  const aliases = new Map([
    ["alt", "Alt"],
    ["option", "Alt"],
    ["control", "Control"],
    ["controlormeta", "ControlOrMeta"],
    ["ctrl", "ControlOrMeta"],
    ["cmd", "Meta"],
    ["win", "Meta"],
    ["super", "Meta"],
    ["shift", "Shift"],
    ["esc", "Escape"],
    ["return", "Enter"],
    ["del", "Delete"],
    ["space", " "],
    ["left", "ArrowLeft"],
    ["right", "ArrowRight"],
    ["up", "ArrowUp"],
    ["down", "ArrowDown"],
  ]);
  return aliases.get(key.toLowerCase()) ?? key;
}

async function dispatchKey(cdp, tabId, rawKey, phase, pressed, iabInputTargetToken) {
  const key = normalizeModifier(rawKey);
  const modifier = ["Alt", "Control", "Meta", "Shift"].includes(key) ? key : null;
  if (phase === "down" && modifier) pressed.add(modifier);
  if (phase === "up" && modifier) pressed.delete(modifier);
  const event = {
    type: phase === "down" ? (key.length === 1 ? "keyDown" : "rawKeyDown") : "keyUp",
    modifiers: modifierMask(pressed),
    key,
    code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
    text: phase === "down" && key.length === 1 && (pressed.size === 0 || (pressed.size === 1 && pressed.has("Shift"))) ? key : "",
    unmodifiedText: phase === "down" && key.length === 1 ? key : "",
  };
  await cdp.call(tabId, "Input.dispatchKeyEvent", withIabToken(event, iabInputTargetToken));
}

function withIabToken(params, token) {
  return token == null ? params : { ...params, [IAB_INPUT_TOKEN_PARAM]: token };
}

class DevLogs {
  constructor(cdp) {
    this.cdp = cdp;
    cdp.addTabAttachHandler((tabId) => {
      if (!this.runtimeEnablePromises.has(tabId)) return this.ensureRuntimeEnabled(tabId);
    });
    cdp.on("tabDetached", (tabId) => {
      this.logsByTabId.delete(tabId);
      this.runtimeEnabledTabIds.delete(tabId);
      this.runtimeEnablePromises.delete(tabId);
    });
    cdp.on("event", (event) => this.handleCdpEvent(event));
  }

  logsByTabId = new Map();
  runtimeEnabledTabIds = new Set();
  runtimeEnablePromises = new Map();

  async logs({ tabId, filter, levels, limit = 100 }) {
    await this.ensureRuntimeEnabled(tabId);
    const levelSet = levels ? new Set(levels) : null;
    return (this.logsByTabId.get(tabId) ?? [])
      .filter((entry) => !(filter && !entry.message.includes(filter)) && !(levelSet && !levelSet.has(entry.level)))
      .slice(-limit);
  }

  async ensureRuntimeEnabled(tabId) {
    if (this.runtimeEnabledTabIds.has(tabId)) return;
    let promise = this.runtimeEnablePromises.get(tabId);
    if (!promise) {
      promise = this.cdp.call(tabId, "Runtime.enable").then(() => {
        this.runtimeEnabledTabIds.add(tabId);
      });
      this.runtimeEnablePromises.set(tabId, promise);
    }
    try {
      await promise;
    } finally {
      this.runtimeEnablePromises.delete(tabId);
    }
  }

  handleCdpEvent(event) {
    const tabId = event.source?.tabId;
    if (typeof tabId !== "number") return;
    if (event.method === "Runtime.consoleAPICalled") {
      const entry = consoleLogEntry(event.params);
      if (entry) this.pushLog(tabId, entry);
    } else if (event.method === "Runtime.exceptionThrown") {
      const entry = exceptionLogEntry(event.params);
      if (entry) this.pushLog(tabId, entry);
    }
  }

  pushLog(tabId, entry) {
    const logs = this.logsByTabId.get(tabId) ?? [];
    logs.push(entry);
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    this.logsByTabId.set(tabId, logs);
  }
}

function consoleLogEntry(params) {
  if (!isRecord(params)) return null;
  return {
    level: normalizeLogLevel(stringField(params, "type")),
    message: Array.isArray(params.args)
      ? params.args.map((arg) => (isRecord(arg) ? String(arg.value ?? arg.description ?? "[object]") : "[object]")).join(" ")
      : "",
    timestamp: new Date().toISOString(),
  };
}

function exceptionLogEntry(params) {
  if (!isRecord(params) || !isRecord(params.exceptionDetails)) return null;
  const exception = isRecord(params.exceptionDetails.exception) ? params.exceptionDetails.exception : null;
  return {
    level: "error",
    message:
      (typeof exception?.value === "string" ? exception.value : undefined) ??
      stringField(exception ?? {}, "description") ??
      stringField(params.exceptionDetails, "text") ??
      "Uncaught exception",
    timestamp: new Date().toISOString(),
    ...(stringField(params.exceptionDetails, "url") ? { url: stringField(params.exceptionDetails, "url") } : {}),
  };
}

function normalizeLogLevel(level) {
  switch (level) {
    case "debug":
      return "debug";
    case "info":
      return "info";
    case "warning":
    case "warn":
      return "warn";
    case "error":
      return "error";
    default:
      return "log";
  }
}

class Tabs {
  constructor(api, clientInfo) {
    this.api = api;
    this.clientInfo = clientInfo;
  }

  async create() {
    return this.api.createTab();
  }

  async list() {
    return this.api.getTabs();
  }

  async finalize(keep) {
    if (this.clientInfo?.type !== "extension") {
      throw new Error("browser.tabs.finalize is only available with Chrome.");
    }
    await this.api.finalizeTabs(keep.map((tab) => ({ tabId: tab.tabId, status: tab.status })));
  }

  async get(tabId) {
    const tabs = await this.list();
    const tab = tabs.find((candidate) => candidate.id === tabId);
    if (!tab) {
      const summary = tabs.length
        ? tabs.map((candidate) => `${candidate.id}|${candidate.title ?? "<no title>"}|${candidate.url ?? "<no url>"}`).join(", ")
        : "none";
      throw new Error(`No tab with id ${tabId}. Open tabs: ${summary}`);
    }
    return tab;
  }

  async getActive() {
    const tabs = await this.list();
    const active = tabs.find((tab) => tab.active) ?? tabs[0];
    if (!active) throw new Error("No selected tab.");
    return active;
  }
}

class PlaywrightBridge {
  constructor(cdp, cua) {
    this.cdp = cdp;
    this.cua = cua;
    cdp.addListener("tabDetached", (tabId) => this.playwrightInjectedTabIds.delete(tabId));
  }

  playwrightInjectedTabIds = new Set();

  async evaluateWithPlaywrightInjected(tabId, expression) {
    const id = positiveInteger(tabId, "ensurePlaywrightInjected requires numeric tab_id");
    await this.ensurePlaywrightInjected(id);
    const result = await this.cdp.call(id, "Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(formatRuntimeException(result.exceptionDetails));
    return result.result?.value;
  }

  async ensurePlaywrightInjected(tabId) {
    if (this.playwrightInjectedTabIds.has(tabId)) {
      const present = await this.cdp.call(tabId, "Runtime.evaluate", {
        expression: `!!window.${PLAYWRIGHT_INJECTED_GLOBAL}`,
        returnByValue: true,
      });
      if (present.result?.value) return;
      this.playwrightInjectedTabIds.delete(tabId);
    }
    await this.cdp.call(tabId, "Runtime.evaluate", {
      expression: `(() => {
        if (!window.${PLAYWRIGHT_INJECTED_GLOBAL}) {
          window.${PLAYWRIGHT_INJECTED_GLOBAL} = {
            parseSelector: (selector) => selector,
            querySelectorAll: (selector, root) => Array.from(root.querySelectorAll(selector)),
            elementState: (element, state) => {
              if (!element || !element.isConnected) return { matches: false, received: "error:notconnected" };
              if (state === "visible") {
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                const visible = rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
                return { matches: visible, received: visible ? "visible" : "hidden" };
              }
              if (state === "hidden") {
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                const visible = rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
                return { matches: !visible, received: visible ? "visible" : "hidden" };
              }
              if (state === "enabled" || state === "disabled") {
                const disabled = !!element.disabled || element.getAttribute("aria-disabled") === "true";
                return { matches: state === "disabled" ? disabled : !disabled, received: disabled ? "disabled" : "enabled" };
              }
              if (state === "editable") {
                const editable = element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.nodeName);
                return { matches: editable && !element.disabled, received: editable ? "editable" : "readOnly" };
              }
              if (state === "checked" || state === "unchecked") {
                const checked = !!element.checked || element.getAttribute("aria-checked") === "true";
                return { matches: state === "checked" ? checked : !checked, received: checked ? "checked" : "unchecked", isRadio: element.type === "radio" };
              }
              return { matches: false, received: "unsupported" };
            },
            retarget: (element) => element,
            focusNode: (element) => { element.focus(); return "done"; },
            selectText: (element) => { element.select?.(); element.focus(); return "done"; },
            fill: (element, value) => { element.focus(); element.value = value; element.dispatchEvent(new Event("input", { bubbles: true })); element.dispatchEvent(new Event("change", { bubbles: true })); return "done"; },
            selectOptions: (element, selections) => {
              const values = selections.map((selection) => selection.value ?? selection.valueOrLabel ?? selection.label);
              for (const option of element.options ?? []) option.selected = values.includes(option.value) || values.includes(option.label);
              element.dispatchEvent(new Event("input", { bubbles: true }));
              element.dispatchEvent(new Event("change", { bubbles: true }));
              return Array.from(element.selectedOptions ?? []).map((option) => option.value);
            },
            checkDeprecatedSelectorUsage: () => {},
            strictModeViolationError: (selector, matches) => new Error("strict mode violation: " + selector + " resolved to " + matches.length + " elements"),
            incrementalAriaSnapshot: (element) => ({ full: element.innerText || element.textContent || "" }),
          };
        }
      })()`,
      returnByValue: true,
    });
    this.playwrightInjectedTabIds.add(tabId);
  }

  async evaluateOnPlaywrightSelector(tabId, selector, pageFunction, options = {}) {
    const deadline = Date.now() + timeoutMs({ timeout_ms: options.timeoutMs });
    const fn = pageFunction.toString();
    const arg = JSON.stringify(options.arg) ?? "undefined";
    for (;;) {
      try {
        return await this.evaluateWithPlaywrightInjected(tabId, `(() => {
          const injected = window.${PLAYWRIGHT_INJECTED_GLOBAL};
          const matches = injected.querySelectorAll(injected.parseSelector(${JSON.stringify(selector)}), document);
          const visible = matches.filter((element) => injected.elementState(element, "visible").matches);
          const element = matches.length === 1 ? matches[0] : visible.length === 1 ? visible[0] : null;
          if (!element) throw new Error("No element matched selector");
          return (${fn})(element, injected, ${arg});
        })()`);
      } catch (error) {
        if (String(error instanceof Error ? error.message : error).includes("strict mode violation:")) throw error;
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for selector ${selector}: ${error instanceof Error ? error.message : String(error)}`, {
            cause: error,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async evaluateOnPlaywrightSelectorAll(tabId, selector, pageFunction, options = {}) {
    const fn = pageFunction.toString();
    const arg = JSON.stringify(options.arg) ?? "undefined";
    return this.evaluateWithPlaywrightInjected(tabId, `(() => {
      const injected = window.${PLAYWRIGHT_INJECTED_GLOBAL};
      const elements = injected.querySelectorAll(injected.parseSelector(${JSON.stringify(selector)}), document);
      return (${fn})(elements, injected, ${arg});
    })()`);
  }

  async evaluateOnPlaywrightPage(tabId, pageFunction, options = {}) {
    const fn = pageFunction.toString();
    const arg = JSON.stringify(options.arg) ?? "undefined";
    return this.evaluateWithPlaywrightInjected(tabId, `(() => {
      const injected = window.${PLAYWRIGHT_INJECTED_GLOBAL};
      return (${fn})(injected, ${arg});
    })()`);
  }

  async clickLocator(params, clickCount) {
    const tabId = positiveInteger(params.tab_id);
    const point = await this.resolveActionPoint(params, {
      requireEnabled: params.force !== true,
      requireVisible: params.force !== true,
    });
    await this.cua.clickPoint({
      button: params.button === "right" || params.button === "middle" ? params.button : "left",
      clickCount,
      modifiers: modifierMask(params.modifiers),
      point,
      tabId,
      timeoutMs: timeoutMs(params),
    });
  }

  async focusLocator(params, options) {
    await this.evaluateOnPlaywrightSelector(
      params.tab_id,
      params.selector,
      (element, injected, data) => {
        for (const state of data.states ?? []) {
          const result = injected.elementState(element, state);
          if (result.received === "error:notconnected") throw new Error("Element is not connected");
          if (!result.matches) throw new Error("Element is not " + state);
        }
        element.scrollIntoView({ block: "center", inline: "nearest" });
        element.focus();
        if (data.selectText) element.select?.();
        if (data.iabInputTargetToken != null) {
          Object.defineProperty(element, "__codexIabInputTargetToken", {
            configurable: true,
            value: data.iabInputTargetToken,
            writable: true,
          });
        }
        return true;
      },
      {
        arg: {
          iabInputTargetToken: options.iabInputTargetToken,
          selectText: options.selectText === true,
          states: ["visible", "enabled", ...(options.requireEditable ? ["editable"] : [])],
        },
        timeoutMs: params.timeout_ms,
      },
    );
  }

  async readCheckedState(params) {
    return this.evaluateOnPlaywrightSelector(
      params.tab_id,
      params.selector,
      (element, injected) => {
        const result = injected.elementState(element, "checked");
        if (result.received === "error:notconnected") throw new Error("Element is not connected");
        return { checked: !!result.matches, isRadio: !!result.isRadio };
      },
      { timeoutMs: params.timeout_ms },
    );
  }

  async readElementState(params, stateName) {
    return this.evaluateOnPlaywrightSelectorAll(
      params.tab_id,
      params.selector,
      (elements, injected, data) => {
        const element = elements[0] ?? null;
        if (!element) return false;
        const result = injected.elementState(element, data.stateName);
        return result.received === "error:notconnected" ? false : !!result.matches;
      },
      { arg: { stateName }, timeoutMs: params.timeout_ms },
    );
  }

  async resolveActionPoint(params, requirements) {
    const requiredStates = [
      ...(requirements.requireVisible === false ? [] : ["visible"]),
      ...(requirements.requireEnabled === false ? [] : ["enabled"]),
    ];
    return this.evaluateOnPlaywrightSelector(
      params.tab_id,
      params.selector,
      (element, injected, data) => {
        for (const state of data.requiredStates) {
          const result = injected.elementState(element, state);
          if (result.received === "error:notconnected") throw new Error("Element is not connected");
          if (!result.matches) throw new Error("Element is not " + state);
        }
        element.scrollIntoView({ block: "center", inline: "nearest" });
        const rect = element.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) {
          throw new Error("Element does not have a clickable bounding box");
        }
        return { x: Math.max(0, rect.left + rect.width / 2), y: Math.max(0, rect.top + rect.height / 2) };
      },
      { arg: { requiredStates }, timeoutMs: params.timeout_ms },
    );
  }
}

class SitePolicy {
  constructor(now = Date.now) {
    this.now = now;
  }

  cache = new Map();
  inflightRequests = new Map();

  async throwIfBlocksUrl(url) {
    if (typeof url !== "string") return;
    const target = sitePolicyTarget(url);
    if (target != null && (await this.isBlocked(target))) {
      throw new Error(`Browser Use is not permitted on ${target.displayUrl}.`);
    }
  }

  async isBlocked(target) {
    const cached = this.cachedBlocked(target.cacheKey);
    if (cached != null) return cached;
    const inflight = this.inflightRequests.get(target.cacheKey);
    if (inflight) return inflight;
    const request = this.fetchBlocked(target).finally(() => {
      if (this.inflightRequests.get(target.cacheKey) === request) this.inflightRequests.delete(target.cacheKey);
    });
    this.inflightRequests.set(target.cacheKey, request);
    return request;
  }

  cachedBlocked(cacheKey) {
    const entry = this.cache.get(cacheKey);
    if (entry == null || this.now() - entry.timestampMs >= 1440 * 60 * 1000) {
      if (entry != null) this.cache.delete(cacheKey);
      return null;
    }
    return entry.blocked;
  }

  async fetchBlocked(target) {
    const fetcher = globalThis.nodeRepl?.fetch;
    if (fetcher == null) {
      throw new Error("Browser Use cannot determine if this website is allowed. Please try again later or use another source.");
    }
    const response = await fetcher(target.endpoint, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Browser Use cannot determine if ${target.displayUrl} is allowed. Please try again later or use another source.`);
    }
    const json = await response.json();
    const blocked = isRecord(json.feature_status) ? json.feature_status.agent === true : false;
    this.cache.set(target.cacheKey, { blocked, timestampMs: this.now() });
    return blocked;
  }
}

function sitePolicyTarget(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Browser Use cannot visit the requested page because the URL is invalid. Use a complete http:// or https:// URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
  const hostname = parsed.hostname.trim().toLowerCase();
  if (!hostname) throw new Error("Browser Use cannot visit the requested page because the URL does not include a website host.");
  if (isLocalHost(hostname)) return undefined;
  const normalizedDisplayUrl = displayUrl(parsed.toString());
  return {
    cacheKey: hostname.startsWith("www.") ? hostname.slice(4) : hostname,
    displayUrl: normalizedDisplayUrl,
    endpoint: siteStatusEndpoint(normalizedDisplayUrl),
  };
}

function siteStatusEndpoint(siteUrl) {
  const url = new URL(`${SITE_STATUS_BASE}/aura/site_status`);
  url.searchParams.set("site_url", siteUrl);
  return url.toString();
}

function isLocalHost(hostname) {
  const value = hostname.toLowerCase();
  return value === "localhost" || value.endsWith(".localhost") || value === "127.0.0.1" || value === "[::1]" || value === "::1";
}

function originForPermission(url) {
  if (typeof url !== "string" || url.trim().length === 0) return null;
  try {
    const parsed = new URL(url);
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || isLocalHost(parsed.hostname)) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

class CommandSecurity {
  constructor(tabs, getCreateElicitation) {
    this.tabs = tabs;
    this.getCreateElicitation = getCreateElicitation;
    this.sitePolicy = new SitePolicy();
  }

  async ensureCommandAllowed(commandRequest) {
    const target = permissionTarget(commandRequest);
    switch (target.kind) {
      case "none":
        return;
      case "targetUrl":
        await this.ensureUrlOriginAllowed(target.url);
        return;
      case "currentTab": {
        const tab = await this.tabs.get(target.tabId);
        await this.ensureUrlOriginAllowed(tab.url);
      }
    }
  }

  async ensureUrlOriginAllowed(url) {
    await this.sitePolicy.throwIfBlocksUrl(url);
    const origin = originForPermission(url);
    if (origin == null) return;
    const createElicitation = this.getCreateElicitation();
    if (createElicitation == null) {
      throw new Error(`Browser Use encountered an error attempting to request permission to access ${origin}. Please use another source or try another approach.`);
    }
    const result = await createElicitation({
      message: `Allow Browser Use to access ${origin}?`,
      meta: {
        codex_approval_kind: "mcp_tool_call",
        connector_id: "browser-use",
        connector_name: "Browser Use",
        persist: "always",
        tool_params: {},
        origin,
      },
    });
    if (result.action !== "accept") throw new Error(`The user has requested that ${origin} should not be used.`);
  }
}

const targetUrlCommands = new Set(["navigate_tab_url"]);
const noOriginCommands = new Set([
  "browser_user_open_tabs",
  "close_tab",
  "create_tab",
  "list_tabs",
  "name_session",
  "playwright_wait_for_timeout",
  "selected_tab",
]);

function permissionTarget(commandRequest) {
  if (noOriginCommands.has(commandRequest.type)) return { kind: "none" };
  if (targetUrlCommands.has(commandRequest.type)) {
    return { kind: "targetUrl", url: commandRequest.params?.url };
  }
  const tabId = Number(commandRequest.params?.tab_id);
  return Number.isInteger(tabId) && tabId > 0 ? { kind: "currentTab", tabId } : { kind: "none" };
}

class BrowserContext {
  constructor(api, runtime, browserInfo) {
    this.api = api;
    this.isIabBackend = browserInfo?.type === "iab";
    this.cdp = new CdpClient(api);
    this.browserUser = new BrowserUser(api, browserInfo);
    this.ui = new UiBridge(api);
    this.cua = new CuaController(this.cdp, this.ui);
    this.dev = new DevLogs(this.cdp);
    this.tabs = new Tabs(api, browserInfo);
    this.playwright = new PlaywrightBridge(this.cdp, this.cua);
    this.security = new CommandSecurity(this.tabs, runtime.getCreateElicitation);
    this.removeCloseListener = api.addCloseListener(() => this.dispose());
  }

  disposePromise = null;

  async nameSession(name) {
    await this.api.nameSession(name);
  }

  async dispose() {
    this.disposePromise ??= (async () => {
      this.removeCloseListener();
      await this.cdp.detachAllTabs();
    })();
    await this.disposePromise;
  }
}

const commandHandlers = [
  command("cua_get_visible_screenshot", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    const { cssVisualViewport } = await ctx.cdp.call(tabId, "Page.getLayoutMetrics");
    const scale = await deviceScaleFactor(tabId, ctx);
    const result = await ctx.cdp.call(tabId, "Page.captureScreenshot", {
      format: "jpeg",
      quality: 80,
      clip: {
        x: cssVisualViewport.pageX,
        y: cssVisualViewport.pageY,
        width: cssVisualViewport.clientWidth,
        height: cssVisualViewport.clientHeight,
        scale,
      },
    });
    if (typeof result.data !== "string" || !result.data) {
      throw new Error(`Page.captureScreenshot returned no data for tab ${tabId}.`);
    }
    return { data: result.data };
  }),
  command("cua_click", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    validatePoint("cua_click", params);
    await ctx.cua.clickPoint({
      button: mouseButtonFromCua(params.button),
      clickCount: 1,
      modifiers: modifierMask(params.keys),
      point: { x: params.x, y: params.y },
      tabId,
      timeoutMs: 10000,
    });
    return {};
  }),
  command("cua_double_click", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    validatePoint("cua_double_click", params);
    await ctx.cua.clickPoint({
      clickCount: 2,
      modifiers: modifierMask(params.keys),
      point: { x: params.x, y: params.y },
      tabId,
      timeoutMs: 10000,
    });
    return {};
  }),
  command("cua_drag", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    if (!Array.isArray(params.path) || params.path.length === 0) {
      throw new Error("cua_drag requires a non-empty path");
    }
    for (const point of params.path) validatePoint("cua_drag", point);
    await ctx.cua.dragPath({ modifiers: modifierMask(params.keys), path: params.path, tabId });
    return {};
  }),
  command("cua_keypress", async (params, ctx) => {
    await ctx.cua.dispatchKeyPress({ commandName: "cua_keypress", keys: params.keys, tabId: params.tab_id });
    return {};
  }),
  command("cua_move", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    validatePoint("cua_move", params);
    await ctx.cua.dispatchMouseMove(tabId, { x: params.x, y: params.y }, modifierMask(params.keys));
    return {};
  }),
  command("cua_scroll", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    validatePoint("cua_scroll", params);
    await ctx.cua.scrollPoint({
      modifiers: modifierMask(params.keys),
      point: { x: params.x, y: params.y },
      scrollX: params.scroll_x,
      scrollY: params.scroll_y,
      tabId,
    });
    return {};
  }),
  command("cua_type", async (params, ctx) => {
    await ctx.cdp.call(positiveInteger(params.tab_id), "Input.insertText", { text: params.text });
    return {};
  }),
  command("browser_user_claim_tab", async (params, ctx) => {
    const tab = await ctx.browserUser.claimTab(positiveInteger(params.tab_id));
    return tabSummary(tab);
  }),
  command("browser_user_open_tabs", async (_params, ctx) => ({
    tabs: (await ctx.browserUser.openTabs()).map(tabSummary),
  })),
  command("dom_cua_keypress", async (params, ctx) => {
    await ctx.cua.dispatchKeyPress({ commandName: "dom_cua_keypress", keys: params.keys, tabId: params.tab_id });
    return {};
  }),
  command("close_tab", async (params, ctx) => {
    await ctx.cdp.closeTab(positiveInteger(params.tab_id, "close_tab requires a positive integer tab_id"));
    return {};
  }),
  command("create_tab", async (_params, ctx) => ({ id: String((await ctx.tabs.create()).id) })),
  command("finalize_tabs", async (params, ctx) => {
    await ctx.tabs.finalize((params.keep ?? []).map((tab) => ({ tabId: positiveInteger(tab.tab_id), status: tab.status })));
    return {};
  }),
  command("list_tabs", async (_params, ctx) => ({ tabs: (await ctx.tabs.list()).map(tabSummary) })),
  command("name_session", async (params, ctx) => {
    const name = String(params.name ?? "").trim();
    if (!name) throw new Error("name_session requires a name");
    await ctx.nameSession(name);
    return {};
  }),
  command("navigate_tab_back", async (params, ctx) => navigateHistory(params, ctx, -1)),
  command("navigate_tab_forward", async (params, ctx) => navigateHistory(params, ctx, 1)),
  command("navigate_tab_reload", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id, "navigate_tab_reload requires a positive integer tab_id");
    const wait = ctx.cdp.waitForPageLoadEvent(tabId, { timeoutMs: typeof params.timeout_ms === "number" ? params.timeout_ms : 10000 });
    await ctx.cdp.call(tabId, "Page.reload", {});
    await wait;
    return {};
  }),
  command("navigate_tab_url", async (params, ctx) => navigateToUrl(params, ctx)),
  command("playwright_dom_snapshot", async (params, ctx) => ({
    dom_snapshot: await ctx.playwright.evaluateOnPlaywrightPage(params.tab_id, () => document.body?.innerText ?? ""),
  })),
  command("playwright_file_chooser_set_files", async (params, ctx) => {
    const tabId = positiveInteger(params.tab_id);
    const chooser = ctx.cdp.fileChoosersById.get(params.file_chooser_id);
    if (chooser == null) throw new Error(`Unknown file chooser id "${params.file_chooser_id}"`);
    if (chooser.tabId !== tabId) throw new Error(`File chooser "${params.file_chooser_id}" belongs to tab ${chooser.tabId}`);
    if (!Array.isArray(params.files) || params.files.length === 0) {
      throw new Error("fileChooser.setFiles requires at least one file");
    }
    if (!chooser.isMultiple && params.files.length > 1) throw new Error("File chooser does not accept multiple files");
    await ctx.cdp.call(tabId, "DOM.setFileInputFiles", { backendNodeId: chooser.backendNodeId, files: params.files });
    ctx.cdp.fileChoosersById.delete(params.file_chooser_id);
    return {};
  }),
  command("playwright_locator_click", async (params, ctx) => {
    await ctx.playwright.clickLocator(params, 1);
    return {};
  }),
  command("playwright_locator_count", async (params, ctx) => ({
    count: await ctx.playwright.evaluateOnPlaywrightSelectorAll(params.tab_id, params.selector, (elements) => elements.length),
  })),
  command("playwright_locator_dblclick", async (params, ctx) => {
    await ctx.playwright.clickLocator(params, 2);
    return {};
  }),
  command("playwright_locator_download_media", async (params, ctx) => {
    await ctx.playwright.evaluateOnPlaywrightSelector(
      params.tab_id,
      params.selector,
      (element) => {
        element.scrollIntoView({ block: "center", inline: "nearest" });
        const target = element.closest?.("img, video, source, a[href]") ?? element.querySelector?.("img, video, source, a[href]") ?? element;
        const url = target.currentSrc ?? target.src ?? target.href ?? "";
        if (!url) throw new Error("Matched element does not expose a downloadable media URL");
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = url.split("/").pop()?.split("?")[0] || "download";
        anchor.rel = "noopener";
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        return true;
      },
      { timeoutMs: params.timeout_ms },
    );
    return {};
  }),
  command("playwright_locator_fill", async (params, ctx) => {
    if (typeof params.value !== "string") throw new Error("playwright_locator_fill requires string value");
    const token = ctx.isIabBackend ? randomUUID() : undefined;
    if (params.replace === false) {
      const tabId = positiveInteger(params.tab_id);
      await ctx.playwright.focusLocator(params, { iabInputTargetToken: token, selectText: false, requireEditable: true });
      await ctx.cdp.call(tabId, "Input.insertText", withIabToken({ text: params.value }, token));
      return {};
    }
    await ctx.playwright.evaluateOnPlaywrightSelector(
      params.tab_id,
      params.selector,
      (element, injected, data) => injected.fill(element, data.value),
      { arg: { value: params.value, [IAB_INPUT_TARGET_TOKEN]: token }, timeoutMs: params.timeout_ms },
    );
    return {};
  }),
  command("playwright_locator_get_attribute", async (params, ctx) => {
    if (typeof params.name !== "string" || !params.name) {
      throw new Error("playwright_locator_get_attribute requires name");
    }
    return {
      value: await ctx.playwright.evaluateOnPlaywrightSelector(
        params.tab_id,
        params.selector,
        (element, _injected, data) => element.getAttribute(data.name),
        { arg: { name: params.name }, timeoutMs: params.timeout_ms },
      ),
    };
  }),
  command("playwright_locator_inner_text", async (params, ctx) => ({
    value: await ctx.playwright.evaluateOnPlaywrightSelector(params.tab_id, params.selector, (element) => ("innerText" in element ? String(element.innerText) : ""), {
      timeoutMs: params.timeout_ms,
    }),
  })),
  command("playwright_locator_is_enabled", async (params, ctx) => ({ value: await ctx.playwright.readElementState(params, "enabled") })),
  command("playwright_locator_is_visible", async (params, ctx) => ({ value: await ctx.playwright.readElementState(params, "visible") })),
  command("playwright_locator_press", async (params, ctx) => {
    if (typeof params.value !== "string" || !params.value) throw new Error("playwright_locator_press requires value");
    const tabId = positiveInteger(params.tab_id);
    const token = ctx.isIabBackend ? randomUUID() : undefined;
    await ctx.playwright.focusLocator(params, { iabInputTargetToken: token, requireEditable: false });
    await dispatchKeyChord(ctx.cdp, tabId, [params.value], { iabInputTargetToken: token });
    return {};
  }),
  command("playwright_locator_select_option", async (params, ctx) => {
    await ctx.playwright.evaluateOnPlaywrightSelector(
      params.tab_id,
      params.selector,
      (element, injected, data) => {
        const result = injected.selectOptions(element, data.selections);
        if (typeof result === "string" && result.startsWith("error:")) throw new Error(result);
        return true;
      },
      { arg: { selections: params.selections ?? [] }, timeoutMs: params.timeout_ms },
    );
    return {};
  }),
  command("playwright_locator_set_checked", async (params, ctx) => {
    if (typeof params.checked !== "boolean") throw new Error("playwright_locator_set_checked requires checked");
    const current = await ctx.playwright.readCheckedState(params);
    if (current.checked === params.checked) return {};
    if (current.isRadio && !params.checked) throw new Error("Cannot uncheck a radio button");
    await ctx.playwright.clickLocator(params, 1);
    if ((await ctx.playwright.readCheckedState(params)).checked !== params.checked) {
      throw new Error(`Click did not change checked state to ${String(params.checked)}`);
    }
    return {};
  }),
  command("playwright_locator_text_content", async (params, ctx) => ({
    value: await ctx.playwright.evaluateOnPlaywrightSelector(params.tab_id, params.selector, (element) => element.textContent, {
      timeoutMs: params.timeout_ms,
    }),
  })),
  command("playwright_locator_wait_for", async (params, ctx) => {
    const state = params.state ?? "visible";
    if (!["attached", "detached", "visible", "hidden"].includes(state)) {
      throw new Error(`Unsupported waitFor state: ${String(state)}`);
    }
    await ctx.playwright.evaluateOnPlaywrightSelectorAll(
      params.tab_id,
      params.selector,
      (elements, injected, data) => {
        const element = elements[0] ?? null;
        if (data.state === "attached") {
          if (element) return true;
          throw new Error("Element is not attached");
        }
        if (data.state === "detached") {
          if (!element) return true;
          throw new Error("Element is still attached");
        }
        if (!element) {
          if (data.state === "hidden") return true;
          throw new Error("Element is not attached");
        }
        const result = injected.elementState(element, data.state);
        if (result.received === "error:notconnected") throw new Error("Element is not connected");
        if (result.matches) return true;
        throw new Error("Element is not " + data.state);
      },
      { arg: { state }, timeoutMs: params.timeout_ms },
    );
    return {};
  }),
  command("playwright_screenshot", async (params, ctx) => screenshot(params, ctx)),
  command("playwright_wait_for_file_chooser", async (params, ctx) => waitForFileChooser(params, ctx)),
  command("playwright_wait_for_load_state", async (params, ctx) => {
    await waitForLoadState(params.tab_id, params.state, timeoutMs(params), ctx);
    return {};
  }),
  command("playwright_wait_for_timeout", async (params) => {
    positiveInteger(params.tab_id);
    await new Promise((resolve) => setTimeout(resolve, params.timeout_ms));
    return {};
  }),
  command("playwright_wait_for_url", async (params, ctx) => waitForUrl(params, ctx)),
  command("selected_tab", async (_params, ctx) => ({ id: String((await ctx.tabs.getActive()).id) })),
  command("tab_dev_logs", async (params, ctx) => ({
    logs: (await ctx.dev.logs({ tabId: positiveInteger(params.tab_id), filter: params.filter, levels: params.levels, limit: params.limit })).map((log) => ({
      level: log.level,
      message: log.message,
      timestamp: log.timestamp,
      ...(log.url == null ? {} : { url: log.url }),
    })),
  })),
  command("tab_content_export_gsuite", async (params, ctx) => exportGSuite(params, ctx)),
];

function tabSummary(tab) {
  return {
    id: String(tab.id),
    ...(tab.title == null ? {} : { title: tab.title }),
    ...(tab.url == null ? {} : { url: tab.url }),
    ...(tab.lastOpened == null ? {} : { lastOpened: tab.lastOpened }),
    ...(tab.tabGroup == null ? {} : { tabGroup: tab.tabGroup }),
  };
}

async function navigateHistory(params, ctx, offset) {
  const tabId = positiveInteger(params.tab_id, offset < 0 ? "navigate_tab_back requires a positive integer tab_id" : "navigate_tab_forward requires a positive integer tab_id");
  const timeout = typeof params.timeout_ms === "number" ? params.timeout_ms : 10000;
  const history = await ctx.cdp.call(tabId, "Page.getNavigationHistory");
  const entry = history.entries[history.currentIndex + offset];
  if (!entry) throw new Error(offset < 0 ? "Cannot navigate back: no previous page in history." : "Cannot navigate forward: no next page in history.");
  const wait = ctx.cdp.waitForPageLoadEvent(tabId, { timeoutMs: timeout });
  await ctx.cdp.call(tabId, "Page.navigateToHistoryEntry", { entryId: entry.id });
  await wait;
  return {};
}

async function navigateToUrl(params, ctx) {
  if (typeof params.url !== "string" || !params.url) throw new Error("navigate_tab_url requires a url");
  const tabId = positiveInteger(params.tab_id, "navigate_tab_url requires a positive integer tab_id");
  const timeout = typeof params.timeout_ms === "number" ? params.timeout_ms : 10000;
  await ctx.cdp.call(tabId, "Page.enable", {});
  const wait = ctx.cdp.waitForEvent(
    tabId,
    (event) => isNavigationBlocked(event) || isNavigationStartEvent(event) || isNavigationCompleteEvent(event),
    {
      timeoutMs: timeout,
      timeoutMessage: `Timed out waiting for tab ${tabId} to navigate to ${params.url}.`,
    },
  );
  const result = await ctx.cdp.call(tabId, "Page.navigate", { url: params.url });
  if (result.errorText) {
    const safeUrl = displayUrl(params.url) ?? "this page";
    throw new Error(`Browser Use cannot open ${safeUrl} in tab ${tabId}. Browser reported: ${String(result.errorText).replaceAll(params.url, safeUrl)}`);
  }
  throwIfNavigationBlocked(await wait);
  return {};
}

async function screenshot(params, ctx) {
  const tabId = positiveInteger(params.tab_id);
  const scale = await deviceScaleFactor(tabId, ctx);
  const captureParams = { format: "png" };
  if ([params.cropX, params.cropY, params.cropWidth, params.cropHeight].every((value) => value != null)) {
    if (params.cropWidth <= 0 || params.cropHeight <= 0) {
      throw new Error("playwright_screenshot crop width and height must be positive");
    }
    captureParams.captureBeyondViewport = true;
    captureParams.clip = {
      x: params.cropX,
      y: params.cropY,
      width: params.cropWidth,
      height: params.cropHeight,
      scale: 1,
    };
  } else if (params.fullPage === true) {
    const { cssContentSize } = await ctx.cdp.call(tabId, "Page.getLayoutMetrics");
    if (cssContentSize?.width == null || cssContentSize.height == null || cssContentSize.width <= 0 || cssContentSize.height <= 0) {
      throw new Error("Page.getLayoutMetrics returned no valid cssContentSize for full-page screenshot.");
    }
    captureParams.captureBeyondViewport = true;
    captureParams.clip = {
      x: cssContentSize.x ?? 0,
      y: cssContentSize.y ?? 0,
      width: cssContentSize.width,
      height: cssContentSize.height,
      scale,
    };
  } else {
    const { cssVisualViewport } = await ctx.cdp.call(tabId, "Page.getLayoutMetrics");
    captureParams.clip = {
      x: cssVisualViewport.pageX,
      y: cssVisualViewport.pageY,
      width: cssVisualViewport.clientWidth,
      height: cssVisualViewport.clientHeight,
      scale,
    };
  }
  const result = await ctx.cdp.call(tabId, "Page.captureScreenshot", captureParams);
  if (typeof result.data !== "string" || !result.data) {
    throw new Error(`Page.captureScreenshot returned no data for tab ${tabId}.`);
  }
  return { data: result.data };
}

async function waitForFileChooser(params, ctx) {
  const tabId = positiveInteger(params.tab_id);
  const boundedTimeout = timeoutMs(params);
  await ctx.cdp.call(tabId, "Page.enable");
  await ctx.cdp.call(tabId, "Page.setInterceptFileChooserDialog", { enabled: true });
  try {
    const event = await ctx.cdp.waitForEvent(
      tabId,
      (candidate) => candidate.method === "Page.fileChooserOpened" && Number.isInteger(candidate.params?.backendNodeId),
      {
        timeoutMs: boundedTimeout,
        timeoutMessage: `Timed out after ${boundedTimeout}ms waiting for file chooser.`,
      },
    );
    const id = randomUUID();
    const chooser = {
      backendNodeId: event.params.backendNodeId,
      isMultiple: event.params.mode === "selectMultiple",
      tabId,
    };
    ctx.cdp.fileChoosersById.set(id, chooser);
    return { file_chooser_id: id, is_multiple: chooser.isMultiple };
  } finally {
    await ctx.cdp.call(tabId, "Page.setInterceptFileChooserDialog", { enabled: false }).catch(() => {});
  }
}

async function waitForLoadState(tabIdValue, stateValue, boundedTimeout, ctx) {
  const tabId = positiveInteger(tabIdValue);
  const state = stateValue ?? "load";
  if (state === "networkidle") throw new Error("playwright_wait_for_load_state does not support networkidle");
  await ctx.cdp.call(tabId, "Page.enable", {});
  const documentState = await ctx.cdp.readDocumentState(tabId);
  if ((state === "domcontentloaded" && documentState?.readyState === "interactive") || documentState?.readyState === "complete") return;
  const event = await ctx.cdp.waitForEvent(
    tabId,
    (candidate) => isNavigationBlocked(candidate) || (state === "domcontentloaded" ? candidate.method === "Page.domContentEventFired" : candidate.method === "Page.loadEventFired"),
    {
      timeoutMs: boundedTimeout,
      timeoutMessage: `Timed out waiting for ${state} in tab ${tabId}.`,
    },
  );
  throwIfNavigationBlocked(event);
}

async function waitForUrl(params, ctx) {
  if (typeof params.url !== "string" || !params.url) throw new Error("playwright_wait_for_url requires a url");
  const tabId = positiveInteger(params.tab_id);
  const boundedTimeout = timeoutMs(params);
  const pattern = new RegExp(globToRegex(params.url));
  const matches = (url) => pattern.test(url);
  await ctx.cdp.call(tabId, "Page.enable", {});
  const state = await ctx.cdp.readDocumentState(tabId);
  if (state?.href && matches(state.href)) {
    await waitUntil(params, boundedTimeout, ctx);
    return { url: state.href };
  }
  const event = await ctx.cdp.waitForEvent(
    tabId,
    (candidate) => isNavigationBlocked(candidate) || navigationUrl(candidate, matches) != null,
    {
      timeoutMs: boundedTimeout,
      timeoutMessage: `Timed out waiting for URL ${params.url} in tab ${tabId}.`,
    },
  );
  throwIfNavigationBlocked(event);
  const url = navigationUrl(event, matches);
  await waitUntil(params, boundedTimeout, ctx);
  return url == null ? {} : { url };
}

function globToRegex(glob) {
  let output = "^";
  for (let index = 0; index < glob.length; ) {
    const char = glob[index];
    if (char === "*") {
      const doubleStar = glob[index + 1] === "*";
      output += doubleStar ? ".*" : "[^/]*";
      index += doubleStar ? 2 : 1;
    } else {
      output += /[\\.^$|()[\]{}+?]/.test(char) ? `\\${char}` : char;
      index += 1;
    }
  }
  return `${output}$`;
}

function navigationUrl(event, matches) {
  if (event.method === "Page.navigatedWithinDocument") {
    const url = stringField(event.params ?? {}, "url");
    return url != null && matches(url) ? url : undefined;
  }
  if (event.method !== "Page.frameNavigated" || !isRecord(event.params?.frame)) return undefined;
  const frame = event.params.frame;
  if (stringField(frame, "parentId") != null) return undefined;
  const url = stringField(frame, "url");
  return url != null && matches(url) ? url : undefined;
}

async function waitUntil(params, boundedTimeout, ctx) {
  switch (params.wait_until) {
    case undefined:
    case "commit":
      return;
    case "load":
    case "domcontentloaded":
    case "networkidle":
      await waitForLoadState(params.tab_id, params.wait_until, boundedTimeout, ctx);
  }
}

async function exportGSuite(params, ctx) {
  const tabId = positiveInteger(params.tab_id);
  const format = params.format;
  const supported = new Set(["pdf", "md", "xlsx", "csv", "docx", "pptx"]);
  if (typeof format !== "string" || !supported.has(format)) {
    throw new Error("tab_content_export_gsuite requires supported format");
  }
  const tab = await ctx.tabs.get(tabId);
  const url = googleWorkspaceExportUrl(tab.url, format);
  if (url == null) throw new Error("Unable to export GSuite content for this tab");
  const data = await ctx.cdp.evaluateJavascript(
    tabId,
    `(${async ({ exportUrl }) => {
      const response = await fetch(exportUrl, { method: "GET" });
      if (!response.ok) throw new Error("GSuite export request failed with HTTP " + response.status);
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      const chunkSize = 32768;
      for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
      }
      return { base64: btoa(binary) };
    }})(${JSON.stringify({ exportUrl: url })})`,
    { awaitPromise: true },
  );
  if (data?.base64 == null) throw new Error("Unable to export GSuite content for this tab");
  const dir = join(tmpdir(), "browser-use", "exports");
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${sanitizeFileName(tab.title ?? "Asset")}-${randomUUID()}.${format}`);
  const content = Buffer.from(data.base64, "base64");
  await writeFile(filePath, format === "md" ? Buffer.from(stripDataUrlReferences(content.toString("utf8")), "utf8") : content);
  return { path: filePath };
}

function googleWorkspaceExportUrl(tabUrl, format) {
  if (tabUrl == null) return null;
  let url;
  try {
    url = new URL(tabUrl);
  } catch {
    return null;
  }
  if (url.host !== "docs.google.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const docType = parts[0];
  if (!["document", "spreadsheets", "presentation"].includes(docType)) return null;
  const idIndex = parts.indexOf("d", 1);
  const docId = idIndex < 0 ? null : parts[idIndex + 1];
  if (!docId || parts.at(-1) === "pub") return null;
  const exportUrl = new URL(`https://docs.google.com/${docType}/d/${docId}/export`);
  exportUrl.searchParams.set("format", format);
  const tab = url.searchParams.get("tab");
  if (tab != null) exportUrl.searchParams.append("tab", tab);
  exportUrl.hash = url.hash;
  return exportUrl.toString();
}

function sanitizeFileName(value, replacement = "_") {
  const cleaned = value.replaceAll(/[/\\?%*|"<>:]/g, replacement).trim();
  return cleaned.length === 0 ? "ExportedContent" : cleaned;
}

function stripDataUrlReferences(markdown) {
  return markdown.replace(/^\s*\[[^\]]+\]:\s*<data:[^>]+>\s*\n?/gm, "").trim();
}

const downloadCapabilityCommands = new Map([
  ["playwright_download_path", "downloads"],
  ["playwright_wait_for_download", "downloads"],
  ["cua_download_media", "mediaDownloads"],
  ["dom_cua_download_media", "mediaDownloads"],
  ["playwright_locator_download_media", "mediaDownloads"],
]);

const fileUploadCommands = new Set(["playwright_file_chooser_set_files", "playwright_wait_for_file_chooser"]);

function assertDownloadCapability(browserInfo, commandType) {
  const capability = downloadCapabilityCommands.get(commandType);
  if (capability != null && browserInfo.capabilities?.[capability] === false) {
    throw new Error(`Downloads are not supported by ${browserInfo.name}.`);
  }
}

function assertFileUploadCapability(browserInfo, commandType) {
  if (fileUploadCommands.has(commandType) && browserInfo.capabilities?.fileUploads === false) {
    throw new Error(`File uploads are not supported by ${browserInfo.name}.`);
  }
}

class BrowserUseAgent {
  constructor({ displaySideEffect, executeAgentCommand }) {
    this.displaySideEffect = displaySideEffect;
    this.executeAgentCommand = executeAgentCommand;
  }

  async send({ command }) {
    const result = await this.executeAgentCommand(command);
    if (result !== undefined) await this.displaySideEffect?.(result);
    return result;
  }

  async execute(commandRequest) {
    return this.executeAgentCommand(commandRequest);
  }
}

function createDisplayBridge(globals) {
  return {
    processImage(buffer) {
      if (!Buffer.isBuffer(buffer)) throw new Error("display image data must be a Buffer.");
      return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    },
    async displayImage(dataUrl) {
      if (typeof dataUrl !== "string") throw new Error("display image data must be a data URL string.");
      await globals.nodeRepl?.emitImage?.(dataUrl);
    },
    async displayValue(value) {
      const consoleLike = globals.console;
      if (consoleLike && typeof consoleLike.log === "function") consoleLike.log(value);
      else console.log(value);
    },
  };
}

function createDisplaySideEffect(globals) {
  const bridge = createDisplayBridge(globals);
  return async (value) => {
    if (value === undefined) {
      await bridge.displayValue({ type: "value", value: undefined });
      return;
    }
    await bridge.displayValue(value);
  };
}

const stateByGlobals = (() => {
  const map = new WeakMap();
  return {
    get(globals) {
      return map.get(globals) ?? null;
    },
    set(globals, state) {
      map.set(globals, state);
    },
    deleteIfState(globals, state) {
      if (map.get(globals) === state) map.delete(globals);
    },
  };
})();

function defaultBackend() {
  return "chrome";
}

function connectionError(backend) {
  return backend === "iab"
    ? 'Failed to connect to browser-use backend "iab". Make sure the Codex app is running with in-app browser control enabled.'
    : 'Failed to connect to browser-use backend "chrome". Make sure the Chrome extension native host is installed and running.';
}

async function resolveBackend(requestedBackend) {
  const backend = requestedBackend || defaultBackend();
  const discovered = await discoverBackend(backend === "chrome" ? "extension" : "iab");
  if (!discovered) throw new Error(connectionError(backend));
  return discovered;
}

async function cleanupState(state, globals, target) {
  state.removeCleanupListener();
  await state.context.dispose();
  stateByGlobals.deleteIfState(globals, state);
  if (target.agent === state.agent) delete target.agent;
  if (target.display === state.display) delete target.display;
}

export async function setupAtlasRuntime({ globals, backend }) {
  const target = globals;
  const discovered = await resolveBackend(backend);
  const existing = stateByGlobals.get(globals);
  if (existing != null) {
    if (existing.id === discovered.id) {
      target.agent = existing.agent;
      target.display = existing.display;
      return;
    }
    await cleanupState(existing, globals, target);
  }
  if (target.agent != null) return;
  const context = new BrowserContext(
    discovered.api,
    { getCreateElicitation: () => globals.nodeRepl?.createElicitation },
    discovered.info,
  );
  const display = createDisplaySideEffect(globals);
  const agent = new BrowserUseAgent({
    displaySideEffect: display,
    async executeAgentCommand(commandRequest) {
      globals.nodeRepl?.setResponseMeta?.({ [RESPONSE_META_KEY]: true });
      const { type, ...params } = commandRequest;
      assertDownloadCapability(discovered.info, type);
      assertFileUploadCapability(discovered.info, type);
      const handler = commandHandlers.find((candidate) => candidate.type === type);
      if (!handler) throw new Error(`Unknown command: ${type}`);
      await context.security.ensureCommandAllowed({ type, params });
      return handler(params, context);
    },
  });
  const state = {
    id: discovered.id,
    context,
    agent,
    display,
    removeCleanupListener: () => {},
  };
  stateByGlobals.set(globals, state);
  target.agent = agent;
  target.display = display;
}

function isRecord(value) {
  return typeof value === "object" && value != null;
}

function stringField(object, key) {
  const value = object[key];
  return typeof value === "string" ? value : undefined;
}

export const __browserClientInternals = {
  BrowserApi,
  BrowserUseAgent,
  CdpClient,
  NativePipeTransport,
  commandHandlers,
  decodeFrames,
  encodeFrame,
  permissionTarget,
  sitePolicyTarget,
};
