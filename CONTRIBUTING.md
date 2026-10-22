# Contributing to Katcat.AI

English | [中文](CONTRIBUTING.zh.md)

Bug reports, documentation improvements, reproducible examples, and focused pull requests are welcome. For a large feature or dependency change, open an [issue](https://github.com/yyshi801207-sketch/Katcat.AI/issues/new/choose) first. Participation follows the [code of conduct](CODE_OF_CONDUCT.md).

## Set up a checkout

Fork this repository and follow [Run from source](README.md#run-from-source). Use the pinned pnpm version and install with `pnpm install --frozen-lockfile`. Do not commit API keys, personal workspaces, session history, local signing configuration, or generated installers.

Read [architecture](docs/architecture.md) before changing packages and [AGENTS.md](AGENTS.md) for conventions. Existing `xiaojing` identifiers are shared by profiles, dependencies, and tests; renaming requires every consumer to be updated.

## Make a focused change

1. Create a topic branch from `main` in your fork.
2. Implement the smallest complete fix, with affected documentation and meaningful regression coverage.
3. Update English and Chinese documentation together, following the [documentation rules](docs/AGENTS.md).
4. Run checks appropriate to the change and inspect `git diff --check`.
5. Open a pull request against `main`, linking the issue and listing checks actually run.

## Validate your work

Run focused tests during development. For example, these keyless tests cover onboarding and installation state:

```sh
pnpm exec vitest run apps/desktop/tests/katcat-installation.spec.ts packages/client/ui-settings-models/tests/welcome-store.client.spec.ts
```

For TypeScript changes, run `pnpm run build:xiaojing` to build the product and check its aggregate programs, plus `pnpm run lint`. For documentation changes, run `pnpm run test:docs` and `pnpm run doc-sync`. The [testing guide](docs/testing.md) defines snapshot, real-API, and platform-specific coverage. Real-API tests can incur provider charges and are not required for documentation-only changes.

[Katcat CI](.github/workflows/katcat-ci.yml) uses GitHub-hosted runners on pushes to `main` and pull requests, without model or signing credentials. It checks a focused subset of the inherited test suite; passing CI does not establish that every platform or installation path was exercised. Upstream-only workflows remain restricted to the upstream repository.

## Review and releases

Explain the resulting behavior, compatibility implications, and validation gaps. Include screenshots for UI changes. Preserve copyright and third-party notices. Change generated catalogs through their source and leave archived decisions intact. Maintainers may request a smaller scope or more evidence; no response-time commitment is made.

Before publishing installers, review release notes, source checks, installation behavior, and artifact checksums. Identify unsigned development artifacts explicitly. Inherited DSH publishing scripts target upstream infrastructure and are not Katcat release instructions; see [desktop packaging](apps/desktop/packaging/README.md) for build mechanics.

Use [SECURITY.md](SECURITY.md) for suspected vulnerabilities and [SUPPORT.md](SUPPORT.md) for user questions. Do not post secrets or private documents.
