# 前端协作说明

Open Browser Use 当前 `main` 分支只保留 Chrome extension 前端。

## 当前前端边界

- `apps/chrome-extension/popup.html`：extension popup 外壳。
- `apps/chrome-extension/popup.css`：popup 样式。
- `apps/chrome-extension/popup.js`：popup 行为。
- `apps/chrome-extension/content-cursor.js`：页面内 cursor overlay。

这个 popup 是工具面，不是 landing page。设计上优先保持状态清楚、权限边界
明确、操作少而直接。

## 验证方式

```sh
pnpm package:chrome-extension
node --check apps/chrome-extension/popup.js
node --check apps/chrome-extension/content-cursor.js
```

打包脚本会校验 manifest、icons、background/content/popup 脚本基础语法，并
输出 `dist/chrome-extension/open-browser-use-chrome-extension-<version>.zip` 和
`dist/chrome-extension/open-browser-use-chrome-extension-<version>.crx`。

## 设计约束

- popup 内避免大块说明文案，优先使用短状态、明确按钮和必要的错误信息。
- 与 Chrome Web Store listing、privacy policy 和权限说明保持一致。
- 任何新增权限都必须同步更新 `apps/chrome-extension/manifest.json`、发布文档
  和隐私说明。
