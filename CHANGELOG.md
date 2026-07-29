# Changelog

All notable changes to the **YAML Navigator** extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2026-07-29

### Added

- Hierarchical parsing of nested YAML keys in the symbol tree.
- Support for list items (`- key: value`) in breadcrumb and outline.
- Support for quoted keys containing colons (e.g. `"key:with:colons"`).
- Expanded English-only `index.yaml` sample file for manual testing.

### Changed

- Minimum supported VS Code version raised to `^1.125.0`.
- Dev dependencies updated (`eslint` 10, `typescript` 7, `@vscode/test-electron` 3, and related packages).
- ESLint configuration migrated to flat config (`eslint.config.mjs`).
- Test runner configuration moved to the project root (`.vscode-test.mjs`).

### Fixed

- Symbol provider now returns `DocumentSymbol` instead of deprecated `SymbolInformation`, restoring reliable breadcrumb and outline behavior.
- Parser crash caused by an undefined `lineIndex` when reading YAML keys.

## [0.0.1] - 2026-07-29

### Added

- Initial release.
- Document symbol provider for YAML files, enabling **Breadcrumb** and **Outline** navigation for top-level keys.

[Unreleased]: https://github.com/marceloxp/yaml-navigator/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/marceloxp/yaml-navigator/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/marceloxp/yaml-navigator/releases/tag/v0.0.1
