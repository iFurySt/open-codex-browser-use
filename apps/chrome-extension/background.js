const NATIVE_HOST_NAME = "com.ifuryst.open_browser_use.extension";
const NATIVE_HOST_STATUS_KEY = "OPEN_BROWSER_USE_NATIVE_HOST_STATUS";
const SESSION_STATE_KEY = "OPEN_BROWSER_USE_SESSION_STATE";
const RECONNECT_ALARM_NAME = "open-browser-use-native-reconnect";
const HEARTBEAT_ALARM_NAME = "open-browser-use-heartbeat";
const DEFAULT_CDP_TIMEOUT_MS = 10_000;
const CURSOR_ARRIVAL_TIMEOUT_MS = 1_000;
const MAX_USER_TABS = 1000;

class JsonRpcPeer {
  constructor(transport, handlers) {
    this.transport = transport;
    this.handlers = handlers;
    this.transport.setMessageCallback((message) => {
      void this.handleMessage(message);
    });
  }

  async handleMessage(message) {
    if (!message || typeof message !== "object" || typeof message.method !== "string") {
      return;
    }
    const id = message.id;
    try {
      const handler = this.handlers[message.method];
      if (typeof handler !== "function") {
        throw new Error(`No handler registered for method: ${message.method}`);
      }
      const result = await handler.call(this.handlers, message.params ?? {});
      if (id !== undefined) {
        this.transport.sendMessage({ jsonrpc: "2.0", id, result: result ?? {} });
      }
    } catch (error) {
      if (id !== undefined) {
        this.transport.sendMessage({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32000,
            message: error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  }

  sendNotification(method, params) {
    this.transport.sendMessage({ jsonrpc: "2.0", method, params });
  }
}

class NativeTransport {
  constructor(hostName) {
    this.hostName = hostName;
    this.port = null;
    this.messageCallback = null;
    this.reconnectAttempt = 0;
    this.status = {
      hostName: this.hostName,
      lastChecked: Date.now(),
      reconnectAttempt: this.reconnectAttempt,
      state: "disconnected"
    };
    this.connect();
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === RECONNECT_ALARM_NAME && !this.port) {
        this.connect();
      }
    });
  }

  setMessageCallback(callback) {
    this.messageCallback = callback;
  }

  sendMessage(message) {
    if (!this.port) {
      this.scheduleReconnect("native host disconnected");
      throw new Error("Native host is disconnected");
    }
    this.port.postMessage(message);
  }

  connect() {
    if (this.port) {
      return;
    }
    try {
      const port = chrome.runtime.connectNative(this.hostName);
      this.port = port;
      this.reconnectAttempt = 0;
      this.setStatus({ state: "connected" });
      port.onMessage.addListener((message) => {
        this.messageCallback?.(message);
      });
      port.onDisconnect.addListener(() => {
        this.port = null;
        this.scheduleReconnect(chrome.runtime.lastError?.message ?? "native host disconnected");
      });
    } catch (error) {
      this.port = null;
      this.scheduleReconnect(error instanceof Error ? error.message : String(error));
    }
  }

  scheduleReconnect(error) {
    this.reconnectAttempt += 1;
    this.setStatus({
      state: "reconnecting",
      error,
      nextRetryMs: 5000,
      reconnectAttempt: this.reconnectAttempt
    });
    chrome.alarms.create(RECONNECT_ALARM_NAME, { periodInMinutes: 0.1 }).catch(() => {});
  }

  setStatus(status) {
    this.status = {
      hostName: this.hostName,
      lastChecked: Date.now(),
      reconnectAttempt: this.reconnectAttempt,
      ...status
    };
    chrome.storage.local
      .set({
        [NATIVE_HOST_STATUS_KEY]: this.status
      })
      .catch(() => {});
  }

  getStatus() {
    return this.status;
  }
}

class SessionStore {
  constructor() {
    this.state = { sessions: {}, deliverableGroupId: null };
    this.ready = this.load();
  }

