import { createConnection } from "node:net";
import { endianness } from "node:os";
const headerBytes = 4;
export class OpenBrowserUseClient {
    socketPath;
    sessionId;
    turnId;
    timeoutMs;
    #socket = null;
    #pendingData = Buffer.alloc(0);
    #nextId = 1;
    #pending = new Map();
    #notificationHandlers = new Set();
    constructor(options) {
        this.socketPath = options.socketPath;
        this.sessionId = options.sessionId ?? "open-browser-use-js";
        this.turnId = options.turnId ?? `turn-${Date.now()}`;
        this.timeoutMs = options.timeoutMs ?? 10_000;
    }
    async connect() {
        if (this.#socket) {
            return this;
        }
        const socket = createConnection(this.socketPath);
        this.#socket = socket;
        socket.on("data", (chunk) => this.#handleData(Buffer.from(chunk)));
        socket.on("close", () => this.#rejectAll(new Error("Open Browser Use socket closed")));
        socket.on("error", (error) => this.#rejectAll(error));
        await new Promise((resolve, reject) => {
            socket.once("connect", resolve);
            socket.once("error", reject);
        });
        return this;
    }
    close() {
        this.#socket?.end();
        this.#socket = null;
    }
    onNotification(handler) {
        this.#notificationHandlers.add(handler);
        return () => {
            this.#notificationHandlers.delete(handler);
        };
    }
    async request(method, params = {}) {
        await this.connect();
        const socket = this.#socket;
        if (!socket) {
            throw new Error("Open Browser Use socket is not connected");
        }
        const id = String(this.#nextId++);
        const mergedParams = {
            session_id: this.sessionId,
            turn_id: this.turnId,
            ...params
        };
        const message = {
            jsonrpc: "2.0",
            id,
            method,
            params: mergedParams
        };
        const payload = encodeFrame(message);
        const promise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.#pending.delete(id);
                reject(new Error(`Open Browser Use request timed out: ${method}`));
            }, this.timeoutMs);
            this.#pending.set(id, { resolve, reject, timeout });
        });
        socket.write(payload);
        return await promise;
    }
    getInfo() {
        return this.request("getInfo");
    }
    createTab() {
        return this.request("createTab");
    }
    getTabs() {
        return this.request("getTabs");
    }
    getUserTabs() {
        return this.request("getUserTabs");
    }
    getUserHistory(params = {}) {
        return this.request("getUserHistory", params);
    }
    claimUserTab(tabId) {
        return this.request("claimUserTab", { tabId });
    }
    finalizeTabs(keep) {
        return this.request("finalizeTabs", { keep });
    }
    nameSession(name) {
        return this.request("nameSession", { name });
    }
    attach(tabId) {
        return this.request("attach", { tabId });
    }
    detach(tabId) {
        return this.request("detach", { tabId });
    }
    executeCdp(tabId, method, commandParams = {}) {
        return this.request("executeCdp", {
            target: { tabId },
            method,
            commandParams
        });
    }
    moveMouse(tabId, x, y, waitForArrival = true) {
        return this.request("moveMouse", { tabId, x, y, waitForArrival });
    }
    waitForFileChooser(tabId, timeoutMs) {
        return this.request("waitForFileChooser", {
            tabId,
            ...(timeoutMs === undefined ? {} : { timeoutMs })
        });
    }
    setFileChooserFiles(fileChooserId, files) {
        return this.request("setFileChooserFiles", { fileChooserId, files });
    }
    waitForDownload(tabId, timeoutMs) {
        return this.request("waitForDownload", {
            tabId,
            ...(timeoutMs === undefined ? {} : { timeoutMs })
        });
    }
    downloadPath(downloadId, timeoutMs) {
        return this.request("downloadPath", {
            downloadId,
            ...(timeoutMs === undefined ? {} : { timeoutMs })
        });
    }
    browserUserHistory(params = {}) {
        return this.getUserHistory(params);
    }
    readClipboardText(tabId) {
        return this.request("readClipboardText", { tabId });
    }
    writeClipboardText(tabId, text) {
        return this.request("writeClipboardText", { tabId, text });
    }
    readClipboard(tabId) {
        return this.request("readClipboard", { tabId });
    }
    writeClipboard(tabId, items) {
        return this.request("writeClipboard", { tabId, items });
    }
    turnEnded() {
        return this.request("turnEnded");
    }
    #handleData(chunk) {
        this.#pendingData = Buffer.concat([this.#pendingData, chunk]);
        while (this.#pendingData.length >= headerBytes) {
            const length = endianness() === "LE"
                ? this.#pendingData.readUInt32LE(0)
                : this.#pendingData.readUInt32BE(0);
            const total = headerBytes + length;
            if (this.#pendingData.length < total) {
                return;
            }
            const payload = this.#pendingData.subarray(headerBytes, total);
            this.#pendingData = this.#pendingData.subarray(total);
            this.#handleMessage(JSON.parse(payload.toString("utf8")));
        }
    }
    #handleMessage(message) {
        if (!isObject(message)) {
            return;
        }
        const id = typeof message.id === "string" || typeof message.id === "number" ? String(message.id) : null;
        if (!id && typeof message.method === "string") {
            const notification = {
                method: message.method,
                params: message.params
            };
            for (const handler of this.#notificationHandlers) {
                handler(notification);
            }
            return;
        }
        if (!id) {
            return;
        }
        const pending = this.#pending.get(id);
        if (!pending) {
            return;
        }
        this.#pending.delete(id);
        clearTimeout(pending.timeout);
        if (isObject(message.error)) {
            pending.reject(new Error(String(message.error.message ?? "Open Browser Use request failed")));
            return;
        }
        pending.resolve((message.result ?? null));
    }
    #rejectAll(error) {
        for (const [id, pending] of this.#pending) {
            this.#pending.delete(id);
            clearTimeout(pending.timeout);
            pending.reject(error);
        }
    }
}
export function encodeFrame(value) {
    const payload = Buffer.from(JSON.stringify(value), "utf8");
    const frame = Buffer.alloc(headerBytes + payload.length);
    if (endianness() === "LE") {
        frame.writeUInt32LE(payload.length, 0);
    }
    else {
        frame.writeUInt32BE(payload.length, 0);
    }
    payload.copy(frame, headerBytes);
    return frame;
}
function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
