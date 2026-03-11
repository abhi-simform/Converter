---
# Copilot Coding Agent Onboarding Instructions
---

## Project Summary
This repository is a modern React TypeScript web application for fast MKV to MP4 (and other formats) video container conversion using FFmpeg.wasm. All conversion happens client-side in the browser, preserving privacy and speed. The app features drag-and-drop upload, real-time progress, and instant download.

## High-Level Repository Information
- **Type:** Single-page web application
- **Languages:** TypeScript, JavaScript, CSS
- **Frameworks:** React 19, Vite, TailwindCSS
- **Video Processing:** FFmpeg.wasm
- **Size:** Small-to-medium (mainly src/, public/, config files)
- **Target Runtime:** Modern browsers (Chrome 68+, Firefox 79+, Safari 15.2+, Edge 79+)

## Build & Validation Instructions

### Environment Setup
- **Node.js:** Version 16 or later (required)
- **npm:** Use npm or yarn (npm preferred)
- **Browser:** Must support WebAssembly, SharedArrayBuffer, File API

### Bootstrap
- Always run `npm install` (or `npm ci`) before any build, test, or run step.

### Build
- Run `npm run build` to build for production.
  - This runs TypeScript build (`tsc -b`) and Vite build.
  - If you encounter errors, ensure dependencies are installed and Node version is correct.

### Development Server
- Run `npm run dev` to start the Vite development server.
- Access the app at [http://localhost:5173](http://localhost:5173).

### Preview Production Build
- Run `npm run preview` after building to preview the production build locally.

### Lint
- Run `npm run lint` to check code quality with ESLint.
- ESLint config: `eslint.config.js` (uses TypeScript, React, and browser globals)

### Test
- **No test scripts are defined** in package.json. If tests are added, document their commands and requirements here.

### Deployment
- Run `npm run deploy` to deploy to GitHub Pages (after `npm run build`).
- Predeploy step: `npm run predeploy` (runs build).

### Common Issues & Workarounds
- If build fails, check Node version and run `npm install` again.
- If dependency errors occur, delete `node_modules` and reinstall.
- If Vite server fails, check for port conflicts or browser compatibility.
- Always ensure `npm install` is run after pulling new changes.

## Project Layout & Architecture

### Key Files & Directories
- **src/**: Main source code
  - `App.tsx`: Main app component
  - `VideoConverter.tsx`: Video conversion logic/UI
  - `main.tsx`: Entry point
  - `index.css`: Global styles
  - `assets/`: Static assets (e.g., react.svg)
- **public/**: Static files for deployment (icons, manifest, robots.txt, etc.)
- **index.html**: Main HTML template
- **package.json**: Scripts, dependencies
- **vite.config.ts**: Vite config (plugins: React, Tailwind, PWA)
- **eslint.config.js**: ESLint config
- **tsconfig.json**, **tsconfig.app.json**, **tsconfig.node.json**: TypeScript configs

### Configuration Files
- **ESLint:** `eslint.config.js` (uses recommended JS, TypeScript, React hooks, React refresh)
- **TypeScript:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Vite:** `vite.config.ts` (PWA, Tailwind, FFmpeg exclusions)

### Validation Pipelines
- **No GitHub Actions or CI workflows** are present by default. If added, document their steps and requirements here.
- Manual validation: Build, lint, run, and preview steps as above.

### Explicit Instructions
- **Trust these instructions:** Only perform additional searches if information here is incomplete or found to be in error.
- **Always run `npm install` before build, lint, or run.**
- **Document new scripts, tests, or CI steps here if added.**

## Root Directory File List
- .git/, .github/, README.md, eslint.config.js, google5e6ce141e829012a.html, index.html, node_modules/, package-lock.json, package.json, public/, src/, tsconfig.app.json, tsconfig.json, tsconfig.node.json, vite.config.ts

## src Directory File List
- App.tsx, VideoConverter.tsx, assets/, copilot-instructions.md, ffmpeg.d.ts, index.css, main.tsx, vite-env.d.ts

## public Directory File List
- apple-touch-icon.png, favicon-96x96.png, favicon.ico, favicon.svg, robots.txt, site.webmanifest, sitemap.xml, web-app-manifest-192x192.png, web-app-manifest-512x512.png

---
