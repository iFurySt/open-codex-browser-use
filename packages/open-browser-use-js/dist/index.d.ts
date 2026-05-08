export type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
export type BrowserUseRequestParams = {
    [key: string]: JsonValue;
};
export type OpenBrowserUseClientOptions = {
    socketPath: string;
    sessionId?: string;
    turnId?: string;
    timeoutMs?: number;
};
export declare class OpenBrowserUseClient {
    #private;
    readonly socketPath: string;
    readonly sessionId: string;
    readonly turnId: string;
    readonly timeoutMs: number;
    constructor(options: OpenBrowserUseClientOptions);
    connect(): Promise<this>;
    close(): void;
    request(method: string, params?: BrowserUseRequestParams): Promise<JsonValue>;
    getInfo(): Promise<JsonValue>;
    createTab(): Promise<JsonValue>;
    getTabs(): Promise<JsonValue>;
    attach(tabId: number): Promise<JsonValue>;
    detach(tabId: number): Promise<JsonValue>;
    executeCdp(tabId: number, method: string, commandParams?: BrowserUseRequestParams): Promise<JsonValue>;
}
export declare function encodeFrame(value: JsonValue | Record<string, unknown>): Buffer;
