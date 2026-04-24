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

仍需补强：

- 本地 socket token/peer 授权。
- 细粒度 webview permission request 白名单。
- 跨 turn route 校验。
- 失败路径安全测试。