  async load() {
    const stored = await chrome.storage.local.get(SESSION_STATE_KEY);
    const value = stored[SESSION_STATE_KEY];
    if (value && typeof value === "object") {
      this.state = {
        sessions: value.sessions && typeof value.sessions === "object" ? value.sessions : {},
        deliverableGroupId:
          typeof value.deliverableGroupId === "number" ? value.deliverableGroupId : null
      };
    }
  }

  async save() {
    await chrome.storage.local.set({ [SESSION_STATE_KEY]: this.state });
  }

  async getSession(sessionId) {
    await this.ready;
    const existing = this.state.sessions[sessionId];
    if (existing && typeof existing === "object") {
      return existing;
    }
    const created = {
      chromeGroupId: null,
      title: `Open Browser Use ${sessionId.slice(0, 8)}`,
      activeTabId: null,
      tabOrigins: {}
    };
    this.state.sessions[sessionId] = created;
    await this.save();
    return created;
  }

  async removeSession(sessionId) {
    await this.ready;
    delete this.state.sessions[sessionId];
    await this.save();
  }

  async findSessionByGroup(groupId) {
    await this.ready;
    for (const [sessionId, session] of Object.entries(this.state.sessions)) {
      if (session.chromeGroupId === groupId) {
        return { sessionId, session };
      }
    }
    return null;
  }
}

class BrowserBackend {
  constructor() {
    this.store = new SessionStore();
    this.attachedTabs = new Set();
    this.activeTabsBySession = new Map();
    this.downloadFilenamesById = new Map();
    this.downloadUrlsById = new Map();
    this.downloadChangeListeners = new Set();
    this.cursorArrivalWaitersByKey = new Map();
    this.nextCursorMoveSequence = 1;
    chrome.debugger.onDetach.addListener((source) => {
      if (typeof source.tabId === "number") {
        this.attachedTabs.delete(source.tabId);
      }
    });
  }

  ping() {
    return "pong";
  }

  async getInfo() {
    let { extensionInstanceId } = await chrome.storage.local.get("extensionInstanceId");
    if (typeof extensionInstanceId !== "string") {
      extensionInstanceId = crypto.randomUUID();
      await chrome.storage.local.set({ extensionInstanceId });
    }
    return {
      name: "Open Browser Use Chrome",
      version: chrome.runtime.getManifest().version,
      type: "extension",
      metadata: {
        extensionId: chrome.runtime.id,
        extensionInstanceId,
        nativeHostName: NATIVE_HOST_NAME
      }
    };
  }

  async createTab(params) {
    const session = await this.requireSession(params);
    const chromeTab = await createBackgroundTab();
    await this.ensureSessionGroup(session.sessionId, chromeTab.id, "agent");
    await this.setSessionActiveTab(session.sessionId, chromeTab.id);
    await this.ensureCursorContentScript(session.sessionId, chromeTab.id);
    return { ...toBrowserTab(chromeTab), active: true };
  }

  async getTabs(params) {
    const session = await this.requireSession(params);
    const tabs = await this.getSessionTabs(session.sessionId);
    return await this.withLogicalActive(session.sessionId, tabs.map(toBrowserTab));
  }

  async getUserTabs(params) {
    await this.requireSession(params);
    const tabs = (await chrome.tabs.query({}))
      .filter(hasTabId)
      .sort(compareLastAccessed)
      .slice(0, MAX_USER_TABS);
    const groupTitles = await readGroupTitles(tabs);
    return tabs.map((tab) => toUserTab(tab, groupTitles));
  }

