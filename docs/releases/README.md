# 发布记录说明

`feature-release-notes.md` 用来记录对用户可感知的新功能、体验优化和重要修复。

## 规则

- 按月份分组，格式使用 `## YYYY-MM`
- 同一个月份里，最新内容插在最上面
- 先写用户价值，再写变更摘要
- 不要把纯内部重构和实现噪音塞进来

## GitHub Release Notes

`.github/workflows/release.yml` 新建 GitHub Release 时会使用 GitHub 自动生成的
release notes，因此有 merged PR 时通常会出现 `What's Changed`、`New
Contributors` 和 `Full Changelog`。

每次 tag push 后都要检查 release body：

```bash
gh release view v0.1.6 --json body,url
```

最低要求：

- release body 不能只有 `Full Changelog`。
- `What's Changed` 至少列出本次用户可感知的 1-3 个变化。
- 保留 `Full Changelog` 链接。
- 如果 GitHub 自动生成了 `New Contributors`，保留它。

## 建议的列

- 日期
- 功能域
- 用户价值
- 变更摘要
