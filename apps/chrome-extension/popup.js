const statusElement = document.getElementById("status");

void refreshStatus();

async function refreshStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_NATIVE_HOST_STATUS" });
    renderStatus(response?.status);
  } catch {
    const value = await chrome.storage.local.get("OPEN_BROWSER_USE_NATIVE_HOST_STATUS");
    renderStatus(value.OPEN_BROWSER_USE_NATIVE_HOST_STATUS);
  }
}

function renderStatus(status) {
  statusElement.textContent =
    status?.state === "connected"
      ? "Native host connected."
      : `Native host ${status?.state ?? "unknown"}.`;
}
