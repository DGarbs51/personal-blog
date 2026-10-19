# Personal Blog — dgarbs51.com

Astro 7 static blog deployed to Cloudflare Workers as static assets.

## Stack

- **Framework:** Astro 7 with MDX and sitemap integrations
- **Styling:** Tailwind CSS v4 with CSS-first configuration (`src/styles/app.css`)
- **Images:** Sharp for optimization
- **Deploy:** Cloudflare Workers Builds via git integration (auto-deploys on push to `main`)
- **Config:** `wrangler.jsonc` for the assets-only Worker (serves `./dist`, no Worker script)
- **Formatting:** Prettier with Astro and Tailwind plugins
- **Linting:** ESLint for root `*.js` tooling/config (Espree needs explicit `sourceType: module`)
- **Package manager:** Bun (bun.lock)

## Commands

```sh
bun dev              # Start dev server
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # ESLint (root JS / shared tooling)
bun run format       # Prettier
```

## Project Structure

```
src/
├── components/   # Reusable .astro components
├── content/      # Blog posts (Markdown/MDX)
├── layouts/      # Page layouts
├── pages/        # File-based routes
└── styles/       # Global styles (Tailwind config in app.css)
```

## Guidelines

- Site URL: https://dgarbs51.com (set in `astro.config.js`)
- Output mode: static (pre-rendered)
- `compressHTML: true` is set on purpose. The Astro 7 default (`"jsx"`) drops spaces between inline elements
- Tailwind v4 uses CSS-first config — all theme customization lives in `src/styles/app.css`
- Dark mode uses `.dark` class on `<html>` with `@custom-variant dark` in Tailwind
- Framework-specific rules auto-load from `.claude/rules/` based on file patterns