  async getUserHistory(params) {
    await this.requireSession(params);
    const query = typeof params.query === "string" ? params.query : "";
    const maxResults =
      Number.isInteger(params.limit) && params.limit > 0 ? params.limit : 100;
    const search = { text: query, maxResults };
    if (typeof params.from === "string") {
      search.startTime = parseDate(params.from, "from");
    }
    if (typeof params.to === "string") {
      search.endTime = parseDate(params.to, "to");
    }
    const results = await chrome.history.search(search);
    return results.flatMap((item) => {
      if (typeof item.url !== "string" || typeof item.lastVisitTime !== "number") {
        return [];
      }
      return [
        {
          url: item.url,
          ...(item.title ? { title: item.title } : {}),
          dateVisited: new Date(item.lastVisitTime).toISOString()
        }
      ];
    });
  }

  async claimUserTab(params) {
    const session = await this.requireSession(params);
    const tabId = requireTabId(params, "claimUserTab");
    const tab = await chrome.tabs.get(tabId);
    if (!hasTabId(tab)) {
      throw new Error(`Chrome tab ${tabId} has no id`);
    }
    if (tab.url?.startsWith("chrome://")) {
      throw new Error(`Chrome internal tab ${tabId} cannot be claimed`);
    }
    if (typeof tab.groupId === "number" && tab.groupId !== -1) {
      const owner = await this.store.findSessionByGroup(tab.groupId);
      if (owner && owner.sessionId !== session.sessionId) {
        throw new Error(`Tab ${tabId} is already part of browser session ${owner.sessionId}`);
      }
    }
    await this.ensureSessionGroup(session.sessionId, tab.id, "user");
    await this.ensureCursorContentScript(session.sessionId, tab.id);
    await this.setSessionActiveTab(session.sessionId, tab.id);
    return { ...toBrowserTab(tab), active: true };
  }

  async finalizeTabs(params) {
    const session = await this.requireSession(params);
    if (!Array.isArray(params.keep)) {
      throw new Error("finalizeTabs requires keep array");
    }
    const keep = new Map();
    for (const entry of params.keep) {
      if (!entry || typeof entry !== "object") {
        throw new Error("finalizeTabs received invalid tab entry");
      }
      const tabId = requireTabId(entry, "finalizeTabs");
      const status = entry.status;
      if (status !== "handoff" && status !== "deliverable") {
        throw new Error(`finalizeTabs received invalid status ${String(status)}`);
      }
      keep.set(tabId, status);
    }
    const tabs = await this.getSessionTabs(session.sessionId);
    const sessionState = await this.store.getSession(session.sessionId);
    const agentTabsToClose = [];
    const userTabsToRelease = [];
    const deliverableTabs = [];
    for (const tab of tabs) {
      if (!hasTabId(tab)) {
        continue;
      }
      const keptStatus = keep.get(tab.id);
      if (keptStatus === "handoff") {
        continue;
      }
      if (keptStatus === "deliverable") {
        deliverableTabs.push(tab.id);
        continue;
      }
      if (sessionState.tabOrigins[String(tab.id)] === "agent") {
        agentTabsToClose.push(tab.id);
      } else {
        userTabsToRelease.push(tab.id);
      }
    }
    await this.detachMany([...agentTabsToClose, ...userTabsToRelease, ...deliverableTabs]);
    if (agentTabsToClose.length > 0) {
      await chrome.tabs.remove(agentTabsToClose.length === 1 ? agentTabsToClose[0] : agentTabsToClose);
    }
    if (userTabsToRelease.length > 0 && chrome.tabs.ungroup) {
      await chrome.tabs.ungroup(userTabsToRelease.length === 1 ? userTabsToRelease[0] : userTabsToRelease);
    }
    if (deliverableTabs.length > 0) {
      await this.moveToDeliverables(deliverableTabs);
    }
  }

  async nameSession(params) {
    const session = await this.requireSession(params);
    const name = typeof params.name === "string" && params.name.trim() ? params.name.trim() : "Open Browser Use";
    const sessionState = await this.store.getSession(session.sessionId);
    sessionState.title = name;
    await this.store.save();
    if (typeof sessionState.chromeGroupId === "number") {
      await chrome.tabGroups.update(sessionState.chromeGroupId, { title: name }).catch(() => {});
    }
  }

