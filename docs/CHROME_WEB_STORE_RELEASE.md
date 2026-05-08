# Chrome Web Store 发布

这份文档记录 Open Browser Use Chrome extension 的打包、GitHub Release 产物
和 Chrome Web Store 自动提交审核流程。

## 当前发布边界

Chrome Web Store 只分发 `apps/chrome-extension/` 里的 MV3 extension 包。
宿主机二进制 `open-browser-use` 仍然需要用户通过项目安装包、脚本或二进制
单独安装到本机，然后写入 Chrome Native Messaging manifest。

Chrome extension 不能自己安装 native messaging host manifest。正式扩展 ID
确定后，host 安装命令需要使用同一个 ID：

```bash
open-browser-use install-manifest \
  --extension-id <chrome-web-store-extension-id> \
  --path /path/to/open-browser-use
```

## 本地打包

```bash
pnpm package:chrome-extension
```

打包脚本会执行基础校验：

- `manifest_version` 必须是 3。
- `background.service_worker` 必须指向 `background.js`。
- manifest 必须包含 `nativeMessaging` 权限。
- manifest 必须声明 `16`、`32`、`48`、`128` 四个 PNG icons，并把 toolbar
  action icon 指向 `16` 和 `32` 图标。
- `background.js`、`content-cursor.js`、`popup.js` 必须通过 `node --check`。

输出文件：

```text
dist/chrome-extension/open-browser-use-chrome-extension-<version>.zip
dist/chrome-extension/package-manifest.json
```

## GitHub Release

手动触发 `.github/workflows/release.yml` 会生成：

- `dist/repo-metadata.tgz`
- `dist/release-manifest.json`
- `dist/chrome-extension/open-browser-use-chrome-extension-<version>.zip`
- `dist/chrome-extension/package-manifest.json`
- `dist/sbom.spdx.json`

release workflow 会把 Chrome extension zip 纳入 artifact upload、GitHub
Release assets 和 provenance attestation。

## 自动提交 Chrome Web Store

Chrome Web Store API v2 用于上传 extension zip，并可选提交审核。官方约束：

- Google 开发者账号需要启用 2-step verification。
- 首次发布前，需要在 Chrome Web Store Developer Dashboard 填好 Store
  listing 和 Privacy tabs。
- API 上传目标是已经存在的 store item，因此需要先拿到 Publisher ID 和
  Extension ID。
- 上传新包时，`apps/chrome-extension/manifest.json` 的 `version` 必须比
  已发布版本更高。
- 首次提交 Dashboard 文案、权限说明和隐私字段时，先使用
  `docs/CHROME_WEB_STORE_LISTING.md` 里的 listing draft。

需要在 GitHub repository secrets 里配置：

```text
CWS_CLIENT_ID
CWS_CLIENT_SECRET
CWS_REFRESH_TOKEN
CWS_PUBLISHER_ID
CWS_EXTENSION_ID
```

可用 `gh` 写入：

```bash
gh secret set CWS_CLIENT_ID
gh secret set CWS_CLIENT_SECRET
gh secret set CWS_REFRESH_TOKEN
gh secret set CWS_PUBLISHER_ID
gh secret set CWS_EXTENSION_ID
```

`CWS_REFRESH_TOKEN` 可以用本地 OAuth helper 生成。先在 Google Cloud 中为同一
项目启用 Chrome Web Store API，创建 OAuth client，并确保 loopback redirect
URI 可用：

```text
http://127.0.0.1:53682/oauth2callback
```

然后运行：

```bash
CWS_CLIENT_ID=<oauth-client-id> \
CWS_CLIENT_SECRET=<oauth-client-secret> \
pnpm chrome-web-store:oauth
```

脚本会打印授权 URL，使用 Chrome Web Store 发布者账号完成授权后，会在终端
输出 `CWS_REFRESH_TOKEN`。不要把该值提交到仓库；用 `gh secret set
CWS_REFRESH_TOKEN` 写入 GitHub repository secret。

触发 release workflow 时，把 `publish_chrome_web_store` 设为 `true`，workflow
会：

1. 打包 Chrome extension zip。
2. 用 refresh token 换取 access token。
3. 调用 Chrome Web Store API v2 `upload`。
4. 上传成功后调用 `publish`，提交审核。

`chrome_publish_type` 默认为 `DEFAULT_PUBLISH`，通过审核后自动发布；如果想
审核通过后再手动发布，选择 `STAGED_PUBLISH`。`chrome_deploy_percentage`
留空时使用 Developer Dashboard 当前设置。

## 从已有 GitHub Release 补发商店

如果 GitHub Release 已经创建完成，只需要把其中的插件 zip 上传到 Chrome
Web Store，使用 `.github/workflows/chrome-web-store-publish.yml`。这个
workflow 不会重新创建 GitHub Release，适合 `v0.1.3` 这类 release asset
已经存在、但当时还没配置 Chrome Web Store secrets 的情况。

手动触发时传入：

```text
release_tag=v0.1.3
asset_name=
submit=true
publish_type=DEFAULT_PUBLISH
deploy_percentage=
skip_review=false
```

`asset_name` 留空时会自动匹配
`open-browser-use-chrome-extension-*.zip`。如果同一个 release 上存在多个匹配
zip，可以显式填写完整 asset 文件名。

## 官方参考

- Chrome Web Store API 使用指南：
  <https://developer.chrome.com/docs/webstore/using-api>
- Chrome Web Store API v2 upload：
  <https://developer.chrome.com/docs/webstore/api/reference/rest/v2/media/upload>
- Chrome Web Store API v2 publish：
  <https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/publish>
