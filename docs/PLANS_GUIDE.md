# Execution Plan 使用说明

execution plan 适合用在那些超出单轮聊天上下文、需要多次推进或风险较高的任务上。

## 什么时候该建 plan

- 任务会跨多个 commit 或多轮工作推进。
- 这次改动会影响架构、协议、数据迁移或其他高风险区域。
- 完成任务依赖阶段性验证、回滚策略或关键决策留痕。
- 可能会有多个人或多个 Agent 在一段时间内共同推进。

## 存放位置

- 进行中的 plan 放在 `docs/exec-plans/active/`
- 已完成的 plan 移到 `docs/exec-plans/completed/`
- 复用模板在 `docs/exec-plans/templates/execution-plan.md`
- 暂不处理但值得保留的债务放到 `docs/exec-plans/tech-debt-tracker.md`

## 维护要求

- 写清目标、范围、约束、风险和验证方式。
- 推进过程和关键决定要落在仓库里，不要只存在聊天记录里。
- 状态变化要同步更新。
- 过期 plan 要及时关闭、归档或清理，保证 active 目录可信。
