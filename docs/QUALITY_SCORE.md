# 质量评分

用这份文档按产品区域和架构层次记录当前质量水位，方便持续知道最薄弱的地方在哪。

## 建议的评分标准

- `A`：覆盖完整、行为稳定、文档清楚、运行风险低。
- `B`：整体可接受，但还有明确短板。
- `C`：能用，但需要针对性补强。
- `D`：脆弱、缺少规范，或很多行为尚未定义。

## 当前评分

| 区域 | 评分 | 原因 | 下一步 |
| --- | --- | --- | --- |
| 产品面 | B | Codio 已能启动 Electron split UI，chat 已接入 `codex app-server` stdio thread/turn 通知流，支持历史会话、durable resume、steer 和 stop，右侧 IAB 可被 native pipe 驱动。 | 补 Codex plugin manifest，把 Browser Use 工具调用接入真实 turn。 |
| 架构文档 | B | 已有 IAB 逆向 wiki、Codio active plan、app-server 集成文档和 IAB backend 文档。 | M6.5-M8 继续补插件、turn route、input/cursor 边界。 |
| 桌面 UI | B | Electron/Vite/React split layout 已启动；smoke 通过 CDP 打开 `https://example.com/` 并读取标题。 | 补 UI 截图 smoke 和多 conversation 手工验收。 |
| 测试 | B | `typecheck`、`build`、protocol frame 单测、registry 映射单测、native pipe CDP smoke 已可运行。 | 补失败路径测试和 Electron 自动启动集成测试。 |
| 可观测性 | C | native pipe 连接和 RPC method 已有默认脱敏日志。 | 增加 request id、CDP event 分层日志和 renderer/webview 失败日志。 |
| 安全 | C | Renderer Node 禁用、contextIsolation/sandbox、webview route gate、IAB socket `0700/0600` 已作为默认约束。 | 补 socket token/peer 授权、webview permission policy 和跨 turn 测试。 |
