import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type {
  DidNavigateEvent,
  DidNavigateInPageEvent,
  PageTitleUpdatedEvent,
  WebviewTag
} from "electron";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Globe2,
  MoreHorizontal,
  PanelLeft,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  SlidersHorizontal,
  Square,
  TerminalSquare,
  Wrench
} from "lucide-react";

import type {
  CodexAppServerEvent,
  CodexConnectionStatus,
  CodexThread,
  CodexTurn,
  JsonValue
} from "../shared/contracts";
import "./styles.css";

type MessageRole = "user" | "assistant" | "system" | "reasoning" | "tool";

type Message = {
  id: string;
  role: MessageRole;
  body: string;
  itemId?: string;
  status?: string;
  turnId?: string;
};

type MessageGroup = {
  id: string;
  user?: Message;
  assistant?: Message;
  activity: Message[];
};

const draftThreadId = "draft";
const draftTitle = "New thread";

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "about:blank";
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function connectionLabel(status: CodexConnectionStatus | null): string {
  if (!status) {
    return "Checking";
  }
  if (status.state === "connecting") {
    return "Connecting";
  }
  return status.state === "connected" ? "Connected" : "Disconnected";
}

function browserOriginLabel(rawUrl: string, fallback: string): string {
  try {
    const hostname = new URL(normalizeUrl(rawUrl)).hostname;
    return hostname || fallback;
  } catch {
    return fallback;
  }
}

