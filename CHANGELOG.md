# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Articles**: Added Articles 16, 17, 22, 54, 56, 69, 72, 73, 95, and 99 to `articles.json` for complete cross-module reference integrity. Penalties (Art. 99), monitoring obligations (Art. 72-73), codes of practice (Art. 56), and voluntary codes (Art. 69, 95) are now fully documented.
- **Validation**: `calculatePenaltyExposure()` and `analyzeGaps()` now validate `tier` against `RISK_TIERS` and throw `RangeError` on invalid values instead of silently returning empty results.
- **Tests**: 29 new tests covering boundary values (FLOPs threshold at exactly 1e25), obligation structure verification, cross-module article consistency, priority score accuracy, penalty formula verification, report section numbering, and tier validation hardening. Total: 373 tests (up from 344).
- `CHANGELOG.md` (this file).

### Fixed
- **Report numbering**: Report section numbers are now dynamically computed instead of hardcoded. Disabling optional sections (gap analysis, penalties) no longer causes numbering gaps (e.g., sections jumping from 3 to 5).

### Changed
- Nothing user-facing beyond the fixes above.

## [0.1.0] - 2025-03-01

### Added
- Initial release of the EU AI Act Compliance Toolkit.
- **SDK**: Classification engine with deterministic risk tiering (prohibited, high-risk, GPAI, GPAI-systemic, limited, minimal).
- **SDK**: Compliance checklists with per-tier obligation tracking.
- **SDK**: 8 documentation templates (technical documentation, risk management, data governance, human oversight, monitoring, GPAI model card, fundamental rights impact, declaration of conformity).
- **SDK**: Enforcement timeline with computed status relative to reference date.
- **SDK**: Gap analysis with priority scoring and remediation recommendations.
- **SDK**: Penalty exposure calculator with SME reductions and EU institution caps.
- **SDK**: Harmonised standards mapping (ISO/IEC and CEN/CENELEC JTC 21).
- **SDK**: 10 worked classification examples covering all six risk tiers.
- **CLI**: Interactive classification wizard, checklist tracker, report generator, and all SDK features exposed as commands.
- **Web**: Next.js 14 static site with 14-language support via next-intl.
- Data validation via JSON Schema (8 schema files).
- CI pipeline (GitHub Actions) with Node 18/20/22 matrix testing.
