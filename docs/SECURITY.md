# 安全默认约束

这份文档用于把安全默认值讲清楚，避免实现逐步演进时越走越散。

建议维护的内容：

- 认证与授权约束。
- 密钥和环境变量管理方式。
- 依赖治理与供应链安全要求。
- 数据分级、脱敏与保留策略。
- 对外 API、Webhook、文件上传和沙箱执行的规则。

仓库级的依赖、SBOM 和 provenance 默认能力，统一写在 `docs/SUPPLY_CHAIN_SECURITY.md`。

## Codio 当前安全边界

- Renderer 禁用 Node，启用 `contextIsolation` 和 `sandbox`。
- Preload 只暴露 `window.codio` 下的窄 IPC surface。
- webview attach 必须携带 main process 已捕获的 route-bearing partition；
  未知 route 会被拒绝。
- guest webview 强制使用 `nodeIntegration=false`、`contextIsolation=true`、
  `sandbox=true`。
- shared browser partition 的 webview permission request 首版默认拒绝。
- Browser Use native pipe 目录设置为 `0700`，socket 设置为 `0600`。
- 首版 IAB capabilities 明确声明 downloads、file uploads、media downloads
  为不支持。

## Open Browser Use Chrome Route 安全边界

- Chrome route 首版面向开源 runtime/SDK，不复刻 Codex `node_repl` 的
  trusted native pipe bridge。
- JS/Python SDK 默认无站点限制、无 command allowlist、无 user approval；
  这是有意的产品边界，调用方需要自行决定是否加策略。
- Go native host 当前创建 Unix socket 目录和 socket 时使用当前用户权限，
  socket 目标路径默认位于 `/tmp/open-browser-use/`，active socket registry
  写入同目录的 `active.json` 并使用 `0600` 权限。
- Chrome native messaging manifest 使用固定 host name
  `com.ifuryst.open-computer-use.extension`，由 Chrome 的
  `allowed_origins` 限制可启动 extension 来源。
- MV3 extension 使用 `chrome.debugger`、`tabs`、`tabGroups`、`history` 和
  `downloads` 等高权限 API；真实安装前必须让用户明确知道它会操作真实
  Chrome profile。

仍需补强：

- 本地 socket token/peer 授权。
- 细粒度 webview permission request 白名单。
- 跨 turn route 校验。
- 失败路径安全测试。
- Chrome route native host 的 client token、peer 校验和审计日志。
