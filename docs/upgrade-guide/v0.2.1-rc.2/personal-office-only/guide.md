---
kind: upgrade-guide
description: "The personal Xiaojing build removes Finance mode and its workspace while retaining ordinary document reading."
---

# Personal Xiaojing uses office workspaces

English | [中文](guide.zh.md)

## Change

The personal build no longer loads the Finance preset, ledger-management UI, or Finance business services. Startup creates only the office workspace. Ordinary document reading continues through the shared parser without the Finance business service. Existing Finance records and files remain unchanged.

## Migration

1. Keep the personal checkout and its runtime data separate from the original Xiaojing installation. For an unpackaged preview, set `DSH_DESKTOP_PREVIEW_ROOT` to the checkout's `.local-personal-preview` directory before running `pnpm run dev:desktop`.
2. Use an office workspace for new sessions. The personal build does not offer Finance mode or ledger management; use the original application for those tasks.
3. If document uploads use a custom directory, set the shared parser's absolute `uploadRoot` configuration or `DSH_UPLOAD_DIR` to that directory. The default remains `<dshHome>/uploads`.
4. Confirm that the workspace picker and mode menu contain no Finance entry and that an ordinary uploaded document can still be read. Xiaojing Office uses a separate installation and data directory; see [the installation guide](../xiaojing-office-identity/guide.md).
