# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm test           # Run all Playwright tests (desktop, tablet, mobile)
npm run test:qa    # Run responsive QA tests only
npm run test:ui    # Playwright interactive UI mode
```

## Architecture

**Astro v5 SSG** site for AmudarIO — a company with agricultural/environmental monitoring products. Deployed to Netlify.

### i18n Routing

All pages live under `src/pages/[lang]/`. The `[lang]` parameter is one of `uz` (default), `en`, `ru`. The root `src/pages/index.astro` redirects to `/uz/`. Astro's built-in i18n is configured in `astro.config.mjs` with `prefixDefaultLocale: true`.

Translation strings live in `src/i18n/translations/{en,uz,ru}.ts` and are accessed via helpers in `src/i18n/utils.ts`.

### Product Pages & 3D Scenes

Each product has a dedicated page (`oxus-ws.astro`, `oxus-airsense.astro`, `gozanlink.astro`, `jayhun-trap.astro`) that renders an interactive Three.js canvas. The canvas logic lives in `src/scripts/canvas/` — one file per product. Reusable 3D components (e.g., `CitySkyline`, `CottonField`, `WheatField`) live in `src/scripts/canvas/components/` and systems like smoke/particle effects in `src/scripts/canvas/systems/`.

### Script Entry Point

`src/scripts/main.ts` is the client-side entry point. It wires together:
- `three-background.ts` — particle background (Three.js)
- `story-manager.ts` — scroll-driven animation sequencing
- `ui.ts` — navbar, scroll reveals, animated counters

### Responsive Breakpoints

| Viewport | Size |
|---|---|
| Mobile | 390×844 (iPhone 14) |
| Tablet | 1024×768 (iPad Pro) |
| Desktop | 1280×720 |

Grid layouts follow: 4 cols → 2 cols at 1024px → 1 col at 768px. Use `clamp()` for responsive spacing. Touch targets minimum 44×44px on mobile.

### Layouts & Components

- `BaseLayout.astro` — root HTML shell, imports `global.css`, sets metadata
- `ProductLayout.astro` — wraps product detail pages
- `src/styles/global.css` — main stylesheet
- `src/styles/product-detail.css` — product page styles
