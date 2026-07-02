---
version: alpha
name: Stripe
description: Signature purple gradients. Weight-300 elegance.
colors:
  primary: "#0A2540"
  secondary: "#425466"
  tertiary: "#635BFF"
  neutral: "#F6F9FC"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
typography:
  display:
    fontFamily: Inter
    fontSize: 5rem
    fontWeight: 300
    letterSpacing: "-0.04em"
  h1:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 500
  body:
    fontFamily: Inter
    fontSize: 0.98rem
    lineHeight: 1.6
  label:
    fontFamily: Inter
    fontSize: 0.72rem
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  sm: 6px
  md: 10px
  lg: 16px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
---
## Overview

Stripe: payment-infrastructure aesthetic — indigo→magenta gradient primaries, crisp white surface, light sans.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`#0A2540`):** Headlines and core text.
- **Secondary (`#425466`):** Borders, captions, and metadata.
- **Tertiary (`#635BFF`):** The sole driver for interaction. Reserve it.
- **Neutral (`#F6F9FC`):** The page foundation.

## Typography

- **display:** Inter 5rem
- **h1:** Inter 2.5rem
- **body:** Inter 0.98rem
- **label:** Inter 0.72rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.
