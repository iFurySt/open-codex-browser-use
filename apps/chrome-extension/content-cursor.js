const ROOT_ID = "open-browser-use-cursor-root";
const IMAGE_ID = "open-browser-use-cursor-image";
const DEFAULT_X_RATIO = 0.62;
const DEFAULT_Y_RATIO = 0.38;
const CURSOR_WIDTH = 46;
const CURSOR_HEIGHT = 48;
let latestState = {
  cursor: null,
  isVisible: false,
  sessionId: null,
  turnId: null
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "OPEN_BROWSER_USE_PING") {
    sendResponse({ ok: true });
    return true;
  }
  if (message?.type === "OPEN_BROWSER_USE_CURSOR_STATE") {
    latestState = normalizeState(message.state);
    renderState(latestState);
    sendResponse({ ok: true });
    return true;
  }
  if (message?.type === "OPEN_BROWSER_USE_CURSOR") {
    latestState = {
      cursor: {
        moveSequence: message.moveSequence,
        visible: message.visible !== false,
        x: Number(message.x) || 0,
        y: Number(message.y) || 0
      },
      isVisible: true,
      sessionId: typeof message.sessionId === "string" ? message.sessionId : latestState.sessionId,
      turnId: typeof message.turnId === "string" ? message.turnId : latestState.turnId
    };
    renderState(latestState);
    notifyCursorArrived(message);
    sendResponse({ ok: true });
    return true;
  }
  return false;
});

function ensureCursorRoot() {
  let root = document.getElementById(ROOT_ID);
  if (root) {
    return root;
  }
  root = document.createElement("div");
  root.id = ROOT_ID;
  root.setAttribute("aria-hidden", "true");
  root.style.position = "fixed";
  root.style.left = "0";
  root.style.top = "0";
  root.style.width = `${CURSOR_WIDTH}px`;
  root.style.height = `${CURSOR_HEIGHT}px`;
  root.style.opacity = "0";
  root.style.pointerEvents = "none";
  root.style.zIndex = "2147483647";
  root.style.transform = "translate3d(-9999px, -9999px, 0)";
  root.style.transition = "transform 180ms ease, opacity 120ms ease";
  root.style.willChange = "transform, opacity";

  const image = document.createElement("img");
  image.id = IMAGE_ID;
  image.alt = "";
  image.draggable = false;
  image.width = CURSOR_WIDTH;
  image.height = CURSOR_HEIGHT;
  image.src = chrome.runtime.getURL("images/cursor-chat.png");
  image.style.display = "block";
  image.style.width = `${CURSOR_WIDTH}px`;
  image.style.height = `${CURSOR_HEIGHT}px`;
  image.style.transform = "rotate(-44deg)";
  image.style.transformOrigin = "0 0";
  root.appendChild(image);

  document.documentElement.appendChild(root);
  return root;
}

function renderState(state) {
  const root = ensureCursorRoot();
  const cursor = normalizeCursor(state.cursor);
  const visible = state.isVisible === true && cursor?.visible !== false;
  const point = cursor ?? defaultCursorPoint();
  root.style.transform = `translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0)`;
  root.style.opacity = visible ? "1" : "0";
  root.style.transition =
    cursor?.animateMovement === false
      ? "opacity 120ms ease"
      : "transform 180ms ease, opacity 120ms ease";
}

function normalizeState(state) {
  if (!state || typeof state !== "object") {
    return {
      cursor: null,
      isVisible: false,
      sessionId: null,
      turnId: null
    };
  }
  return {
    cursor: normalizeCursor(state.cursor),
    isVisible: state.isVisible === true,
    sessionId: typeof state.sessionId === "string" ? state.sessionId : null,
    turnId: typeof state.turnId === "string" ? state.turnId : null
  };
}

function normalizeCursor(cursor) {
  if (!cursor || typeof cursor !== "object") {
    return null;
  }
  if (!Number.isFinite(cursor.x) || !Number.isFinite(cursor.y)) {
    return null;
  }
  return {
    ...(cursor.animateMovement === false ? { animateMovement: false } : {}),
    ...(Number.isInteger(cursor.moveSequence) ? { moveSequence: cursor.moveSequence } : {}),
    visible: cursor.visible !== false,
    x: cursor.x,
    y: cursor.y
  };
}

function defaultCursorPoint() {
  const viewport = window.visualViewport;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;
  return {
    x: Math.round(width * DEFAULT_X_RATIO),
    y: Math.round(height * DEFAULT_Y_RATIO)
  };
}

function notifyCursorArrived(message) {
  if (
    typeof message.sessionId !== "string" ||
    typeof message.turnId !== "string" ||
    !Number.isInteger(message.moveSequence)
  ) {
    return;
  }
  requestAnimationFrame(() => {
    chrome.runtime
      .sendMessage({
        type: "OPEN_BROWSER_USE_CURSOR_ARRIVED",
        sessionId: message.sessionId,
        turnId: message.turnId,
        moveSequence: message.moveSequence
      })
      .catch(() => {});
  });
}

function refreshCursorState() {
  chrome.runtime
    .sendMessage({ type: "GET_OPEN_BROWSER_USE_CURSOR_STATE" })
    .then((response) => {
      if (response?.ok) {
        latestState = normalizeState(response.state);
        renderState(latestState);
      }
    })
    .catch(() => {});
}

window.addEventListener("resize", () => renderState(latestState));
window.visualViewport?.addEventListener("resize", () => renderState(latestState));
refreshCursorState();
