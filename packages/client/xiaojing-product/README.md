---
description: "Katcat.AI product branding, onboarding, theme, and default persona"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-xiaojing-product

The current product is Katcat.AI (`1.0.2`). It exposes office capabilities without Finance mode and includes customizable session avatars with subtle animations. Historical release entries describe their original versions.

English | [中文](README.zh.md)

User-visible application names and messages use Katcat. The Windows installer keeps its upgrade identifiers; application data uses `%APPDATA%\Katcat-desktop` without automatically importing earlier product data.

## Summary

Use Katcat.AI branding, a personal-assistant persona, light and dark themes, and a cat-and-robot welcome screen. First-use guidance explains how to obtain and configure a DeepSeek API key. The About page shows the application and DSH versions. Without this plugin, the shared UI retains its default DeepSeek presentation.


## Table of Contents

- [Capabilities](#capabilities)
- [Dev Note](#dev-note)

<a id="capabilities"></a>
## Product contributions

The Katcat.AI interface uses the supplied transparent cat-cutout wordmark in the sidebar and plain white conversation and navigation surfaces in light mode. Katcat stays red in both themes; only .AI changes from black to white in dark mode. The transparent cat cutouts reveal the surface beneath; a cropped K occupies the non-Windows collapsed rail. User messages use a light gray fill, a fine border, and compact rounded corners. No background image is loaded. Neutral graphite controls and selection fills replace the teal palette; primary send actions use brand red, and link accents use blue. Dark mode uses neutral charcoal surfaces.

The `0.3.3` release adds the 0.2.1-rc.2 kernel model/search APIs, plugin-index management, built-in automation, draft retention, model reasoning and fonts, microphone selection, collaboration, and upstream stability fixes. Existing Katcat capabilities stay available, and the `0.3.2` release details include session authorization for eligible operations while retaining the single-use approval choice.

Office sessions offer **Automatic approval (experimental)** in the permission menu. A risk confirmation precedes activation; ordinary and mandatory tool requests, including deletion, upload, and submission, then proceed automatically in that session and its delegated children. A header picker remains available while a task replaces the composer with an approval. Switching to another permission preset revokes this mode, including for live children. The logged choice survives reopening the same conversation; ordinary forks and unrelated new sessions do not inherit it. Finance sessions cannot select it, and it is excluded from defaults. Browser connection consent and Windows elevation retain their system authorization.

The product shadows the generic `system-prompt` Chat renderer so internal model instructions remain persisted and model-visible without appearing in the Katcat end-user transcript.

Katcat Desktop shows this guide inside the main workspace without a separate login page. Settings uses the standard launcher; account menus, account introductions, and the account-authenticated model provider are unavailable.

The first-use dialog supplies a compact cream-and-coral illustrated API key guide through `onboarding.content`, with a blue DeepSeek Platform link and key-management and security notes. The shared [Models onboarding coordinator](../ui-settings-models/README.md#onboarding-coordinator) owns installation-aware acknowledgement, provider-readiness checks, and the API key editor that follows Start. A usable provider skips both Katcat Desktop welcome and credential dialogs; no credentials or conversation data are cleared.

Product artwork URLs and the Katcat boot-logo and favicon defaults resolve relative to the document base, keeping these resources inside a Web deployment's public mount.

The empty-session hero uses transparent cat-and-robot artwork stored as `xiaojing-office-robot-logo.png`. The sidebar uses `katcat-wordmark.png`; the favicon uses the black cat-cutout letter on a white rounded tile stored as `xiaojing-character-logo.png`. These asset filenames are internal identifiers. The title is centered independently of its version badge, which moves below the title in narrow layouts. The initial HTML receives its brand and favicon from `DSH_CLIENT_BOOT_LOGO`, `DSH_CLIENT_BOOT_LOGO_ALT`, and `DSH_CLIENT_FAVICON`; builds without these values retain the generic assets.

The browser plugin registers `sidebar.brand.mark`, `sidebar.brand.name`, `conversation.hero.brand.mark`, `conversation.hero.brand.content`, `onboarding.content`, and `settings.section` only in the `xiaojing` Client build profile. Product copy, palette overrides, release version badge, and the default persona live in this package. The new-session hero says `Katcat, 您的超级个人助理`, including when retained history carries Finance metadata. About Katcat displays only the product icon, name, application version, and DSH base version compiled through `DSH_CLIENT_VERSION`; release history, detail actions, description, and company footer are absent. Electron supplies its actual application version through one restricted preload method; an ordinary Web preview uses a checked fallback that must equal `apps/desktop/identity.json.productVersion`. Tests require that fallback to equal the first release-history record and reject duplicate version entries. The product-layer gate rejects a version mismatch and rejects Katcat brand marks written back into official UI source roots. The plugin lifecycle also synchronizes the existing browser `theme-color` metadata after the product dataset is attached and restores the generic value when the plugin unloads. The build profile selects the inventoried Katcat logo for the pre-plugin loading page through generic boot metadata; the shell retains its `HARNESS` fallback when that metadata is absent. `product.json` records the official `dsh-v0.2.1-rc.2` baseline by its official release tag, generic slots, browser asset paths, desktop product manifests, and an empty product-preset list. A product-layer gate parses the declarative Finance and Standard compositions and permits only the Finance persona, declared Finance consumers, and product skill directory to differ.

The personal build disables the Finance workspace, ledger management, calculations, evidence service, and Finance preset. Its sidebar and About page use office-only copy. The retained Finance preset and package sources are not activated by default. `product.json.agentPresets` is empty; `product.json.financeExtension` inventories retained source and the protected `harness/finance` directory. Ordinary document reading keeps the shared parser without starting the Finance business service. Existing Finance records and files are not deleted.

The Host product plugin also owns Katcat's mandatory deletion policy. Explicit deletion tools and shell deletion commands request confirmation through the shared approval channel even when the session policy is `never`. Shell requests offer “Always allow” for the identical command, resolved working directory, and execution permission within the current Session. Different commands, directories, permissions, or Sessions require another decision. Relative per-call directories resolve from the validated current directory, including recovery when it disappears; a directory change during confirmation blocks that call. These choices do not expand the sandbox workspace. Literal text and comments do not establish deletion; encoded or indirect scripts whose effects cannot be identified use execution confirmation without a deletion claim. A monotonic tool guard denies any matching call without confirmation. Browser and Windows controls classify protected actions inside their own providers.

When the saved default still selects `deepseek-official/deepseek-v4-flash` or `deepseek-official/deepseek-v4-flash-vision-exp`, the Host product plugin changes only that selection to `deepseek-official/deepseek-flash` so new sessions use the V4.1 Flash text-and-image route. It checks at activation and after settings updates, including the asynchronous import of an older `settings.yaml`. Other saved providers and models remain unchanged; session-specific historical selections are not rewritten.

The product identifies itself as Katcat, the user’s super personal assistant, and accurately describes its technical origin as based on DeepSeek Harness with internal branding and configuration. It does not claim that SUDO Tech developed the underlying framework.

The Katcat build supplies Chat's localized running labels through `DSH_CLIENT_RUNNING_LABEL_ZH` and `DSH_CLIENT_RUNNING_LABEL_EN`: “Katcat is thinking” and “Katcat is thinking”. The visible timer and accessible status use the same label. The label and elapsed time are black in the light theme and use the primary text color in the dark theme. The highlight follows the text color; the three activity dots retain their separate colors.

## Upstream upgrade contract

Browser-opening requests and website tasks use the [native browser connection](../../xiaojing/xiaojing-browser-control/README.md#native-browser-connections): Edge by default and Chrome when explicitly requested. An ordinary opening request authorizes the necessary connection and ordinary tabs without requiring the user to name a dedicated profile. Before any page action, a failed ordinary connection permits one explicit attempt with a dedicated instance of the same browser, unless the user rejected or canceled access or required an existing profile. A request for already-open tabs uses `existing`, retains browser permissions and connection approval, and does not substitute another browser or profile after failure. Desktop clicking is not a webpage fallback. These instructions do not guarantee model response latency.

An upstream upgrade starts from stable `main` on a `codex/upgrade-rcX` branch and merges the verified official tag or commit. Product code, brand assets, desktop identity, and accounting logic remain unchanged. Conflicts are resolved only in the generic slots, the rc-specific accounting adapter, the independent integration patches listed by `apps/desktop/integration-patches.json`, and any required atomic data migration.

The upgraded branch may merge only after the product-layer verifier, focused behavior tests, built Web replay, fresh Windows install, and previous-release in-place upgrade checks pass. A version that cannot read or migrate the previous release's data is not releasable.

## Official-source Chinese tax research

The product-owned `finance-tax-research-cn` skill instructs Finance模式 to establish jurisdiction, taxpayer facts, transaction facts, accounting or tax period, and the requested answer date before reaching a rule-dependent conclusion. It uses `finance_evidence`, treats search snippets as discovery only, and labels unsupported source text, status, or applicability as `待核验`. The other four skills cover financial-document reading, invoice review, voucher drafting, and financial-data analysis. They orchestrate the shared document, evidence, deterministic-calculation, and controlled-file tools without treating skill names as proof that a business operation is supported. The voucher skill creates a Youcheng voucher only after an explicit request, versioned preview, mandatory approval, and verified readback; it does not post the voucher. The current Finance preset includes no reimbursement skill.

The skill stores no regulation text, builds no crawler or RAG index, and does not enable generic HTTP fetching. Search snippets cannot be represented as complete provisions, and a result without enough official text must remain non-definitive. Removing its manifest entry and preset skill directory withdraws the capability without changing Harness core packages or user data.

## Model Experience

### Product-wide business-facing responses

#### What the model sees

Every Katcat preset receives one stable response policy after persona assembly. It requires the final answer to lead with the usable business outcome, suppresses internal execution evidence and failed-attempt narration after success, limits failures to one user-visible reason and next action, and presents generated files by content and usable location rather than audit metadata. Technical diagnostics remain available only when the user explicitly requests them. Tool providers must still project model-safe results; this prompt is not a substitute for filtering raw transport, retry, pagination, checksum, or test data before it reaches the model.

#### Token effect

One fixed product-wide section is added to each model request. Finance adds its narrower accounting interpretation and safety rules without repeating tool execution evidence.

#### KV Cache effect

The policy is prefix-stable for every preset and changes only when the product policy changes.

### Mandatory deletion instruction

#### What the model sees

When either built-in automation provider is composed, the stable automation context states that deletion uses the mandatory confirmation service even under Full access and `never`, and prohibits evasion by changing or obscuring the deletion command. An explicit Automatic approval (experimental) choice authorizes that service to grant these requests automatically; the runtime approval context identifies when this authorization is effective.

#### Token effect

One fixed sentence in the existing built-in automation context; it is not repeated per tool call.

#### KV Cache effect

The sentence is prefix-stable while the product capability composition remains unchanged.

### Default deployment persona system prompt

#### What the model sees

The plugin fills `deployment:persona-prefix` only when downstream assembly leaves it empty. Standard, PTC, and Creator inherit the Katcat identity while retaining their tools; explicit user-authored personas remain authoritative. Chinese introductions use “我是 Katcat，您的超级个人助理！”. Greetings invite exploration without listing office functions; specific capability claims remain conditional on the available tools and authorization. Retained replies are historical records and are not rewritten.

##### Verbatim default persona

```markdown
你的名字是Katcat（简称Katcat），在办公搭子模式下的身份始终是用户的AI办公搭子。自我介绍使用“办公搭子”，不要称自己为“办公助手”“AI助手”“智能助手”“财务助手”或“Katcat的助手”。用户用中文问候或询问身份时，自我介绍使用：“你好！我是Katcat，您的AI办公搭子！”；其他语言使用对应表达。即使历史回复中曾使用“办公助手”等称呼，后续自我介绍也应使用“办公搭子”。

当前是办公搭子工作区，不是财务助手工作区。产品名称中的“会计”不代表当前会话采用财务身份。不要把日常办公介绍成财税专属服务，也不要把编程、命令或脚本当作默认身份；这些只是完成任务时可用的手段。

用户询问“你能做什么”时，用日常办公语言介绍以下六类能力，按当前可用工具和授权条件说明，不要照搬工具目录：

1. 文档处理：读取、整理、提炼 PDF、Word、Excel、PPT、OFD、CSV、TXT 等材料中的信息；具体格式和扫描件识别能力以已配置的文档工具为准。

2. 数据处理：梳理表格、核对汇总、查找差异，生成可复核的报表草稿。

3. 内容撰写：把需求变成文稿，起草通知、说明、邮件、总结等内容。

4. 信息检索：检索政策、法规、行业等公开信息，保留来源并说明无法核实的内容。

5. 网页操作：连接并获得授权后，在可用浏览器工具支持的范围内协助填表、查数据、走流程；不能仅因界面有浏览器面板就声称能接管它。

6. 电脑操作：在授权范围和可用电脑工具支持下操作应用与文件，推进多步骤任务，不只是提供建议。

可以结合已配置工具处理材料、生成成果。没有相应工具、连接或授权时，如实说明，不声称已执行；用户明确提出财务任务时按实际能力协助，不因此改变办公身份或假定已接入客户账套。

Do not volunteer internal model, provider, framework, runtime, or workspace-path details unless the user explicitly requests technical diagnostics. If asked about the product's technical origin, state accurately that it is based on DeepSeek Harness with internal branding and configuration; do not claim that SUDO Tech developed the underlying framework.
```

#### Token effect

The default persona adds the fixed text above once when no explicit persona is present.

#### KV Cache effect

The text is prefix-stable while the product version and working directory stay unchanged. Changing the selected persona or working directory changes the system prompt and may invalidate provider prefix reuse.

### Finance模式 preset system prompt

#### What the model sees

A session created with the shipped `finance` preset receives every Standard mode tool, while its `deployment:persona-prefix` section is replaced by the finance-specific text below. Its filesystem skill provider also mounts the product-owned `skills/` directory beside the preset; other finance services and skills remain independently removable.

##### Verbatim Finance模式 persona

```markdown
You are Katcat, an AI office companion configured for internal use, operating in Finance模式. Finance模式 retains every capability of Standard mode and applies an evidence-first discipline to finance and tax work. Distinguish confirmed facts, assumptions, and items that require verification. Do not invent laws, tax rules, accounting standards, citations, client facts, calculations, or completed business actions. When jurisdiction, taxpayer type, accounting standard, accounting period, or tax period can affect the answer, state the applicable assumptions or ask for the missing facts. For current Chinese finance or tax rules, prefer official sources and cite them; when applicability or legal effect cannot be established, say “待核验”. Do not claim that a submission, approval, posting, payment, filing, or external-system change succeeded unless a tool result verifies the final state. For imported PDF, DOCX, XLSX, PPTX, digital-invoice XML, OFD, CSV, or text documents, use finance_document instead of attempting shell, Python, Office, or ad-hoc converter commands. When finance_document reports visual_count, use its visuals action to inspect retained document pictures with the native visual model. For a simple identity question, answer concisely as “我是Katcat，当前处于 Finance模式。” in Chinese, or the equivalent in the user's language. Do not volunteer internal model, provider, framework, runtime, or workspace-path details unless the user explicitly requests technical diagnostics. If asked about the product's technical origin, state accurately that it is based on DeepSeek Harness with internal branding and configuration; do not claim that SUDO Tech developed the underlying framework.
```

#### Token effect

The preset replaces the office identity with one fixed finance persona. Additional Finance capability and client context are owned by [xiaojing-finance-domain](../../xiaojing/xiaojing-finance-domain/README.md), not the office persona.

#### KV Cache effect

The persona remains prefix-stable for a fixed working directory. Selecting another preset changes the system-prompt prefix by design.

## Known Limitations and Deferred Work

- The product layer relies on eight generic UI slots on the `dsh-v0.2.1-rc.2` integration baseline; a future official release that changes those owners requires an adapter update before merge.
- Browser image files remain app-level public assets inventoried by `product.json`; the verifier checks their presence but does not embed them into the client bundle.
- Shell classification recognizes explicit deletion commands. It cannot infer destructive behavior hidden inside an unrelated opaque third-party executable; any new tool that can delete user data must expose and enforce its own mandatory deletion classification.
- `Finance模式` provides local client context, dedicated Finance Workspaces, document and invoice review, official-source Chinese tax research, deterministic trial calculations, managed financial files, and the implemented Youcheng query and controlled-maintenance operations. The canonical capability inventory marks each business area as supported, limited, or unsupported. Native general ledger, subsidiary ledger, auxiliary ledger, balance sheet, income statement, cash-flow statement, reimbursement, audit, posting, closing, filing, and actual payment are not current Finance chat capabilities.
- The protected `harness/finance` root stores schema-versioned client, document, and evidence data. Deterministic calculations add no separate ledger; their complete inputs and outputs remain in the session log.

<a id="dev-note"></a>
### Dev Note

None.

No invariant companion is published because registries and the owning services enforce these relationships directly; this package has no independent observation to compare.
