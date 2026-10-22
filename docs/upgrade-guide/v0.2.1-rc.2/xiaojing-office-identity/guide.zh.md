---
kind: upgrade-guide
description: "Katcat 保留独立安装和应用数据目录，并更改默认工作区路径。"
---

# Katcat 安装标识

[English](guide.md) | 中文

## 变更

Katcat.AI V1.0 使用产品版本 `1.0.0`，与 DSH 底座版本分开。应用标识保持 `com.sudotech.xiaojing-office`，URL 协议保持 `xiaojing-office://open`。全新安装使用 `%LOCALAPPDATA%\Programs\Katcat-desktop`。相同 GUID 的安装器自动在已有 Katcat 的注册位置覆盖升级，包括早期的 `xiaojing-office-desktop` 目录。

Windows 主程序与卸载程序分别为 `Katcat.AI.exe` 和 `Uninstall Katcat.AI.exe`。应用数据改为 `%APPDATA%\Katcat-desktop`。旧目录 `%APPDATA%\@sudotech\xiaojing-office-desktop` 保持完整，不自动导入。默认工作区和目录选择器使用 `Documents/Katcat_Home`。卸载保留 Katcat 用户数据，删除工作区不会清除这些数据。小兢会计安装和数据保持独立。

每次成功安装或重装都会初始化一次浅色主题，即使保留的设置曾选择深色。普通重启保留此后选择的主题。凭据、会话、计费记录和其他设置保持完整。已有可用提供商时，欢迎和 API Key 弹窗都会跳过。没有可用提供商时，新安装会显示说明，即使以前已经确认；点击“开始使用”后进入 API Key 配置。安装标识与主题初始化详见 [Desktop 用户数据路径](../../../../apps/desktop/README.zh.md#permanent-user-data-paths)。

本地未签名 Windows 包不嵌入强制更新策略和更新源。签名构建仍要求配置发布环境及签名信息。

## 迁移

1. 运行 Katcat 安装器覆盖已有 Katcat，或为全新安装选择父目录。不要选择小兢会计目录。
2. 没有可用提供商时，按欢迎说明点击“开始使用”后配置 API Key，或选择“稍后配置”跳过本次运行。需要旧文件时，通过工作区选择器打开原目录，文件保留在原位置。如需主动恢复旧版 Katcat 应用数据，先退出两个版本并备份两个数据目录，再将旧目录复制到新位置后启动。这会恢复凭据和计费记录；已有可用提供商时跳过配置，但仅有旧欢迎确认状态不会跳过新安装的说明。
3. 本地未签名构建在 `apps/desktop/.env.windows` 配置 `DSH_DESKTOP_APP_ID=com.sudotech.xiaojing-office`，再运行 `pnpm --dir apps/desktop run package:win:x64:unsigned`。源码预览保留隔离的 `DSH_DESKTOP_PREVIEW_ROOT`。
4. 将手动创建的快捷方式或脚本中的 `小兢办公.exe` 改为 `Katcat.AI.exe`，安装器管理的快捷方式会自动更新。确认关于页显示 `Katcat.AI`、应用版本 `1.0.0` 和 DSH 底座版本，旧文件及原会计软件安装保持完整。
