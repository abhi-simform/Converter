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

# Frontend Code Review Guidelines & Best Practices

This document outlines the standard practices and rules for writing and reviewing frontend code. Reviewers should use the checklist at the bottom, and contributors must ensure their code adheres to these guidelines before opening a Pull Request (PR).

---

## 1. React Best Practices

**No Conditional Hook Calls**
Never call hooks (`useState`, `useEffect`, etc.) inside loops, conditions, or nested functions.
> Why: React relies on the exact order hooks are called to associate state with the correct component. Conditional hooks break this order and cause runtime crashes.

**Strict Dependency Arrays**
Ensure all reactive variables used inside `useEffect`, `useMemo`, and `useCallback` are included in the dependency array. Never suppress `eslint-plugin-react-hooks` warnings without a documented reason.
> Why: Missing dependencies cause stale closures and hard-to-trace bugs.

**Stable List Keys**
Always use stable, unique identifiers (e.g., `item.id`) for the `key` prop. Never use array index if the list can be reordered, filtered, or modified.

**Limit Prop Drilling**
Avoid passing props more than 2–3 levels deep.
> Fix: Use React Context, component composition (children as props), or a state manager (Zustand, Redux) for deeply shared state.

**Avoid `0 &&` Conditional Rendering**
When using short-circuit rendering, ensure the left side is a boolean.
> Why: `{items.length && <List />}` renders the string `"0"` when the array is empty. Use `{items.length > 0 && <List />}` instead.

**No Direct DOM Manipulation**
Never use `document.querySelector`, `document.getElementById`, or similar APIs to access or mutate DOM nodes. Use `useRef` instead.

**Keep Components Focused**
Components should ideally stay under ~200 lines. If a component is significantly larger, it is likely doing too much and should be split into smaller, focused components.

**Extract Reusable Logic into Custom Hooks**
Stateful logic that is used across multiple components should be extracted into a custom hook (`useX`). Keep hook files in a dedicated `hooks/` directory.

**`useEffect` is Not for Derived Data**
Do not use `useEffect` + `setState` to compute derived values from existing state or props. Use `useMemo` directly in the render body.

```tsx
// ❌ Avoid
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Prefer
const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
```

**Don't Over-Memoize**
Apply `React.memo`, `useMemo`, and `useCallback` only where a real, measurable performance problem exists — not preemptively. Premature memoization adds complexity and can itself cause bugs.

---

## 2. Tailwind CSS Guidelines

**No Arbitrary Values**
Flag and remove arbitrary values such as `w-[347px]`, `text-[13px]`, `mt-[23px]`, or `bg-[#a3b1cc]`.
> Fix: Use existing design token classes (e.g., `w-80`, `text-sm`, `mt-6`). If a value is needed repeatedly, extend `tailwind.config.js` rather than scattering arbitrary values through the codebase.

**No Dynamic Class String Interpolation**
Never construct class names dynamically:
```tsx
// ❌ Will be purged in production — Tailwind JIT cannot detect it
<div className={`bg-${color}-500`} />

// ✅ Use a complete string map
const colorMap = { red: 'bg-red-500', blue: 'bg-blue-500' };
<div className={colorMap[color]} />
```

**No Conflicting or Duplicate Classes**
Avoid applying contradictory utilities to the same element (e.g., `text-sm text-lg`, `flex block`). Use `tailwind-merge` (via `cn()`) to resolve conflicts programmatically.

```tsx
// ❌ Avoid — conflicting display and text size utilities
<div className="flex block text-sm text-lg font-bold font-normal">

// ✅ Use cn() / tailwind-merge — last value wins, conflicts are resolved
<div className={cn("flex text-sm font-normal", isLarge && "text-lg", isBold && "font-bold")}>
```

**Mobile-First Responsive Design**
Always write base styles for mobile, then layer responsive prefixes for larger screens (`sm:`, `md:`, `lg:`, `xl:`). Never write desktop-first overrides.

```tsx
// ❌ Avoid — desktop-first, requires undoing styles for mobile
<div className="flex-row lg:flex-col p-8 lg:p-4 text-lg lg:text-sm">

// ✅ Mobile-first — base is mobile, larger screens override progressively
<div className="flex-col p-4 text-sm md:flex-row md:p-8 md:text-lg">
```

**Use `cn()` for Conditional and Composed Classes**
Always use the project's `cn()` utility (or `clsx` + `tailwind-merge`) to handle conditional class logic. Never use raw string concatenation or ternaries with class strings.

