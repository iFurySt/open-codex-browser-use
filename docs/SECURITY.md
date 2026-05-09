# 安全默认约束

这份文档用于把安全默认值讲清楚，避免实现逐步演进时越走越散。

建议维护的内容：

- 认证与授权约束。
- 密钥和环境变量管理方式。
- 依赖治理与供应链安全要求。
- 数据分级、脱敏与保留策略。
- 对外 API、Webhook、文件上传和沙箱执行的规则。

仓库级的依赖、SBOM 和 provenance 默认能力，统一写在 `docs/SUPPLY_CHAIN_SECURITY.md`。

## Open Browser Use Chrome Route 安全边界

- Chrome route 首版面向开源 runtime/SDK，不复刻 Codex `node_repl` 的
  trusted native pipe bridge。
- JS/Python SDK 默认无站点限制、无 command allowlist、无 user approval；
  这是有意的产品边界，调用方需要自行决定是否加策略。
- Go native host 当前创建 Unix socket 目录和 socket 时使用当前用户权限，
  socket 目标路径默认位于 `/tmp/open-browser-use/`，active socket registry
  写入同目录的 `active.json` 并使用 `0600` 权限。
- Chrome native messaging manifest 使用固定 host name
  `com.ifuryst.open_browser_use.extension`，由 Chrome 的
  `allowed_origins` 限制可启动 extension 来源。
- `open-browser-use setup` 会写入 Chrome External Extensions JSON，让 Chrome
  从 Chrome Web Store 安装正式扩展；用户仍需要接受 Chrome 的扩展启用提示。
  `setup beta` 只用于审核期或非商店路径，会下载 GitHub Release zip，展开为
  unpacked extension，写入稳定 key 后重新生成手动安装 ZIP，并要求用户在 Chrome
  扩展页显式拖入该 ZIP 完成手动安装。
- MV3 extension 使用 `chrome.debugger`、`tabs`、`tabGroups`、`history` 和
  `downloads` 等高权限 API；真实安装前必须让用户明确知道它会操作真实
  Chrome profile。
- Clipboard helpers 通过当前受控 tab 的页面上下文调用
  `navigator.clipboard`，不额外声明 Chrome extension clipboard 权限；调用方仍应把
  clipboard read/write 视为敏感操作，只在用户明确需要时触发。

仍需补强：

- 本地 socket token/peer 授权。
- 失败路径安全测试。
- Chrome route native host 的 client token、peer 校验和审计日志。
