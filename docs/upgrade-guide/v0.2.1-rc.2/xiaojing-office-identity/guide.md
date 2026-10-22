---
kind: upgrade-guide
description: "Katcat keeps a separate installation and application data directory, with a new default workspace path."
---

# Katcat installation identity

English | [中文](guide.zh.md)

## Change

Katcat.AI V1.0 uses product version `1.0.0` independently of the DSH base version. Its application ID remains `com.sudotech.xiaojing-office`, and its URL scheme remains `xiaojing-office://open`. Fresh installations use `%LOCALAPPDATA%\Programs\Katcat-desktop`. Installers with the same GUID automatically update an existing Katcat installation at its registered location, including earlier `xiaojing-office-desktop` directories.

The Windows application and uninstaller are `Katcat.AI.exe` and `Uninstall Katcat.AI.exe`. Application data now uses `%APPDATA%\Katcat-desktop`. The previous `%APPDATA%\@sudotech\xiaojing-office-desktop` directory remains untouched and is not imported automatically. The default workspace and folder picker use `Documents/Katcat_Home`. Uninstall retains Katcat user data; deleting a workspace does not clear that data. Xiaojing Accounting installations and data remain separate.

Each successful installation or reinstallation initializes the light theme once, even when retained settings selected dark mode. Ordinary relaunches preserve subsequent theme choices. Credentials, sessions, usage records, and other settings remain intact. A usable provider skips both welcome and API-key dialogs. Without one, a new installation shows the guide despite an earlier acknowledgement, then offers API-key setup after Start. Installation identity and theme initialization are documented under [Desktop user-data paths](../../../../apps/desktop/README.md#permanent-user-data-paths).

Local unsigned Windows packages omit mandatory-update policy metadata and update feeds. Signed builds still require deployment and signing configuration.

## Migration

1. Run the Katcat installer to update an existing Katcat installation, or choose a parent directory for a fresh installation. Do not select the Xiaojing Accounting directory.
2. If no provider is usable, follow the welcome guide and configure an API key after Start, or choose Configure later for this run. Open earlier folders through the workspace picker when needed; files remain at their previous locations. To recover earlier Katcat application data deliberately, quit both versions, back up both data directories, and copy the previous directory into the new location before relaunching. This restores credentials and usage records; a usable provider skips setup, while an earlier welcome acknowledgement alone does not skip a new installation's guide.
3. For a local unsigned build, configure `DSH_DESKTOP_APP_ID=com.sudotech.xiaojing-office` in `apps/desktop/.env.windows` and run `pnpm --dir apps/desktop run package:win:x64:unsigned`. Source previews retain an isolated `DSH_DESKTOP_PREVIEW_ROOT`.
4. Update manually created shortcuts or scripts that invoke `小兢办公.exe` to `Katcat.AI.exe`; installer-managed shortcuts update automatically. Confirm About displays `Katcat.AI`, application version `1.0.0`, and the DSH base version, and that earlier files and the original accounting installation remain intact.