  async attach(params) {
    await this.requireSessionTab(params, "attach");
    const tabId = requireTabId(params, "attach");
    if (!this.attachedTabs.has(tabId)) {
      try {
        await chrome.debugger.attach({ tabId }, "1.3");
      } catch (error) {
        if (!String(error?.message ?? error).includes("Another debugger")) {
          throw error;
        }
      }
      this.attachedTabs.add(tabId);
    }
  }

  async detach(params) {
    await this.requireSessionTab(params, "detach");
    const tabId = requireTabId(params, "detach");
    await this.detachTab(tabId);
  }

  async executeCdp(params) {
    await this.requireSession(params);
    const target = params.target && typeof params.target === "object" ? params.target : {};
    const tabId = target.tabId;
    if (typeof tabId === "number") {
      await this.requireSessionTab(params, "executeCdp");
      if (!this.attachedTabs.has(tabId)) {
        throw new Error("Debugger unattached");
      }
    }
    const timeoutMs =
      typeof params.timeoutMs === "number" && params.timeoutMs > 0
        ? params.timeoutMs
        : DEFAULT_CDP_TIMEOUT_MS;
    return await withTimeout(timeoutMs, async () => {
      if (params.method === "Target.getTargets") {
        return { targetInfos: await chrome.debugger.getTargets() };
      }
      if (typeof params.method !== "string") {
        throw new Error("executeCdp requires method");
      }
      return await chrome.debugger.sendCommand(target, params.method, params.commandParams ?? {});
    });
  }

