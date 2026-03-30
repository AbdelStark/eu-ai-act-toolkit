# eu-ai-act-toolkit Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-30

## Active Technologies

- TypeScript 5.4+ (strict mode) (001-full-toolkit-mvp)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.4+ (strict mode): Follow standard conventions

## Recent Changes

- 001-full-toolkit-mvp: Added TypeScript 5.4+ (strict mode)

<!-- MANUAL ADDITIONS START -->

## Design Context

### Users
Compliance officers, legal advisors, and developers at companies deploying
AI in the EU. They are under regulatory pressure, often navigating the
400-page Act for the first time, and need clarity on what applies to them.
Their context is professional, time-constrained, and high-stakes — getting
compliance wrong means fines up to 35M EUR or 7% of global turnover.

### Brand Personality
**Authoritative. Clear. Trustworthy.**

The toolkit should feel like an official reference — institutional gravitas
without being stuffy. Users should feel *confident and in control*, like the
tool has their back. Not a startup product, not a sales funnel — a public
good that earns trust through accuracy and transparency.

### Aesthetic Direction
**"gov.uk meets Linear"** — clean institutional design with modern polish.

- **Palette**: Deep navy (#1a1f36) primary, EU flag blue (#003399) accent,
  white backgrounds. Risk tiers: red (prohibited), orange (high-risk),
  yellow (GPAI), blue (limited), green (minimal).
- **Typography**: Inter for UI, JetBrains Mono for article references and
  legal citations. Content-first hierarchy.
- **Theme**: Light mode only. Institutional tools are light.
- **Spacing**: Generous white space. Content breathes. No visual clutter.
- **Decoration**: Minimal. No gradients, no illustrations, no stock photos.
  Subtle EU stars motif in header/footer establishes authority.

**Anti-references (what this must NOT look like):**
- SaaS marketing pages — no gradient CTAs, pricing tables, "Book a demo"
- Dense legal/government walls of text — modern even though institutional
- Gamified dashboards — no confetti, streaks, achievement badges

### Design Principles

1. **Trust through citation.** Every claim links to a specific Article.
   Legal text is accessible on hover. No paraphrasing that changes meaning.
   The interface earns credibility by showing its sources.

2. **Reduce anxiety, don't create it.** Compliance is already stressful.
   The UI should make the complex feel manageable — clear next steps,
   progress indicators, one thing at a time. Never overwhelm.

3. **Content is the interface.** The regulation itself is the content.
   Design serves readability and navigation, not decoration. Every pixel
   should help the user understand what they need to do.

4. **Accessible by default.** WCAG 2.1 AA minimum. Keyboard navigable.
   Screen reader tested. 4.5:1 contrast. Visible focus indicators. If
   compliance teams can't use it, it doesn't exist.

5. **Zero friction.** No signup, no paywall, no cookie banner beyond
   essential. Works immediately. State saved locally. Export everything.
   The tool respects the user's time and privacy absolutely.

<!-- MANUAL ADDITIONS END -->
