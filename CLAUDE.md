# Personal Blog — dgarbs51.com

Astro 6 static blog deployed to Cloudflare Pages.

## Stack

- **Framework:** Astro 6 with MDX and sitemap integrations
- **Styling:** Tailwind CSS v4 with CSS-first configuration (`src/styles/app.css`)
- **Images:** Sharp for optimization
- **Deploy:** Cloudflare Pages via git integration (auto-deploys on push)
- **Config:** `wrangler.jsonc` for Cloudflare Pages settings
- **Linting:** ESLint + Prettier with Astro and Tailwind plugins
- **Git hooks:** Husky + lint-staged (pre-commit: lint + format)
- **Package manager:** Bun (bun.lock)

## Commands

```sh
bun dev              # Start dev server
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # ESLint
bun run format       # Prettier
bun run format:check # Prettier (check only)
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

- Site URL: https://dgarbs51.com (set in astro.config.mjs)
- Output mode: static (pre-rendered)
- Tailwind v4 uses CSS-first config — all theme customization lives in `src/styles/app.css`
- Dark mode uses `.dark` class on `<html>` with `@custom-variant dark` in Tailwind
- Framework-specific rules auto-load from `.claude/rules/` based on file patterns
