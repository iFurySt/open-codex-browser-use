# Codio Chat Workspace

## 目标

快速补齐 Codio 左侧 chat 体验，使它更接近 Codex.app：

- 左侧 sidebar 显示历史会话。
- 支持新会话、历史会话切换和恢复历史消息。
- 聊天窗口支持发送 query、连续发送 steer、停止当前 turn。
- 渲染用户消息、assistant 消息、reasoning、plan、command/tool 调用和
  streaming delta。

## 协议来源

源码参考：

- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/ClientRequest.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/ServerNotification.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/v2/ThreadListParams.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/v2/ThreadReadParams.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/v2/TurnStartParams.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/v2/TurnSteerParams.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/v2/TurnInterruptParams.ts`
- `/Users/bytedance/projects/github/codex/codex-rs/app-server-protocol/schema/typescript/v2/ThreadItem.ts`

## Todo

- [x] Main process app-server client 支持 `thread/list`。
- [x] Main process app-server client 支持 `thread/read(includeTurns=true)`。
- [x] Main process app-server client 支持 `turn/steer`。
- [x] Main process app-server client 支持 `turn/interrupt`。
- [x] 新建 thread 默认持久化，能出现在历史列表。
- [x] Renderer sidebar 显示 history threads、new thread、active 状态。
- [x] Renderer 切换历史会话时读取 turns/items 并恢复消息。
- [x] Renderer 发消息时按 active turn 判断 `turn/start` 或 `turn/steer`。
- [x] Renderer 支持停止当前 turn。
- [x] Renderer 渲染 `userMessage`、`agentMessage`、`reasoning`、`plan`、
      `commandExecution`、`mcpToolCall`、`dynamicToolCall`。
- [x] Renderer 处理 streaming delta：
      `item/agentMessage/delta`、`item/reasoning/*`、
      `item/commandExecution/outputDelta`。
- [x] 保持 IAB route 使用 active thread id；新会话未创建 thread 前用
      local draft id。
- [x] 验证：`pnpm typecheck`、`pnpm build`。
- [x] 启动 Electron，用 Computer Use 检查 sidebar/chat/composer 不重叠。

## 当前边界

- 不做真实 Codex.app 私有 UI 复刻，只做开源近似体验。
- 不实现附件、mentions、skill picker。
- 不实现 thread archive/search 的完整管理。
