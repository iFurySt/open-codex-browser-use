const ROOT_ID = "open-browser-use-cursor-root";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "OPEN_BROWSER_USE_PING") {
    sendResponse({ ok: true });
    return true;
  }
  if (message?.type === "OPEN_BROWSER_USE_CURSOR") {
    const root = ensureCursorRoot();
    root.style.transform = `translate(${Number(message.x) || 0}px, ${Number(message.y) || 0}px)`;
    root.style.opacity = message.visible === false ? "0" : "1";
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
  root.style.position = "fixed";
  root.style.left = "0";
  root.style.top = "0";
  root.style.width = "14px";
  root.style.height = "14px";
  root.style.border = "2px solid #0f6bff";
  root.style.borderRadius = "999px";
  root.style.background = "rgba(15, 107, 255, 0.18)";
  root.style.pointerEvents = "none";
  root.style.zIndex = "2147483647";
  root.style.transition = "transform 120ms ease, opacity 80ms ease";
  document.documentElement.appendChild(root);
  return root;
}
