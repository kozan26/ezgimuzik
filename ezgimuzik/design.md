# Design Specification — Ezgi Muzik Landing Page

Source page: [premium-pitch-prep.lovable.app](https://premium-pitch-prep.lovable.app/)

## 1) Product Intent

This page is a local, conversion-focused landing page for a trusted music store in Bolu.
Its primary goal is to move users from uncertainty ("which instrument should I buy?") to a direct contact action (WhatsApp or phone), while reinforcing trust through expertise, social proof, and clear process.

## 2) Primary Audience

- First-time buyers who need guidance
- Parents buying an instrument for children
- Intermediate/pro users seeking fair pricing and reliable setup/support
- Users comparing online purchase vs in-store experience

## 3) Core Value Proposition

"Doğru enstrümanı, doğru ellerden alın."

Key promise:
- Try before buying
- Expert, non-pushy guidance
- Same-day setup/delivery readiness
- Long-term support

## 4) Information Architecture (Page Flow)

1. **Hero** (clear value + immediate CTA + trust stats)
2. **Authorized Brands** (institutional trust)
3. **Philosophy / Benefits** (how this store is different)
4. **Collection** (high-level product categories)
5. **Process (3 steps)** (decision simplification)
6. **Testimonials** (social proof)
7. **FAQ** (objection handling)
8. **Contact** (primary conversion endpoint)
9. **Footer** (business identity and utility)

This sequence supports a logical persuasion arc:
Trust -> Relevance -> Clarity -> Proof -> Action.

## 5) Visual Direction

### 5.1 Tone
- Premium but warm
- Editorial / boutique showroom feel
- High contrast, low noise

### 5.2 Color Strategy
- **Base:** deep dark neutrals (charcoal/black-brown)
- **Accent:** warm amber/copper for CTAs and highlights
- **Support:** soft grays for secondary copy
- **Trust green:** only for success/verification cues

### 5.3 Typography
- Bold, compact display style for headlines
- Clean sans body for readability
- Strong hierarchy:
  - H1/H2: brand confidence
  - Short subhead lines
  - Compact helper labels and chips

## 6) Layout Principles

- Use a max-width container and consistent horizontal rhythm.
- Keep sections visually distinct with alternating backgrounds.
- Favor larger vertical spacing between major sections; tighter spacing inside cards.
- Keep hero and major CTA regions uncluttered.
- Use card systems for repeatable information blocks (steps, testimonials, contact cards).

## 7) Section-by-Section Design Notes

## Hero
- Left: proposition + main CTA
- Right: atmospheric instrument visual
- Include compact trust bar (rating, years, customer count, setup count)
- Main CTA should stay short and action-oriented; secondary line can clarify value

## Authorized Brands
- Horizontal marquee/grid style is acceptable
- Improve readability of brand names and category subtitles
- Add one concise guarantee line (original product, invoice, after-sales support)

## Philosophy / Benefits
- Use 3-4 concise benefit cards with numbered labels
- Keep each card to one headline + one supporting line

## Collection
- Category cards should emphasize instrument family first, brand second
- Visuals should be atmospheric rather than catalog-heavy

## Process (3 Steps)
- Keep as a simple, linear decision model:
  1) Contact
  2) Try/compare
  3) Leave with setup
- Time badges improve practical confidence

## Testimonials
- One featured "story card" + supporting smaller quotes
- Show source context clearly (Google)
- Avoid overlong quotes; prioritize scannability

## FAQ
- Questions should mirror real buyer intent
- Keep answers short and action-linked
- Ensure tap/click targets are mobile-friendly

## Contact
- Must prioritize conversion buttons (WhatsApp + phone)
- Map should support, not overshadow actions
- Keep key details immediately scannable:
  - Address
  - Phone
  - Hours
  - Directions

## Footer
- Keep same content, cleaner hierarchy
- Prioritize readability over density
- Social links can be compact pill buttons with icons

## 8) Interaction Behavior

- Smooth anchor navigation
- Sticky/transforming navbar on scroll
- FAQ accordion (single item open recommended)
- Metric counters may animate once on first viewport entry
- Sliders/carousels should:
  - support dot + arrow navigation
  - loop if used for compact storytelling
  - preserve readability on mobile (no overly dense overlays)

## 9) Accessibility Baseline

- Semantic sections and heading order
- Sufficient color contrast on dark backgrounds
- Visible focus styles for all interactive elements
- Tap target size >= 40px where possible
- Alt text for informative images; decorative media marked appropriately

## 10) Conversion Priorities

Primary conversion:
- WhatsApp contact

Secondary conversions:
- Phone call
- In-store visit intent (directions)

Micro-conversions:
- FAQ expansion
- Brand/proof engagement
- Process understanding

## 11) Content Style Guide

- Write in clear, direct Turkish
- Prefer customer-language questions in headings
- Keep sentences short; avoid jargon
- Replace generic claims with specific operational proof (years, reviews, setup, support)

## 12) QA Checklist (Visual + UX)

- Hero CTA remains visible and readable across breakpoints
- Trust metrics are legible and aligned
- Brand cards readable on mobile
- PAS/benefit cards keep border/contrast on hover and focus
- Featured testimonial clearly stands out
- Contact section has no clipped content or forced inner scrollbars
- Footer text remains readable on dark background