function isRecord(value: JsonValue | undefined): value is { [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function titleForThread(thread: CodexThread): string {
  return thread.name || thread.preview || "New thread";
}

function relativeAge(timestampSeconds?: number): string {
  if (!timestampSeconds) {
    return "";
  }
  const diffMs = Date.now() - timestampSeconds * 1000;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

function threadGlyph(thread: CodexThread): string {
  return titleForThread(thread).trim().charAt(0).toUpperCase() || "C";
}

function textFromUserInput(input: JsonValue): string {
  if (!isRecord(input)) {
    return "";
  }
  if (input.type === "text" && typeof input.text === "string") {
    return input.text;
  }
  if (typeof input.name === "string") {
    return input.name;
  }
  if (typeof input.path === "string") {
    return input.path;
  }
  if (typeof input.url === "string") {
    return input.url;
  }
  return typeof input.type === "string" ? input.type : "";
}

function messageFromThreadItem(item: JsonValue, turnId: string): Message | null {
  if (!isRecord(item)) {
    return null;
  }
  const type = typeof item.type === "string" ? item.type : "item";
  const id = typeof item.id === "string" ? item.id : `${turnId}:${type}`;
  if (type === "userMessage") {
    const content = Array.isArray(item.content) ? item.content.map(textFromUserInput).filter(Boolean) : [];
    return {
      id,
      itemId: id,
      role: "user",
      body: content.join("\n"),
      turnId
    };
  }
  if (type === "agentMessage") {
    return {
      id,
      itemId: id,
      role: "assistant",
      body: typeof item.text === "string" ? item.text : "",
      turnId
    };
  }
  if (type === "reasoning") {
    const summary = Array.isArray(item.summary) ? item.summary.filter((part) => typeof part === "string") : [];
    const content = Array.isArray(item.content) ? item.content.filter((part) => typeof part === "string") : [];
    return {
      id,
      itemId: id,
      role: "reasoning",
      body: [...summary, ...content].join("\n"),
      turnId
    };
  }
  if (type === "plan") {
    return {
      id,
      itemId: id,
      role: "reasoning",
      body: typeof item.text === "string" ? item.text : "Plan updated",
      turnId
    };
  }
  if (type === "commandExecution") {
    const output = typeof item.aggregatedOutput === "string" ? `\n${item.aggregatedOutput}` : "";
    return {
      id,
      itemId: id,
      role: "tool",
      status: typeof item.status === "string" ? item.status : undefined,
      body: `$ ${typeof item.command === "string" ? item.command : "command"}${output}`,
      turnId
    };
  }
  if (type === "mcpToolCall") {
    return {
      id,
      itemId: id,
      role: "tool",
      status: typeof item.status === "string" ? item.status : undefined,
      body: `${typeof item.server === "string" ? item.server : "mcp"}.${
        typeof item.tool === "string" ? item.tool : "tool"
      }`,
      turnId
    };
  }
  if (type === "dynamicToolCall") {
    return {
      id,
      itemId: id,
      role: "tool",
      status: typeof item.status === "string" ? item.status : undefined,
      body: `${typeof item.namespace === "string" ? `${item.namespace}.` : ""}${
        typeof item.tool === "string" ? item.tool : "tool"
      }`,
      turnId
    };
  }
  if (type === "webSearch") {
    return {
      id,
      itemId: id,
      role: "tool",
      body: `web search: ${typeof item.query === "string" ? item.query : ""}`,
      turnId
    };
  }
  return null;
}

function messagesFromThread(thread: CodexThread): Message[] {
  const turns = Array.isArray(thread.turns) ? thread.turns : [];
  return turns.flatMap((turn) => {
    const items = Array.isArray(turn.items) ? turn.items : [];
    return items
      .map((item) => messageFromThreadItem(item, turn.id))
      .filter((message): message is Message => Boolean(message));
  });
}

function upsertThread(threads: CodexThread[], thread: CodexThread): CodexThread[] {
  const normalized = { ...thread };
  const rest = threads.filter((candidate) => candidate.id !== thread.id);
  return [normalized, ...rest].sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0));
}

function appendMessage(map: Record<string, Message[]>, threadId: string, message: Message): Record<string, Message[]> {
  return {
    ...map,
    [threadId]: [...(map[threadId] ?? []), message]
  };
}

function upsertItemMessage(
  map: Record<string, Message[]>,
  threadId: string,
  message: Message
): Record<string, Message[]> {
  const current = map[threadId] ?? [];
  const index = current.findIndex((candidate) => candidate.itemId === message.itemId);
  if (index < 0) {
    return {
      ...map,
      [threadId]: [...current, message]
    };
  }
  return {
    ...map,
    [threadId]: current.map((candidate, candidateIndex) =>
      candidateIndex === index ? { ...candidate, ...message } : candidate
    )
  };
}

function appendItemDelta(
  map: Record<string, Message[]>,
  threadId: string,
  itemId: string,
  delta: string,
  role: MessageRole
): Record<string, Message[]> {
  const current = map[threadId] ?? [];
  const existing = current.find((message) => message.itemId === itemId);
  if (existing) {
    return {
      ...map,
      [threadId]: current.map((message) =>
        message.itemId === itemId ? { ...message, body: `${message.body}${delta}` } : message
      )
    };
  }
  return {
    ...map,
    [threadId]: [
      ...current,
      {
        id: `${role}-${itemId}`,
        itemId,
        role,
        body: delta
      }
    ]
  };
}

function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      groups.push({
        id: message.turnId ?? message.id,
        user: message,
        activity: []
      });
      continue;
    }

    const last = groups.at(-1);
    if (!last) {
      groups.push({
        id: message.turnId ?? message.id,
        activity: [message]
      });
      continue;
    }

    if (message.role === "assistant") {
      if (last.assistant) {
        last.activity.push(last.assistant);
      }
      last.assistant = message;
      continue;
    }

    last.activity.push(message);
  }

  return groups;
}

function messageIcon(role: MessageRole): JSX.Element | null {
  if (role === "assistant") {
    return <Bot size={15} />;
  }
  if (role === "reasoning") {
    return <Clock3 size={15} />;
  }
  if (role === "tool") {
    return <Wrench size={15} />;
  }
  if (role === "system") {
    return <TerminalSquare size={15} />;
  }
  return null;
}

