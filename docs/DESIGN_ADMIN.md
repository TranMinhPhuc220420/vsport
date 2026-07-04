---
version: beta
name: Shopify-admin
description: Calm, data-dense commerce dashboard. One green accent, flat surfaces, borders over shadows.
colors:
  primary: "#1A1A1A"
  secondary: "#6D7175"
  tertiary: "#008060"
  neutral: "#F1F2F4"
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
  md: 8px
  lg: 12px
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

Shopify-admin: e-commerce back-office aesthetic — flat off-white canvas, crisp white cards, a single calm green accent, dense but legible tables. Built for people who manage a store all day: low visual noise, high information density, one obvious way to act.

## Colors

The palette is built around neutral ink/gray text and a single accent that drives interaction.

- **Primary (`#1A1A1A`):** Headlines and high-emphasis text. Not used as a background.
- **Secondary (`#6D7175`):** Borders, captions, and metadata.
- **Tertiary (`#008060`):** The sole driver for interaction — primary buttons, active nav state, focus rings.
- **Neutral (`#F1F2F4`):** The page canvas.
- **Surface (`#FFFFFF`):** Cards and tables sit on top of the canvas.

## Typography

- **display:** Inter 5rem
- **h1:** Inter 2.5rem
- **body:** Inter 0.98rem
- **label:** Inter 0.72rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Do** prefer a 1px border over a shadow to separate surfaces.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.

## Dark mode

Admin dark mode is scoped entirely under `.vsport-admin` and piggybacks on the app-wide appearance toggle (`resources/js/hooks/use-appearance.tsx`), which adds a `.dark` class to `<html>`. `resources/css/admin.css` defines a second block selected by `:is(.dark .vsport-admin, .vsport-admin.dark)` that redefines every `--admin-*` variable (and the shadcn remap that depends on them) for dark surfaces. No component needs to know about light vs. dark — they only ever consume `var(--admin-*)` / the shadcn semantic vars, so the same markup renders correctly in both modes. The storefront (`.vsport-light`) intentionally ignores the `.dark` class and always renders light.