  async moveMouse(params) {
    await this.requireSessionTab(params, "moveMouse");
    const tabId = requireTabId(params, "moveMouse");
    if (!Number.isFinite(params.x) || !Number.isFinite(params.y)) {
      throw new Error("moveMouse requires finite x and y");
    }
    await this.ensureCursorContentScript(params.session_id, tabId);
    const moveSequence = this.nextCursorMoveSequence;
    this.nextCursorMoveSequence += 1;
    const arrivalWaiter =
      params.waitForArrival === false
        ? null
        : this.createCursorArrivalWaiter(params.session_id, params.turn_id, moveSequence);
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: "OPEN_BROWSER_USE_CURSOR",
        sessionId: params.session_id,
        turnId: params.turn_id,
        moveSequence,
        x: params.x,
        y: params.y,
        visible: true
      });
      await arrivalWaiter?.promise;
    } catch (error) {
      arrivalWaiter?.cancel();
      throw error;
    }
  }

  async turnEnded(params) {
    const session = await this.requireSession(params);
    const tabs = await this.getSessionTabs(session.sessionId);
    await this.detachMany(tabs.filter(hasTabId).map((tab) => tab.id));
  }

  async executeUnhandledCommand(params) {
    throw new Error(`Open Browser Use Chrome does not support command "${params.type}"`);
  }

  addDownloadChangeListener(listener) {
    this.downloadChangeListeners.add(listener);
    return () => this.downloadChangeListeners.delete(listener);
  }

  handleDownloadCreated(item) {
    if (!this.isBrowserControlActive() || !Number.isInteger(item?.id)) {
      return;
    }
    const filename = typeof item.filename === "string" ? item.filename : "";
    const url =
      typeof item.finalUrl === "string" ? item.finalUrl : typeof item.url === "string" ? item.url : "";
    this.downloadFilenamesById.set(item.id, filename);
    this.downloadUrlsById.set(item.id, url);
    this.emitDownloadChange({
      id: String(item.id),
      filename,
      url,
      status: "started"
    });
  }

  handleDownloadChanged(delta) {
    if (!Number.isInteger(delta?.id)) {
      return;
    }
    const filename =
      typeof delta.filename?.current === "string"
        ? delta.filename.current
        : this.downloadFilenamesById.get(delta.id);
    const url = this.downloadUrlsById.get(delta.id);
    if (typeof filename !== "string" || typeof url !== "string") {
      return;
    }
    this.downloadFilenamesById.set(delta.id, filename);
    const status = downloadStatus(delta);
    if (!status) {
      return;
    }
    this.emitDownloadChange({
      id: String(delta.id),
      filename,
      url,
      status
    });
    if (status === "complete" || status === "failed" || status === "canceled") {
      this.downloadFilenamesById.delete(delta.id);
      this.downloadUrlsById.delete(delta.id);
    }
  }

  notifyCursorArrived(params) {
    const moveSequence = params?.moveSequence;
    if (!Number.isInteger(moveSequence)) {
      return false;
    }
    const waiter = this.cursorArrivalWaitersByKey.get(cursorArrivalKey(params.sessionId, params.turnId, moveSequence));
    waiter?.();
    return Boolean(waiter);
  }

  readCursorOverlayState(tabId) {
    for (const [sessionId, activeTabId] of this.activeTabsBySession) {
      if (activeTabId === tabId) {
        return {
          cursor: null,
          isVisible: true,
          sessionId,
          turnId: null
        };
      }
    }
    return {
      cursor: null,
      isVisible: false,
      sessionId: null,
      turnId: null
    };
  }

  isBrowserControlActive() {
    return this.activeTabsBySession.size > 0;
  }

  createCursorArrivalWaiter(sessionId, turnId, moveSequence) {
    const key = cursorArrivalKey(sessionId, turnId, moveSequence);
    let timeoutId;
    let resolvePromise;
    const resolve = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      this.cursorArrivalWaitersByKey.delete(key);
      resolvePromise?.();
    };
    const promise = new Promise((resolveInner) => {
      resolvePromise = resolveInner;
      timeoutId = setTimeout(resolve, CURSOR_ARRIVAL_TIMEOUT_MS);
      this.cursorArrivalWaitersByKey.set(key, resolve);
    });
    return { promise, cancel: resolve };
  }

  emitDownloadChange(change) {
    for (const listener of this.downloadChangeListeners) {
      listener(change);
    }
  }

  async ensureSessionGroup(sessionId, tabId, origin) {
    const session = await this.store.getSession(sessionId);
    let groupId = session.chromeGroupId;
    if (typeof groupId === "number") {
      try {
        await chrome.tabGroups.get(groupId);
        await chrome.tabs.group({ groupId, tabIds: [tabId] });
      } catch {
        groupId = null;
      }
    }
    if (typeof groupId !== "number") {
      groupId = await chrome.tabs.group({ tabIds: [tabId] });
      session.chromeGroupId = groupId;
    }
    session.tabOrigins[String(tabId)] = origin;
    await this.store.save();
    await chrome.tabGroups.update(groupId, {
      title: session.title,
      color: "blue",
      collapsed: false
    });
  }

  async setSessionActiveTab(sessionId, tabId) {
    const session = await this.store.getSession(sessionId);
    session.activeTabId = tabId;
    this.activeTabsBySession.set(sessionId, tabId);
    await this.store.save();
  }

  async getSessionTabs(sessionId) {
    const session = await this.store.getSession(sessionId);
    if (typeof session.chromeGroupId !== "number") {
      return [];
    }
    try {
      return (await chrome.tabs.query({ groupId: session.chromeGroupId })).filter(
        (tab) => hasTabId(tab) && !tab.url?.startsWith("chrome://")
      );
    } catch {
      await this.store.removeSession(sessionId);
      return [];
    }
  }

  async requireSession(params) {
    if (!params || typeof params !== "object") {
      throw new Error("Missing browser session params");
    }
    if (typeof params.session_id !== "string") {
      throw new Error("Missing required browser session_id");
    }
    if (typeof params.turn_id !== "string") {
      throw new Error("Missing required browser turn_id");
    }
    await this.store.getSession(params.session_id);
    return { sessionId: params.session_id, turnId: params.turn_id };
  }

  async requireSessionTab(params, command) {
    const session = await this.requireSession(params);
    const tabId = requireTabId(params, command);
    const tabs = await this.getSessionTabs(session.sessionId);
    if (!tabs.some((tab) => tab.id === tabId)) {
      throw new Error(`Tab ${tabId} is not part of browser session ${session.sessionId}`);
    }
  }

  async withLogicalActive(sessionId, tabs) {
    if (tabs.length === 0) {
      return tabs;
    }
    const session = await this.store.getSession(sessionId);
    let activeTabId = this.activeTabsBySession.get(sessionId) ?? session.activeTabId;
    if (!tabs.some((tab) => tab.id === activeTabId)) {
      activeTabId = tabs.find((tab) => tab.active)?.id ?? tabs[0].id;
      await this.setSessionActiveTab(sessionId, activeTabId);
    } else if (!this.activeTabsBySession.has(sessionId)) {
      this.activeTabsBySession.set(sessionId, activeTabId);
    }
    return tabs.map((tab) => ({ ...tab, active: tab.id === activeTabId }));
  }

  async moveToDeliverables(tabIds) {
    let groupId = this.store.state.deliverableGroupId;
    if (typeof groupId === "number") {
      try {
        await chrome.tabGroups.get(groupId);
        await chrome.tabs.group({ groupId, tabIds });
      } catch {
        groupId = null;
      }
    }
    if (typeof groupId !== "number") {
      groupId = await chrome.tabs.group({ tabIds });
      this.store.state.deliverableGroupId = groupId;
    }
    await this.store.save();
    await chrome.tabGroups.update(groupId, {
      title: "Open Browser Use Deliverables",
      color: "green",
      collapsed: false
    });
  }

  async detachMany(tabIds) {
    await Promise.allSettled(tabIds.map((tabId) => this.detachTab(tabId)));
  }

  async detachTab(tabId) {
    try {
      await chrome.debugger.detach({ tabId });
    } finally {
      this.attachedTabs.delete(tabId);
    }
  }

  async ensureCursorContentScript(sessionId, tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: "OPEN_BROWSER_USE_PING" });
      if (response?.ok) {
        return;
      }
    } catch {}
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content-cursor.js"]
    });
  }
}