function App(): JSX.Element {
  const [threads, setThreads] = useState<CodexThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({
    [draftThreadId]: []
  });
  const [activeTurns, setActiveTurns] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [browserUrl, setBrowserUrl] = useState("about:blank");
  const [addressValue, setAddressValue] = useState("https://example.com");
  const [pageTitle, setPageTitle] = useState("Blank");
  const [isLoading, setIsLoading] = useState(false);
  const [appStatus, setAppStatus] = useState<CodexConnectionStatus | null>(null);
  const [routeReady, setRouteReady] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [modelName, setModelName] = useState("GPT-5.5");
  const [reasoningEffort, setReasoningEffort] = useState("Medium");
  const webviewRef = useRef<WebviewTag | null>(null);
  const activeTurnRouteRef = useRef<{ conversationId: string; turnId: string } | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const modelMenuRef = useRef<HTMLDivElement | null>(null);

  const conversationId = activeThreadId ?? draftThreadId;
  const activeThread = activeThreadId ? threads.find((thread) => thread.id === activeThreadId) : null;
  const activeTitle = activeThread ? titleForThread(activeThread) : draftTitle;
  const activeMessages = messagesByThread[conversationId] ?? [];
  const groupedMessages = groupMessages(activeMessages);
  const activeTurnId = activeThreadId ? activeTurns[activeThreadId] ?? null : null;
  const canSend = draft.trim().length > 0 && appStatus?.state === "connected";

  const partition = useMemo(
    () => `persist:open-codex-browser-route:${encodeURIComponent(conversationId)}`,
    [conversationId]
  );

  useEffect(() => {
    void window.codio.getAppInfo().then((info) => {
      setAppStatus(info.codex);
    });
    void window.codio
      .connectCodex()
      .then((status) => {
        setAppStatus(status);
        return refreshThreads();
      })
      .catch((error: unknown) => {
        setAppStatus({
          state: "disconnected",
          transport: "stdio",
          detail: error instanceof Error ? error.message : "Failed to connect to Codex app-server."
        });
      });
  }, []);

  useEffect(() => {
    return window.codio.onCodexEvent((event) => {
      handleCodexEvent(event);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showModelMenu) {
      return;
    }
    const handlePointerDown = (event: PointerEvent): void => {
      if (!modelMenuRef.current?.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [showModelMenu]);

  useEffect(() => {
    let cancelled = false;
    setRouteReady(false);
    void window.codio
      .captureBrowserRoute({
        conversationId,
        url: browserUrl
      })
      .then(() => {
        if (!cancelled) {
          setRouteReady(true);
        }
      });

    return () => {
      cancelled = true;
      void window.codio.releaseBrowserRoute(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!routeReady) {
      return;
    }
    void window.codio.captureBrowserRoute({
      conversationId,
      url: browserUrl
    });
  }, [browserUrl, conversationId, routeReady]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) {
      return;
    }

    const handleStart = (): void => setIsLoading(true);
    const handleStop = (): void => setIsLoading(false);
    const handleTitle = (event: PageTitleUpdatedEvent): void => {
      setPageTitle(event.title || "Untitled");
    };
    const handleNavigate = (event: DidNavigateEvent | DidNavigateInPageEvent): void => {
      setAddressValue(event.url);
      setBrowserUrl(event.url);
    };

    webview.addEventListener("did-start-loading", handleStart);
    webview.addEventListener("did-stop-loading", handleStop);
    webview.addEventListener("page-title-updated", handleTitle);
    webview.addEventListener("did-navigate", handleNavigate);
    webview.addEventListener("did-navigate-in-page", handleNavigate);

    return () => {
      webview.removeEventListener("did-start-loading", handleStart);
      webview.removeEventListener("did-stop-loading", handleStop);
      webview.removeEventListener("page-title-updated", handleTitle);
      webview.removeEventListener("did-navigate", handleNavigate);
      webview.removeEventListener("did-navigate-in-page", handleNavigate);
    };
  }, [browserUrl, routeReady]);

  async function refreshThreads(): Promise<void> {
    const response = await window.codio.listCodexThreads();
    setThreads(response.threads);
  }

  async function openThread(threadId: string): Promise<void> {
    setIsLoadingThread(true);
    try {
      const response = await window.codio.readCodexThread(threadId);
      setThreads((current) => upsertThread(current, response.thread));
      setMessagesByThread((current) => ({
        ...current,
        [threadId]: messagesFromThread(response.thread)
      }));
      setActiveThreadId(threadId);
    } finally {
      setIsLoadingThread(false);
    }
  }

  function newThread(): void {
    setActiveThreadId(null);
    setDraft("");
    setMessagesByThread((current) => ({
      ...current,
      [draftThreadId]: []
    }));
  }

  function handleCodexEvent(event: CodexAppServerEvent): void {
    if (event.type === "status") {
      setAppStatus(event.status);
      return;
    }

    const params = isRecord(event.params) ? event.params : {};
    if (event.method === "thread/started" && isRecord(params.thread)) {
      const thread = params.thread as CodexThread;
      setThreads((current) => upsertThread(current, thread));
      return;
    }

    if (event.method === "thread/name/updated") {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      const name = typeof params.name === "string" ? params.name : null;
      if (threadId && name) {
        setThreads((current) =>
          current.map((thread) => (thread.id === threadId ? { ...thread, name } : thread))
        );
      }
      return;
    }

    if (event.method === "turn/started" && isRecord(params.turn)) {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      const turnId = typeof params.turn.id === "string" ? params.turn.id : null;
      if (threadId && turnId) {
        setActiveTurns((current) => ({ ...current, [threadId]: turnId }));
      }
      return;
    }

    if (event.method === "item/agentMessage/delta") {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      const itemId = typeof params.itemId === "string" ? params.itemId : null;
      const delta = typeof params.delta === "string" ? params.delta : "";
      if (threadId && itemId && delta) {
        setMessagesByThread((current) => appendItemDelta(current, threadId, itemId, delta, "assistant"));
      }
      return;
    }

    if (event.method === "item/reasoning/summaryTextDelta" || event.method === "item/reasoning/textDelta") {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      const itemId = typeof params.itemId === "string" ? params.itemId : null;
      const delta = typeof params.delta === "string" ? params.delta : "";
      if (threadId && itemId && delta) {
        setMessagesByThread((current) => appendItemDelta(current, threadId, itemId, delta, "reasoning"));
      }
      return;
    }

    if (event.method === "item/commandExecution/outputDelta") {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      const itemId = typeof params.itemId === "string" ? params.itemId : null;
      const delta = typeof params.delta === "string" ? params.delta : "";
      if (threadId && itemId && delta) {
        setMessagesByThread((current) => appendItemDelta(current, threadId, itemId, delta, "tool"));
      }
      return;
    }

    if ((event.method === "item/started" || event.method === "item/completed") && isRecord(params.item)) {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      const turnId = typeof params.turnId === "string" ? params.turnId : "turn";
      const message = messageFromThreadItem(params.item, turnId);
      if (threadId && message && message.role !== "user") {
        setMessagesByThread((current) => upsertItemMessage(current, threadId, message));
      }
      return;
    }

    if (event.method === "warning" && typeof params.message === "string") {
      setMessagesByThread((current) =>
        appendMessage(current, conversationId, {
          id: `warning-${Date.now()}`,
          role: "system",
          body: params.message as string
        })
      );
      return;
    }

    if (event.method === "turn/completed" && isRecord(params.turn)) {
      const threadId = typeof params.threadId === "string" ? params.threadId : null;
      if (threadId) {
        setActiveTurns((current) => {
          const next = { ...current };
          delete next[threadId];
          return next;
        });
        void refreshThreads();
      }
      const activeRoute = activeTurnRouteRef.current;
      if (activeRoute) {
        void window.codio.releaseBrowserTurnRoute(activeRoute.conversationId, activeRoute.turnId);
        activeTurnRouteRef.current = null;
      }
    }
  }

  async function submitMessage(): Promise<void> {
    const body = draft.trim();
    if (!body || appStatus?.state !== "connected") {
      return;
    }

    const optimisticThreadId = activeThreadId ?? draftThreadId;
    setMessagesByThread((current) =>
        appendMessage(current, optimisticThreadId, {
          id: `user-${Date.now()}`,
          role: "user",
          body
        })
      );
    setDraft("");

    try {
      const expectedTurnId = activeThreadId ? activeTurns[activeThreadId] ?? null : null;
      const response = await window.codio.sendChatMessage({
        threadId: activeThreadId,
        expectedTurnId,
        text: body
      });
      setThreads((current) => upsertThread(current, response.thread));
      setActiveThreadId(response.threadId);
      if (!activeThreadId) {
        setMessagesByThread((current) => {
          const draftMessages = current[draftThreadId] ?? [];
          const responseMessages = current[response.threadId] ?? [];
          const next = { ...current, [response.threadId]: [...responseMessages, ...draftMessages] };
          delete next[draftThreadId];
          return next;
        });
      }
      setActiveTurns((current) => ({ ...current, [response.threadId]: response.turn.id }));
      activeTurnRouteRef.current = {
        conversationId: response.threadId,
        turnId: response.turn.id
      };
      void window.codio.captureBrowserTurnRoute({
        conversationId: response.threadId,
        turnId: response.turn.id,
        url: browserUrl
      });
    } catch (error) {
      setMessagesByThread((current) =>
        appendMessage(current, optimisticThreadId, {
          id: `system-${Date.now()}`,
          role: "system",
          body: error instanceof Error ? error.message : "Failed to start Codex turn."
        })
      );
    }
  }

  async function stopTurn(): Promise<void> {
    if (!activeThreadId || !activeTurnId) {
      return;
    }
    await window.codio.interruptCodexTurn({
      threadId: activeThreadId,
      turnId: activeTurnId
    });
    setActiveTurns((current) => {
      const next = { ...current };
      delete next[activeThreadId];
      return next;
    });
  }

  function navigateToAddress(): void {
    const nextUrl = normalizeUrl(addressValue);
    setBrowserUrl(nextUrl);
    setAddressValue(nextUrl);
  }

  function goBack(): void {
    if (webviewRef.current?.canGoBack()) {
      webviewRef.current.goBack();
    }
  }

  function goForward(): void {
    if (webviewRef.current?.canGoForward()) {
      webviewRef.current.goForward();
    }
  }

  function reloadOrStop(): void {
    if (!webviewRef.current) {
      return;
    }
    if (isLoading) {
      webviewRef.current.stop();
      return;
    }
    webviewRef.current.reload();
  }

  function toggleGroup(groupId: string): void {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId]
    }));
  }

  async function copyMessage(message: Message): Promise<void> {
    if (!message.body) {
      return;
    }
    await navigator.clipboard.writeText(message.body);
    setCopiedMessageId(message.id);
    if (copyResetTimerRef.current) {
      window.clearTimeout(copyResetTimerRef.current);
    }
    copyResetTimerRef.current = window.setTimeout(() => {
      setCopiedMessageId(null);
    }, 1200);
  }

  return (
    <main className={`app-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar" aria-label="Threads">
        <div className="sidebar-header">
          <button
            className="icon-button sidebar-toggle"
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            <PanelLeft size={17} />
          </button>
          <button className="new-chat-button" type="button" onClick={newThread}>
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>

        <div className="sidebar-section">
          {threads.map((thread) => (
            <button
              className={`thread-row ${activeThreadId === thread.id ? "active" : ""}`}
              key={thread.id}
              type="button"
              onClick={() => {
                void openThread(thread.id);
              }}
            >
              <span className="thread-row-glyph">{threadGlyph(thread)}</span>
              <span className="thread-row-title">{titleForThread(thread)}</span>
              {!sidebarCollapsed ? <span className="thread-row-age">{relativeAge(thread.updatedAt)}</span> : null}
            </button>
          ))}
          {threads.length === 0 ? <div className="empty-sidebar">No history yet</div> : null}
        </div>
      </aside>

      <section className="chat-pane" aria-label="Chat">
        <header className="pane-header">
          <button
            className="icon-button"
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            <PanelLeft size={17} />
          </button>
          <div className="thread-title" title={activeTitle}>
            {activeTitle}
          </div>
          <button className="icon-button" type="button" aria-label="New thread" onClick={newThread}>
            <Plus size={17} />
          </button>
          <button className="icon-button" type="button" aria-label="More">
            <MoreHorizontal size={17} />
          </button>
        </header>

        <div className="messages">
          {isLoadingThread ? <div className="empty-thread">Loading thread...</div> : null}
          {!isLoadingThread && groupedMessages.length === 0 ? (
            <div className="empty-thread">{connectionLabel(appStatus)}</div>
          ) : null}
          {groupedMessages.map((group) => {
            const isExpanded = expandedGroups[group.id] ?? false;
            const hasActivity = group.activity.length > 0;
            return (
              <section className="turn-group" key={group.id}>
                {group.user ? (
                  <article className="message message-user">
                    <div className="message-content">
                      <div className="message-toolbar">
                        <span className="message-toolbar-spacer" />
                        <button
                          className="message-copy"
                          type="button"
                          aria-label="Copy message"
                          onClick={() => void copyMessage(group.user as Message)}
                        >
                          {copiedMessageId === group.user.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="message-body">{group.user.body}</div>
                    </div>
                  </article>
                ) : null}

                {hasActivity ? (
                  <div className={`activity-block${isExpanded ? " expanded" : ""}`}>
                    <button className="activity-summary" type="button" onClick={() => toggleGroup(group.id)}>
                      {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      <Sparkles size={15} />
                      <span>{group.activity.length} steps</span>
                    </button>
                    {isExpanded ? (
                      <div className="activity-items">
                        {group.activity.map((message) => (
                          <article className={`message message-${message.role}`} key={message.id}>
                            <div className="message-icon">{messageIcon(message.role)}</div>
                            <div className="message-content">
                              {message.status ? <div className="message-status">{message.status}</div> : null}
                              <div className="message-body">{message.body}</div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {group.assistant ? (
                  <article className="message message-assistant">
                    <div className="message-icon">{messageIcon("assistant")}</div>
                    <div className="message-content final-answer">
                      <div className="message-toolbar">
                        <span className="message-toolbar-spacer" />
                        <button
                          className="message-copy"
                          type="button"
                          aria-label="Copy conclusion"
                          onClick={() => void copyMessage(group.assistant as Message)}
                        >
                          {copiedMessageId === group.assistant.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="message-body">{group.assistant.body}</div>
                    </div>
                  </article>
                ) : null}
              </section>
            );
          })}
        </div>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            void submitMessage();
          }}
        >
          <textarea
            aria-label="Message"
            placeholder={activeTurnId ? "Send a steering message" : "Ask Codio"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitMessage();
              }
            }}
          />
          <div className="composer-footer">
            <div className="composer-tools">
              <button className="composer-tool" type="button" aria-label="Add context">
                <Plus size={18} />
              </button>
              <span className="access-pill">Full access</span>
            </div>
            <div className="composer-actions">
              <div className="model-menu-wrap" ref={modelMenuRef}>
                <button
                  className="model-pill"
                  type="button"
                  aria-label="Adjust model"
                  onClick={() => setShowModelMenu((current) => !current)}
                >
                  <SlidersHorizontal size={13} />
                  <span>{modelName.replace("GPT-", "")}</span>
                  <span>{reasoningEffort}</span>
                  <ChevronDown size={13} />
                </button>
                {showModelMenu ? (
                  <div className="model-menu">
                    <div className="model-menu-label">Intelligence</div>
                    {["Low", "Medium", "High", "Extra High"].map((option) => (
                      <button
                        className={`model-option${reasoningEffort === option ? " selected" : ""}`}
                        key={option}
                        type="button"
                        onClick={() => {
                          setReasoningEffort(option);
                          setShowModelMenu(false);
                        }}
                      >
                        <span>{option}</span>
                        {reasoningEffort === option ? <Check size={16} /> : null}
                      </button>
                    ))}
                    <div className="model-menu-divider" />
                    {["GPT-5.5", "GPT-5.4"].map((option) => (
                      <button
                        className={`model-option${modelName === option ? " selected" : ""}`}
                        key={option}
                        type="button"
                        onClick={() => {
                          setModelName(option);
                          setShowModelMenu(false);
                        }}
                      >
                        <span>{option}</span>
                        {modelName === option ? <Check size={16} /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {activeTurnId ? (
                <button className="send-button" type="button" aria-label="Stop" onClick={() => void stopTurn()}>
                  <Square size={16} />
                </button>
              ) : (
                <button className="send-button" type="submit" aria-label="Send" disabled={!canSend}>
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </form>
        {activeTurnId ? <div className="turn-status">Running turn {activeTurnId}</div> : null}
      </section>

      <section className="browser-pane" aria-label="Browser">
        <header className="browser-tabs">
          <div className="browser-tab">Summary</div>
          <div className="browser-tab">index.html</div>
          <div className="browser-tab active">
            <Globe2 size={15} />
            Launch permission
          </div>
          <button className="icon-button" type="button" aria-label="New tab">
            <Plus size={17} />
          </button>
        </header>
        <header className="browser-toolbar">
          <button className="icon-button" type="button" aria-label="Back" onClick={goBack}>
            <ArrowLeft size={18} />
          </button>
          <button className="icon-button" type="button" aria-label="Forward" onClick={goForward}>
            <ArrowRight size={18} />
          </button>
          <button className="icon-button" type="button" aria-label={isLoading ? "Stop" : "Reload"} onClick={reloadOrStop}>
            {isLoading ? <Square size={16} /> : <RefreshCw size={17} />}
          </button>
          <form
            className="address-form"
            onSubmit={(event) => {
              event.preventDefault();
              navigateToAddress();
            }}
          >
            <Globe2 size={17} />
            <input
              aria-label="URL"
              value={addressValue}
              onChange={(event) => setAddressValue(event.target.value)}
            />
          </form>
          <div className="browser-origin">{browserOriginLabel(addressValue, pageTitle)}</div>
        </header>
        {routeReady ? (
          <webview
            ref={webviewRef}
            className="browser-webview"
            src={browserUrl}
            partition={partition}
            allowpopups={true}
          />
        ) : (
          <div className="browser-placeholder" />
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
