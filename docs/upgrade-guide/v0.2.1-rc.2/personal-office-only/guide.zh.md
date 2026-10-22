---
kind: upgrade-guide
description: "小兢个性版移除 Finance 模式及其工作区，同时保留普通文档读取。"
---

# 小兢个性版使用办公工作区

[English](guide.md) | 中文

## 变更

个性版不再加载 Finance 预设、账套管理界面及财务业务服务。启动时只创建办公工作区。普通文档读取继续使用共享解析器，不依赖财务业务服务。已有财务记录和文件保持不变。

## 迁移

1. 将个性版源码与运行数据和原版小兢安装分开。未打包预览应先把 `DSH_DESKTOP_PREVIEW_ROOT` 设为本项目的 `.local-personal-preview` 目录，再运行 `pnpm run dev:desktop`。
2. 在办公工作区创建新会话。个性版不提供 Finance 模式和账套管理；这些任务请继续使用原版应用。
3. 如使用自定义上传目录，将共享解析器的绝对路径配置 `uploadRoot` 或 `DSH_UPLOAD_DIR` 设为该目录。默认仍为 `<dshHome>/uploads`。
4. 确认工作区选择器和模式菜单不再包含 Finance 入口，普通上传文档仍可读取。小兢办公使用独立安装身份和数据目录，见[独立安装说明](../xiaojing-office-identity/guide.zh.md)。
