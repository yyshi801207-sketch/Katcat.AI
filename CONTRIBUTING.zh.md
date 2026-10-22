# 参与 Katcat.AI 开发

[English](CONTRIBUTING.md) | 中文

欢迎提交问题报告、文档改进、可复现示例和范围明确的 PR。大型功能或依赖变更请先通过 [Issue](https://github.com/yyshi801207-sketch/Katcat.AI/issues/new/choose)讨论。参与时请遵守[行为准则](CODE_OF_CONDUCT.md)。

## 准备开发环境

Fork 本仓库，按[从源码运行](README.zh.md#run-from-source)准备环境，使用固定的 pnpm 版本并执行 `pnpm install --frozen-lockfile`。不要提交 API Key、个人工作区、会话历史、本地签名配置或生成的安装包。

修改包代码前请阅读[架构文档](docs/architecture.zh.md)，仓库约定见 [AGENTS.md](AGENTS.md)。现有 `xiaojing` 标识由配置、依赖和测试共同使用，重命名时必须同步更新所有使用方。

## 提交范围明确的改动

1. 从自己 Fork 的 `main` 创建工作分支。
2. 完成最小且完整的修复，同时更新相关文档和有意义的回归测试。
3. 根据[文档规则](docs/AGENTS.md)同步更新中英文文档。
4. 执行与改动相匹配的检查，并查看 `git diff --check`。
5. 向 `main` 提交 PR，关联 Issue 并列出实际运行的检查。

## 验证改动

开发中优先运行针对性测试。例如，以下无密钥测试覆盖引导和安装状态：

```sh
pnpm exec vitest run apps/desktop/tests/katcat-installation.spec.ts packages/client/ui-settings-models/tests/welcome-store.client.spec.ts
```

修改 TypeScript 时，运行 `pnpm run build:xiaojing` 构建产品并检查聚合程序，同时运行 `pnpm run lint`。修改文档时，运行 `pnpm run test:docs` 和 `pnpm run doc-sync`。[测试指南](docs/testing.zh.md)说明了快照、真实 API 和平台专项测试的要求。真实 API 测试可能产生服务商费用，仅修改文档时不要求运行。

[Katcat CI](.github/workflows/katcat-ci.yml) 在向 `main` 推送及提交 PR 时使用 GitHub 托管运行器执行，不需要模型或签名凭据。它检查继承测试集中的相关子集；CI 通过不代表所有平台或安装流程均已验证。仅服务于上游的工作流限制在上游仓库运行。

## 审阅与发行

请说明修改后的行为、兼容性影响及尚未验证的部分。可见界面变化请附截图。保留版权及第三方声明，通过源文件更新生成的目录，不修改已归档决策。维护者可能要求缩小范围或补充证据；本项目不承诺响应时间。

发布安装包前，请审阅更新说明、源码检查、安装行为及产物校验值，明确标注未签名开发产物。继承的 DSH 发布脚本面向上游基础设施，不能当作 Katcat 发布说明；构建机制见[桌面打包文档](apps/desktop/packaging/README.zh.md)。

疑似漏洞请参照 [SECURITY.md](SECURITY.md)，使用问题见 [SUPPORT.md](SUPPORT.md)。请勿上传密钥或私人文档。
