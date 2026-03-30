# Contributing to EU AI Act Toolkit

Thanks for helping make EU AI Act compliance more accessible. This guide gets you up and running.

## Quick Setup

**Requirements:** Node.js >= 18

```bash
git clone https://github.com/YOUR_USERNAME/eu-ai-act-toolkit.git
cd eu-ai-act-toolkit
npm install
npx turbo build
npx turbo test
```

This is an npm workspaces monorepo managed with Turborepo.

## Project Structure

```
packages/sdk/          → @eu-ai-act/sdk — TypeScript library (builds with tsup, ESM + CJS)
packages/cli/          → eu-ai-act — CLI tool
packages/web/          → Next.js web dashboard
data/                  → Single source of truth JSON files (compliance data)
locales/en/            → CLI translations (English)
packages/web/messages/ → Web dashboard translations (14 languages)
```

## Development Workflow

```bash
npx turbo dev          # Start dev servers
npx turbo test         # Run tests (vitest)
npx turbo build        # Verify production builds
node scripts/validate-data.js   # Validate data files after changes
```

Always run validation after editing anything in `data/` and run tests before submitting a PR.

## What We Need Help With

**Legal corrections** — If you spot an error in compliance requirements, fix it and cite the specific Article (e.g., "Article 9(1)"). Every correction must reference the regulation.

**New worked examples** — Practical, step-by-step examples showing how to apply requirements to real systems.

**Translations** — French (FR) and German (DE) are the current priorities.
- Web dashboard translations go in `packages/web/messages/XX.json` (e.g., `fr.json`)
- CLI translations go in `locales/XX/` (e.g., `locales/fr/`)

**Harmonised standards mapping** — Linking EU AI Act requirements to relevant harmonised standards.

**Bug fixes and improvements** — Always welcome.

## Guidelines

1. **Cite the Article.** Every compliance item must reference a specific Article of the EU AI Act.
2. **Plain language.** No legal jargon. Write so a developer can understand it.
3. **Be actionable.** Tell the reader what to DO, not just what the law says.
4. **Validate data.** Run `node scripts/validate-data.js` after any changes to `data/`.
5. **Run tests.** Run `npx turbo test` before submitting.

## PR Process

1. Fork the repo and create a branch (`git checkout -b my-change`)
2. Make your changes
3. Run `node scripts/validate-data.js` (if you touched data files)
4. Run `npx turbo test`
5. Submit a PR with a clear description of what you changed and why

That's it. If you're unsure about something, open an issue first.
