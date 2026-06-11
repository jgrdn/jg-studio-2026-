# JG Studio — Portfolio (2026)

Custom build by **JG Studio**.

This repository contains Joey Gordon’s portfolio site, built as a fast, single-page React experience with a bespoke interaction layer (cursor variants, marquee, scroll-linked fades) and a lightweight content model.

## Stack

- React + TypeScript
- Vite
- Plain CSS (single stylesheet)

## Getting started

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Content edits

Most editable site content lives in:

- `src/content/site.ts` (name, intro/bio copy, brands list, agency strip, projects, recognition rows)

Key UI components:

- `src/App.tsx`
- `src/components/Hero.tsx`
- `src/components/HeroMedia.tsx`
- `src/components/Work.tsx`
- `src/components/AgencyMarquee.tsx`
- `src/components/Cursor.tsx`

Global styling:

- `src/index.css`

## Notes

- **Hero video**: `site.heroVideo` points to the MP4; `site.heroImage` is used as the poster/fallback.
- **Accessibility**: sections are labelled and interactive elements are keyboard-operable.

## Licence

© JG Studio. All rights reserved.
