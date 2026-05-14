## [2026-05-14 18:05] | Task: 收口 profile 指引与 JSON 输出

用户诉求：检查 profile PR 合并后的发现，并一起处理需要修的问题。目标是多
profile 且都装了插件时，任务开始前如果用户没指定 profile 就先询问，后续
整轮固定使用所选 profile；代码层面只需要支持切换或连接到不同 profile。

主要改动：

- 修正 `obu profiles --connected --json`：JSON 模式不再追加 `// unresolved
  connected host` footer，保证输出始终是可被脚本和 agent 解析的严格 JSON。
- 补充回归测试，覆盖存在 unresolved connected host 时 JSON 输出仍可
  `json.Unmarshal`。
- 简化 `skills/open-browser-use/SKILL.md` 的多 profile 指引：多个已安装
  profile 时先问用户选哪个；选定后整个任务持续传 `--profile`；只有所选
  profile 未连接时才要求用户打开对应 Chrome，不自动切到其他 profile。

影响文件：

- `cmd/open-browser-use/main.go`
- `cmd/open-browser-use/main_test.go`
- `skills/open-browser-use/SKILL.md`
