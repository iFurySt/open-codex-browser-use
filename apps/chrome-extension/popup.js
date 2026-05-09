const REPO_URL = "https://github.com/iFurySt/open-codex-browser-use";
const REFRESH_INTERVAL_MS = 5000;

const statusPill = document.getElementById("status-pill");
const statusLabel = document.getElementById("status-label");
const statusMessage = document.getElementById("status-message");
const hostName = document.getElementById("host-name");
const lastChecked = document.getElementById("last-checked");
const errorMessage = document.getElementById("error-message");
const repoLink = document.getElementById("repo-link");
const chromeApi = globalThis.chrome;

void refreshStatus();
setInterval(() => {
  void refreshStatus();
}, REFRESH_INTERVAL_MS);

repoLink?.addEventListener("click", (event) => {
  if (!chromeApi?.tabs?.create) {
    return;
  }
  event.preventDefault();
  void chromeApi.tabs.create({ url: REPO_URL });
});

async function refreshStatus() {
  if (!chromeApi?.runtime?.sendMessage) {
    renderStatus(undefined);
    return;
  }
  try {
    const response = await chromeApi.runtime.sendMessage({ type: "GET_NATIVE_HOST_STATUS" });
    renderStatus(response?.status);
  } catch {
    if (!chromeApi?.storage?.local?.get) {
      renderStatus(undefined);
      return;
    }
    const value = await chromeApi.storage.local.get("OPEN_BROWSER_USE_NATIVE_HOST_STATUS");
    renderStatus(value.OPEN_BROWSER_USE_NATIVE_HOST_STATUS);
  }
}

function renderStatus(status) {
  const state = normalizeState(status?.state);
  const detail = statusDetails(state, status);
  statusPill.dataset.state = state;
  statusLabel.textContent = detail.label;
  statusMessage.textContent = detail.message;
  hostName.textContent = status?.hostName ?? "com.ifuryst.open_browser_use.extension";
  lastChecked.textContent = formatLastChecked(status?.lastChecked);

  const error = typeof status?.error === "string" ? status.error.trim() : "";
  if (error) {
    errorMessage.hidden = false;
    errorMessage.textContent = error;
  } else {
    errorMessage.hidden = true;
    errorMessage.textContent = "";
  }
}

function normalizeState(state) {
  if (state === "connected" || state === "reconnecting" || state === "disconnected") {
    return state;
  }
  return "unknown";
}

function statusDetails(state, status) {
  if (state === "connected") {
    return {
      label: "Connected",
      message: "Native host is connected and ready."
    };
  }
  if (state === "reconnecting") {
    const attempt =
      Number.isInteger(status?.reconnectAttempt) && status.reconnectAttempt > 0
        ? ` Attempt ${status.reconnectAttempt}.`
        : "";
    return {
      label: "Reconnecting",
      message: `Native host is reconnecting.${attempt}`
    };
  }
  if (state === "disconnected") {
    return {
      label: "Disconnected",
      message: "Native host is not connected."
    };
  }
  return {
    label: "Unknown",
    message: "Native host status is unavailable."
  };
}

function formatLastChecked(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unknown";
  }
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
