chrome.storage.local.get("OPEN_BROWSER_USE_NATIVE_HOST_STATUS").then((value) => {
  const status = value.OPEN_BROWSER_USE_NATIVE_HOST_STATUS;
  const text =
    status?.state === "connected"
      ? "Native host connected."
      : `Native host ${status?.state ?? "unknown"}.`;
  document.getElementById("status").textContent = text;
});
