# Personal Blog — dgarbs51.com

Astro 6 static blog deployed to Cloudflare Pages.

## Stack

- **Framework:** Astro 6 with MDX and sitemap integrations
- **Images:** Sharp for optimization
- **Deploy:** Cloudflare Pages via `wrangler pages deploy`
- **Linting:** ESLint + Prettier with Astro plugins
- **Git hooks:** Husky + lint-staged (pre-commit: lint + format)
- **Package manager:** Bun (bun.lock)

## Commands

```sh
bun dev          # Start dev server
bun run build    # Production build
bun run preview  # Preview production build
bun run check    # TypeScript checking (astro check)
bun run lint     # ESLint
bun run format   # Prettier
./deploy.sh      # Build + deploy to Cloudflare Pages
```

## Project Structure

```
src/
├── components/   # Reusable .astro components
├── content/      # Blog posts (Markdown/MDX)
├── layouts/      # Page layouts
├── pages/        # File-based routes
└── styles/       # Global styles
```

## Guidelines

- Site URL: https://dgarbs51.com (set in astro.config.mjs)
- Output mode: static (pre-rendered)
- Framework-specific rules auto-load from `.claude/rules/` based on file patterns
