# CI/CD 说明

这个模板自带一套不依赖具体语言栈的 CI/CD 骨架。

## 默认包含的内容

- `ci.yml`：仓库级检查，覆盖 docs、repo hygiene、Markdown 和 shell 脚本校验。
- `supply-chain-security.yml`：在 PR 上做依赖变更检查，并在 PR、定时任务和手动触发时运行 OSV 扫描。
- `release.yml`：手动触发的 release 流水线，用来打包仓库级制品、
  Chrome extension zip、生成 provenance，并创建 GitHub Release；按输入参数
  可把 extension 上传并提交到 Chrome Web Store。
- `chrome-web-store-publish.yml`：手动触发的 Chrome Web Store 发布流水线，
  从已有 GitHub Release 下载 extension zip，再上传并可选提交审核；用于
  release 已经创建、只需要补跑商店发布的场景。

## 设计原则

这套默认流水线的目标，是在项目真正成形前先把交付链路搭起来，而不是假装已经知道未来项目该怎么 build 和 deploy。

当新项目的技术栈确定后，你应该把 `scripts/release-package.sh` 里的占位打包逻辑替换成真实构建产物，而不是另起一套平行流程。

所有 GitHub Actions 都已经 pin 到 commit SHA。后续升级 action 时，也要继续保持这个约束。

## 推荐接入顺序

1. 保留 `ci.yml`，作为唯一默认常驻的仓库基础门禁。
2. 在 `scripts/ci.sh` 里继续叠加项目自己的验证命令。
3. 用真实构建产物替换 `scripts/release-package.sh`。
4. 浏览器插件发布走 `docs/CHROME_WEB_STORE_RELEASE.md` 里的 Chrome Web
   Store API v2 流程。
5. 技术栈和环境稳定后，再补其他部署 job。
6. 即使交付方式变化，SBOM 和 provenance 这类供应链能力也建议保留。

## 默认 release 产物

当前 release 流水线会产出：

- `release-manifest.json`
- `repo-metadata.tgz`
- `chrome-extension/open-browser-use-chrome-extension-<version>.zip`
- `chrome-extension/package-manifest.json`
- `sbom.spdx.json`
- 对 release artifact 生成的 GitHub artifact attestation

也就是说，即使项目还没进入真实部署阶段，这个模板也已经把“可追溯的制品封装”这一步准备好了。
