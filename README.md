# Open Browser Use

Open Browser Use is an open-source Chrome automation stack built around a
readable MV3 extension, a Go native messaging host, and SDKs for local runtime
integration.

## 简介

当前 `main` 分支聚焦一条干净的 Chrome route：

- `apps/chrome-extension/`：Open Browser Use MV3 Chrome extension。
- `cmd/open-browser-use/`：Go native messaging host 和 CLI。
- `packages/open-browser-use-js/`：JavaScript/TypeScript SDK。
- `packages/open-browser-use-python/`：Python SDK。
- `docs/references/` 和 `docs/wiki/browser-client/`：保留的参考资料与逆向笔记。

## 快速开始

安装依赖：

```sh
pnpm install
```

构建和检查：

```sh
pnpm typecheck
pnpm build
pnpm test
make ci
```

打包 Chrome extension：

```sh
pnpm package:chrome-extension
```

安装 native messaging host manifest：

```sh
go build -o ~/.local/bin/open-browser-use ./cmd/open-browser-use
open-browser-use install-manifest \
  --extension-id <chrome-extension-id> \
  --path ~/.local/bin/open-browser-use
```

当前 Chrome route 执行计划在
`docs/exec-plans/active/2026-05-08-open-browser-use-chrome-route.md`。

## 许可证

[MIT](LICENSE)