function hasTabId(tab) {
  return typeof tab?.id === "number";
}

function toBrowserTab(tab) {
  return {
    id: tab.id,
    title: tab.title,
    active: tab.active,
    url: tab.url
  };
}

function toUserTab(tab, groupTitles) {
  const lastAccessed =
    typeof tab.lastAccessed === "number" && Number.isFinite(tab.lastAccessed)
      ? new Date(tab.lastAccessed).toISOString()
      : undefined;
  const groupTitle =
    typeof tab.groupId === "number" && tab.groupId !== -1 ? groupTitles.get(tab.groupId) : undefined;
  return {
    id: tab.id,
    ...(tab.title ? { title: tab.title } : {}),
    ...(tab.url ? { url: tab.url } : {}),
    ...(lastAccessed ? { lastOpened: lastAccessed } : {}),
    ...(groupTitle ? { tabGroup: groupTitle } : {})
  };
}

function requireTabId(params, command) {
  if (!Number.isInteger(params.tabId)) {
    throw new Error(`${command} requires an integer tabId`);
  }
  return params.tabId;
}

async function createBackgroundTab() {
  const windowId = await chooseWindowId();
  if (typeof windowId === "number") {
    const tab = await chrome.tabs.create({ active: false, url: "about:blank", windowId });
    if (hasTabId(tab)) {
      return tab;
    }
  }
  const win = await chrome.windows.create({
    focused: false,
    type: "normal",
    url: "about:blank"
  });
  const tab = win.tabs?.find(hasTabId);
  if (!tab) {
    throw new Error("Created Chrome window has no tab");
  }
  return tab;
}