```tsx
// ❌ Avoid — string concatenation, no conflict resolution
<button className={"px-4 py-2 rounded " + (isPrimary ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800")}>

// ❌ Avoid — nested ternaries become unreadable quickly
<button className={`px-4 py-2 ${isLarge ? "text-lg" : "text-sm"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>

// ✅ Use cn() — readable, merge-safe, and easy to extend
<button className={cn(
  "px-4 py-2 rounded font-medium transition-colors",
  isPrimary ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-800 hover:bg-gray-200",
  isLarge && "text-lg px-6 py-3",
  isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
)}>
```

**No `style={{}}` for Static Values**
Avoid inline `style` props for values that could be expressed as Tailwind classes.

```tsx
// ❌ Avoid — bypasses the design system, not purgeable, not responsive
<div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>

// ✅ Use Tailwind utilities
<div className="flex items-center gap-2 text-gray-700">

// Exception — genuinely dynamic values that cannot be known at build time:
<div style={{ width: `${progressPercent}%` }} className="h-2 bg-blue-500 rounded-full">
```

**Dark Mode Variants**
When the application supports dark mode, every color-related class must have a corresponding `dark:` variant — or use semantic tokens (see shadcn/ui section) that handle this automatically.

```tsx
// ❌ Avoid — hardcoded colors with no dark mode consideration
<div className="bg-white text-gray-900 border border-gray-200">
  <p className="text-gray-500">Subtitle</p>
</div>

// ✅ Option A — manual dark: variants
<div className="bg-white text-gray-900 border border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
  <p className="text-gray-500 dark:text-gray-400">Subtitle</p>
</div>

// ✅ Option B (preferred with shadcn) — semantic tokens handle dark mode automatically
<div className="bg-background text-foreground border border-border">
  <p className="text-muted-foreground">Subtitle</p>
</div>
```

**Avoid `!important` Overrides**
Frequent use of the `!` prefix (e.g., `!text-red-500`) signals an underlying specificity problem. Resolve the root cause rather than forcing overrides.

```tsx
// ❌ Avoid — forcing !important is a symptom, not a fix
<p className="!text-red-500 !font-bold !mt-0">Error message</p>

// ❌ Also avoid — fighting a third-party component with overrides
<ThirdPartyCard className="!bg-white !shadow-none" />

// ✅ Fix the root cause — use cn() to ensure the right class wins via tailwind-merge
<p className={cn("text-gray-700", hasError && "text-red-500 font-bold", "mt-0")}>

// ✅ For third-party components — wrap and apply styles at the correct DOM level
<div className="[&_.card]:bg-white [&_.card]:shadow-none">
  <ThirdPartyCard />
</div>
```

**Organize Classes Consistently**
Long class strings should follow a consistent order: layout → spacing → sizing → typography → color → border → shadow → state → responsive. Use `cn()` with logical groups for readability.

```tsx
// ❌ Avoid — random order, hard to scan for conflicts or missing properties
<div className="text-white hover:bg-blue-600 flex p-4 rounded-lg font-semibold bg-blue-500 w-full shadow-md items-center text-sm gap-2 justify-between border border-blue-400">

// ✅ Organized by concern — easy to scan, audit, and extend
<div className={cn(
  // Layout & alignment
  "flex items-center justify-between gap-2",
  // Spacing & sizing
  "w-full p-4",
  // Typography
  "text-sm font-semibold",
  // Color
  "bg-blue-500 text-white",
  // Border & shadow
  "rounded-lg border border-blue-400 shadow-md",
  // Interactive states
  "hover:bg-blue-600 transition-colors",
)}>
```

---

## 3. shadcn/ui Guidelines

**Do Not Directly Modify `ui/` Components**
Treat files inside `components/ui/` as external library code — do not edit them directly for one-off customization.
> Why: Direct edits make it impossible to safely upgrade or regenerate these components later. Instead, wrap the component or compose a new variant.

**Use Semantic Color Tokens**
Always use semantic CSS variable tokens (`bg-primary`, `text-muted-foreground`, `border-destructive`) rather than hardcoded Tailwind colors (`bg-blue-600`) or hex values.
> Why: Semantic tokens automatically respond to theme changes and dark mode via the CSS variables defined in `globals.css`.

**Enforce ARIA on Interactive Primitives**
All complex interactive components (Dialog, Popover, Tooltip, AlertDialog) must meet their ARIA requirements:
- `DialogContent` always requires a `DialogTitle`.
- `TooltipProvider` must be present at the app root.
- Popovers and dropdowns must have clear `aria-labelledby` or `aria-describedby` associations where applicable.

**Use shadcn Form Primitives with react-hook-form**
When building forms, always use `Form`, `FormField`, `FormItem`, `FormLabel`, and `FormMessage` from shadcn. These components automatically wire up accessibility attributes (`htmlFor`, `aria-describedby`, `aria-invalid`) that would otherwise need to be added manually.

**Don't Re-Implement What shadcn Provides**
Do not build custom dialogs, dropdowns, tooltips, popovers, or command menus from scratch. Use the equivalent shadcn primitive and extend as needed.

---

## 4. TypeScript Standards

**No `any` Types**
Do not use `any`. For unknown external data (API responses, third-party payloads), use `unknown` and narrow it, or validate with Zod.

**No Unexplained Assertions**
Avoid `as SomeType` (type casting) and `!` (non-null assertion) unless strictly necessary.
> Why: Both override the compiler. If the assumption is wrong, the app crashes at runtime. If they must be used, add an inline comment explaining why the assertion is safe.

**Prefer `interface` for Props, `type` for Unions**
- Use `interface` for component prop definitions — they are easily extended and show up clearly in IDE tooling.
- Use `type` for unions, intersections, mapped types, and utility types.
- Name component prop interfaces `ComponentNameProps` consistently.

**Avoid `enum` — Use `const` Objects Instead**
```ts
// ❌ Avoid — TypeScript enums have runtime overhead and reverse-mapping quirks
enum Status { Active, Inactive }

// ✅ Prefer
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = typeof Status[keyof typeof Status];
```

**No Broad or Weak Types**
Avoid `object`, `Function`, `{}`, or `Record<string, any>` where a more precise type can be defined.

---

## 5. State Management

**Colocate State Close to Where It's Used**
Do not reach for global state by default. State should live at the lowest component level that satisfies the requirement.

**Don't Store Server Data in Client State**
API responses should be managed by a data-fetching library (React Query, SWR) — not duplicated into Redux or Zustand.
> Why: Data-fetching libraries handle caching, background refetching, deduplication, and error/loading states. Storing server data manually in client state replicates this work and introduces sync bugs.

**Use URL State for Shareable UI**
Filters, pagination, selected tabs, and search queries should be stored in URL query parameters — not in component state.
> Why: URL state is bookmarkable, shareable, and survives page refreshes.

**Avoid Putting Frequently Updating Values in Context**
React Context re-renders all consumers on every value change. Avoid putting high-frequency values (scroll position, mouse coordinates, timers) in context. Use Zustand or a dedicated ref-based solution instead.

**Select State Slices, Not the Entire Store**
When consuming a Zustand or Redux store, always select the minimal slice of state the component needs — not the whole store object. Subscribing to the entire store causes unnecessary re-renders.

---

## 6. Performance & Optimization

**Explicit Image Dimensions**
All `<img>` tags and Next.js `<Image>` components must have explicit `width` and `height` attributes. Use `loading="lazy"` for all images below the fold.
> Why: Prevents Cumulative Layout Shift (CLS), a Core Web Vital that directly impacts SEO and user experience.

**Memoize Expensive Computations**
Do not perform heavy sorting, filtering, or data transformation directly in the render body. Wrap expensive operations in `useMemo`.

**Avoid New References in Props to Memoized Components**
Object literals and array literals created inline as props defeat the purpose of `React.memo`:
```tsx
// ❌ New object reference on every render — React.memo is bypassed
<Chart config={{ color: 'red' }} />

// ✅ Define stable references outside the component or memoize them
const chartConfig = { color: 'red' };
<Chart config={chartConfig} />
```

**Use Route-Level Code Splitting**
Use `React.lazy` + `Suspense` for route-level code splitting. Large dependencies (charting libraries, rich text editors, PDF tools) should never be bundled into the main chunk if they are only needed on specific pages.

**Optimize Images**
Serve images in modern formats (WebP, AVIF). Never serve images at full resolution when a smaller size will do. Use Next.js `<Image>` or an equivalent CDN-based optimization pipeline.

---

## 7. Accessibility (a11y)

**Use Semantic HTML**
Use the correct HTML element for the job. `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>`, `<article>` for page structure. Never use `<div onClick>` or `<span onClick>` as interactive elements.

**Keyboard Navigation**
All interactive elements (buttons, links, inputs, custom controls) must be reachable and operable using only the keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys as appropriate).

**Visible Focus States**
Never use `focus:outline-none` without providing a visible custom focus indicator.
> Fix: Use `focus-visible:ring-2 focus-visible:ring-primary` or equivalent. Users navigating by keyboard must always be able to see where focus is.

**Descriptive Alt Text**
Every `<img>` must have an `alt` attribute:
- Informative images: descriptive alt text explaining the content.
- Decorative images: empty string `alt=""` so screen readers skip them.
- Never omit `alt` entirely.

**Correct Heading Hierarchy**
Maintain a logical heading order (`h1` → `h2` → `h3`). Do not skip heading levels for visual sizing purposes — use CSS for sizing instead.

**Color Is Not the Only Indicator**
Never rely on color alone to convey meaning (e.g., red = error, green = success). Always pair color with an icon, label, or text description.

**WCAG AA Contrast**
Text must meet a minimum contrast ratio of 4.5:1 against its background for normal text, and 3:1 for large text (18px+ or 14px+ bold).

---

## 8. Forms

**Loading and Disabled States**
Form submit buttons must be `disabled` and show a loading indicator while a submission is in progress.
> Why: Prevents duplicate form submissions that can result in duplicate data or charges.

**Accessible Field-Level Errors**
Form validation errors must be:
- Displayed adjacent to the relevant input field.
- Associated with the input via `aria-describedby`.
- The input itself must have `aria-invalid="true"` when in an error state.

**Never Clear Forms on Failed Submission**
Preserve user input when a submission fails. Only clear the form on success.

**Client Validation is UX; Server Validation is Security**
Client-side validation (Zod, yup) improves user experience but must never replace server-side validation. Always validate and sanitize inputs on the server.

**Share Zod Schemas Between Client and Server**
Define validation schemas once and import them in both the frontend form and the backend API handler to ensure consistency and eliminate duplication.

**Prefer `react-hook-form` + `zod` for Non-Trivial Forms**
Manual `useState` form handling does not scale. Use `react-hook-form` for performance and `zod` for schema-based validation on all forms beyond a single input.

---

## 9. Data Fetching

**Use a Data-Fetching Library for Server State**
Use React Query or SWR for all server state. Do not use `useEffect` + `useState` to manually fetch data when a data-fetching library is available.

**Always Handle Loading and Error States**
Every data-dependent UI must account for three states: loading, error, and success. Never render only the success state.

**Use Consistent Query Key Factories**
Centralize React Query key definitions in a `queryKeys` factory object to prevent typos and duplication:
```ts
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
  list: (filters: UserFilters) => ['users', 'list', filters] as const,
};
```

**Don't Set `staleTime: 0` for Stable Data**
Avoid overly aggressive refetch settings for data that does not change frequently. Tune `staleTime` and `gcTime` appropriately per query.

**Sanitize API Error Messages**
Never render raw API error messages directly to the user. Translate them into human-readable, user-friendly messages.

---

## 10. General Frontend & Security

**No Console Statements in Production**
Remove all `console.log`, `console.warn`, and `console.error` statements before merging. Use a proper logger (with environment-aware log levels) for intentional runtime logging.

**No Secrets in Client-Side Environment Variables**
Never expose sensitive values (API keys, database credentials, tokens) in variables prefixed with `NEXT_PUBLIC_`, `VITE_`, or `REACT_APP_`. These are embedded in the client bundle and visible to anyone.

**Sanitize HTML Before Rendering**
Never use `dangerouslySetInnerHTML` without passing content through a strict sanitization library (e.g., DOMPurify) first.
> Why: Unsanitized HTML is a direct XSS (Cross-Site Scripting) attack vector.

**No Commented-Out Code**
Remove commented-out code before merging. Use version control history to recover old code. Commented-out blocks add noise, confuse reviewers, and rot quickly.

**Consistent Naming Conventions**
- Boolean variables and props should use an `is`, `has`, `can`, or `should` prefix (e.g., `isLoading`, `hasError`, `canSubmit`).
- Event handler props should use an `on` prefix (e.g., `onClick`, `onSubmit`, `onClose`).
- Handler function implementations should use a `handle` prefix (e.g., `handleClick`, `handleFormSubmit`).

**Internationalization (i18n)**
If the application supports multiple locales, never hardcode user-facing strings directly in components. Use the project's i18n library (e.g., `next-intl`, `react-i18next`). Use `Intl` APIs for locale-aware date, number, and currency formatting.

**Manage z-index with a Scale**
Never use arbitrary `z-index` values (e.g., `z-[9999]`). Define a documented stacking scale in the Tailwind config (e.g., `z-modal`, `z-overlay`, `z-tooltip`) to prevent z-index wars.

---

## 📝 Comprehensive Code Review Checklist

### React & Hooks
- [ ] No conditional hook calls (no hooks inside loops, conditions, or nested functions)
- [ ] `useEffect`, `useMemo`, and `useCallback` dependency arrays are complete and correct
- [ ] List `key` props use stable IDs, not array indices
- [ ] Prop drilling is limited to 2–3 levels maximum
- [ ] No `0 &&` short-circuit rendering (use `count > 0 &&` instead)
- [ ] No `useEffect` used purely to derive state (use `useMemo` instead)
- [ ] No direct DOM manipulation via `document.querySelector` (use `useRef`)
- [ ] Components are focused and under ~200 lines
- [ ] Reusable stateful logic is extracted into custom hooks

### Tailwind CSS
- [ ] No arbitrary values (`w-[x]`, `text-[x]`, `bg-[#x]`, `mt-[x]`)
- [ ] No dynamic class string interpolation (`bg-${color}-500`)
- [ ] No conflicting or duplicate utility classes on the same element
- [ ] Responsive design follows a mobile-first approach
- [ ] `cn()` or `clsx` is used for all conditional and composed class strings
- [ ] No `style={{}}` for values expressible as Tailwind classes
- [ ] `dark:` variants present for color classes in dark-mode-enabled apps
- [ ] No frequent use of `!important` overrides

### shadcn/ui
- [ ] `components/ui/` files are not directly modified for one-off customization
- [ ] Semantic color tokens used (`bg-primary`, `text-muted-foreground`) — no hardcoded hex or Tailwind colors
- [ ] `DialogContent` always includes a `DialogTitle`
- [ ] `TooltipProvider` is present at the app root
- [ ] shadcn `Form` primitives used with `react-hook-form` for accessible wiring
- [ ] No custom re-implementations of primitives already available in shadcn

### TypeScript
- [ ] No `any` types — use `unknown` with narrowing, or Zod for validation
- [ ] No unexplained `as` type assertions or `!` non-null assertions
- [ ] No broad/weak types (`object`, `Function`, `{}`)
- [ ] `const` objects with `as const` preferred over `enum`
- [ ] Component prop interfaces are named `ComponentNameProps`

### State Management
- [ ] State is colocated as close to where it is used as possible
- [ ] Server/API data is managed by React Query or SWR, not duplicated in client state
- [ ] Shareable UI state (filters, pagination, tabs) lives in URL query params
- [ ] Store subscriptions select a slice, not the entire store object

### Performance
- [ ] Images have explicit `width` and `height` attributes
- [ ] Images below the fold use `loading="lazy"`
- [ ] Expensive computations in render are wrapped in `useMemo`
- [ ] Route-level code splitting used via `React.lazy` + `Suspense`
- [ ] No inline object/array literals as props to memoized components

### Accessibility (a11y)
- [ ] Semantic HTML elements used — no `<div onClick>` or `<span onClick>`
- [ ] All interactive elements are focusable and keyboard-operable
- [ ] `focus:outline-none` is not used without a custom visible focus style
- [ ] All images have appropriate `alt` text (empty string for decorative)
- [ ] Heading hierarchy is logical and unbroken (`h1` → `h2` → `h3`)
- [ ] Color is not the sole means of conveying information
- [ ] Dialogs, Tooltips, and Popovers meet their ARIA requirements

### Forms
- [ ] Submit buttons are disabled and show a loading state during submission
- [ ] Field-level errors are visible, adjacent to the input, and linked via `aria-describedby`
- [ ] Inputs have `aria-invalid="true"` when in an error state
- [ ] Form is not cleared on failed submission — user input is preserved
- [ ] `react-hook-form` + `zod` used for non-trivial forms
- [ ] Server-side validation exists and is not skipped

### Data Fetching
- [ ] React Query or SWR used for server state — no manual `useEffect` fetching
- [ ] Loading, error, and empty states are all handled in the UI
- [ ] Query keys use a consistent factory pattern
- [ ] API error messages are sanitized before displaying to the user

### General & Security
- [ ] No `console.log`, `console.warn`, or `console.error` left in code
- [ ] No sensitive secrets in `NEXT_PUBLIC_`, `VITE_`, or `REACT_APP_` env variables
- [ ] `dangerouslySetInnerHTML` not used without DOMPurify or equivalent sanitization
- [ ] No commented-out code blocks
- [ ] Boolean props/variables use `is`, `has`, `can`, or `should` prefix
- [ ] No hardcoded user-facing strings in components (use i18n if app is localized)
- [ ] No arbitrary `z-index` values outside the documented stacking scale