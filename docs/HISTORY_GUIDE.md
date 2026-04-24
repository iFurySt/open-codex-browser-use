# 代码变更历史记录规范

`docs/histories/` 用来记录已经完成的代码变更任务。纯问答、调研、分析类任务默认不需要记 history，除非最后确实改了仓库内容。

## 基本要求

- 每个完成的代码变更任务，都应该对应一份 history 文件，或补充到同一任务既有的 history 文件里。
- 用户原始诉求可以适当压缩，但要保留关键信息。
- 不要把敏感信息、本地路径、密钥或原始日志细节直接写进去。
- 同一个任务跨多轮推进时，继续维护同一个 history，不要重复建文件。

## 目录与命名

- 目录：`docs/histories/YYYY-MM/`
- 文件名：`YYYYMMDD-HHmm-task-slug.md`
- 模板：`docs/histories/template.md`

示例：

```text
docs/histories/
  2026-04/
    20260408-1430-bootstrap-template.md
```

## 应该写什么

- 用户诉求原文，或者压缩后的脱敏版本。
- 本次主要代码与文档改动。
- 设计动机，以及为什么这么做。
- 最关键的受影响文件。
