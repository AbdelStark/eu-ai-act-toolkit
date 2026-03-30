# Polish Checklist - Impeccable Pass

Run these impeccable commands locally in Claude Code after `npm run dev`:

## Typography (impeccable /typeset)

- [ ] Replace Inter with a more distinctive font pairing. Inter is the #1 impeccable anti-pattern ("overused font"). Consider: Instrument Serif + Instrument Sans, or Source Serif + Source Sans, or DM Serif Display for headings + DM Sans for body. The institutional/regulatory feel wants a serif for headings.
- [ ] Check type scale: headings should use a modular scale (not arbitrary sizes)
- [ ] Article references should use a true monospace (JetBrains Mono is configured but verify it's loaded and used)

## Color (impeccable /colorize)

- [ ] Tint neutrals toward navy. Currently using Tailwind's default gray-* which is pure/cold. Tint toward the navy hue for warmth.
- [ ] The tier colors (red/orange/yellow/blue/green) are currently raw Tailwind defaults. Refine to be more sophisticated and less primary-school.
- [ ] Add subtle background texture or gradient to the hero section (currently flat navy)
- [ ] Check contrast ratios: white/70 text on navy header may be below WCAG AA

## Layout (impeccable /arrange)

- [ ] Landing page hero feels standard. Consider breaking the centered-text-with-two-buttons pattern. Maybe a split layout with the countdown prominently on one side.
- [ ] Feature cards are generic 3-column grid. Consider varied sizing or a different presentation.
- [ ] Timeline page: the alternating left-right layout is good. Check mobile responsiveness.
- [ ] Classify wizard: check step transitions feel smooth (add framer-motion if not already)

## Components (impeccable /normalize then /polish)

- [ ] CountdownBanner: uses mdash entity directly. Consider using a thin space or em-space for rhythm.
- [ ] RiskBadge: verify all 6 tiers render correctly with proper contrast
- [ ] Footer: "GitHub" link points to https://github.com (generic). Should point to the actual repo.
- [ ] Disclaimer banner: good that it exists. Verify dismiss persists across page navigation.
- [ ] Checklist items: test checkbox interaction, evidence attachment, and export flows
- [ ] Template editor: test markdown rendering and DOCX export

## Accessibility (impeccable /audit)

- [ ] Run axe-core audit on all pages
- [ ] Verify keyboard navigation through classifier wizard
- [ ] Screen reader test on timeline (ARIA labels for status dots)
- [ ] Focus styles visible on all interactive elements
- [ ] Skip navigation link

## Performance

- [ ] Verify no layout shift on page load (CLS)
- [ ] Check bundle sizes (currently 87KB shared JS - good)
- [ ] Static export generates all pages correctly
- [ ] Check no unnecessary client components (use server components where possible)

## Content

- [ ] Verify all article references link to the correct EU AI Act article
- [ ] Check worked examples render fully (chatbot, hiring tool, autonomous vehicle)
- [ ] Verify classification engine produces correct results for edge cases
- [ ] Timeline dates are accurate against the official regulation

## Before Going Public

- [ ] Update footer GitHub link to actual repo URL
- [ ] Add OG image (consider auto-generating with satori)
- [ ] Add favicon (currently none)
- [ ] Verify Vercel/static deployment works
- [ ] Test on mobile Safari, Chrome Android, desktop Firefox
- [ ] Remove any TODO/placeholder comments in code