async function chooseWindowId() {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  const focused = windows.find((win) => win.focused && typeof win.id === "number");
  return focused?.id ?? windows.find((win) => typeof win.id === "number")?.id ?? null;
}

async function readGroupTitles(tabs) {
  const ids = new Set(
    tabs
      .map((tab) => tab.groupId)
      .filter((groupId) => typeof groupId === "number" && groupId !== -1)
  );
  const entries = await Promise.all(
    [...ids].map(async (groupId) => {
      try {
        const group = await chrome.tabGroups.get(groupId);
        return group.title ? [groupId, group.title] : null;
      } catch {
        return null;
      }
    })
  );
  return new Map(entries.filter(Boolean));
}

function compareLastAccessed(left, right) {
  const byLastAccessed = (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0);
  if (byLastAccessed !== 0) {
    return byLastAccessed;
  }
  const byWindow = (left.windowId ?? 0) - (right.windowId ?? 0);
  return byWindow !== 0 ? byWindow : (left.index ?? 0) - (right.index ?? 0);
}

function parseDate(value, field) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`getUserHistory requires ${field} to be a valid date`);
  }
  return timestamp;
}

function downloadStatus(delta) {
  switch (delta.state?.current) {
    case "complete":
      return "complete";
    case "interrupted":
      return delta.error?.current === "USER_CANCELED" ? "canceled" : "failed";
    case "in_progress":
      return "in_progress";
    default:
      return undefined;
  }
}

function cursorArrivalKey(sessionId, turnId, moveSequence) {
  return `${sessionId}:${turnId}:${moveSequence}`;
}

async function withTimeout(timeoutMs, fn) {
  let timeout;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Timed out after ${timeoutMs}ms waiting for CDP command.`));
        }, timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function startHeartbeat(peer, backend) {
  chrome.alarms.create(HEARTBEAT_ALARM_NAME, { periodInMinutes: 0.5 }).catch(() => {});
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === HEARTBEAT_ALARM_NAME) {
      safeSendNotification(peer, "heartbeat", { at: new Date().toISOString() });
      void backend.getInfo().catch(() => {});
    }
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { extensionInstanceId } = await chrome.storage.local.get("extensionInstanceId");
  if (typeof extensionInstanceId !== "string") {
    await chrome.storage.local.set({ extensionInstanceId: crypto.randomUUID() });
  }
});

const backend = new BrowserBackend();
const transport = new NativeTransport(NATIVE_HOST_NAME);
const peer = new JsonRpcPeer(transport, backend);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_NATIVE_HOST_STATUS") {
    const status = transport.getStatus();
    sendResponse({ ok: status.state === "connected", status, error: status.error });
    return true;
  }
  if (message?.type === "GET_OPEN_BROWSER_USE_CURSOR_STATE") {
    const tabId = typeof sender.tab?.id === "number" ? sender.tab.id : -1;
    sendResponse({ ok: true, state: backend.readCursorOverlayState(tabId) });
    return true;
  }
  if (message?.type === "OPEN_BROWSER_USE_CURSOR_ARRIVED") {
    sendResponse({ ok: backend.notifyCursorArrived(message) });
    return true;
  }
  return false;
});
chrome.debugger.onEvent.addListener((source, method, params) => {
  safeSendNotification(peer, "onCDPEvent", { source, method, params });
});
backend.addDownloadChangeListener((change) => {
  safeSendNotification(peer, "onDownloadChange", change);
});
chrome.downloads.onCreated.addListener((item) => {
  backend.handleDownloadCreated(item);
});
chrome.downloads.onChanged.addListener((delta) => {
  backend.handleDownloadChanged(delta);
});
startHeartbeat(peer, backend);

function safeSendNotification(peer, method, params) {
  try {
    peer.sendNotification(method, params);
  } catch {}
}
