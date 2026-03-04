# AmudarIO Webpage

A multilingual website built with [Astro](https://astro.build), featuring 3D graphics with Three.js. Supports Uzbek (uz), English (en), and Russian (ru).

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** (comes with Node.js)

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The site will be available at **http://localhost:4321** (or the port shown in the terminal).

### 3. Build for production (optional)

```bash
npm run build
```

### 4. Preview the production build (optional)

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the site for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Playwright tests |
| `npm run test:qa` | Run responsive QA tests |
| `npm run test:ui` | Run tests with Playwright UI |

## Project Structure

- `src/` — Source code (pages, components, styles)
- `public/` — Static assets
- `astro.config.mjs` — Astro configuration
