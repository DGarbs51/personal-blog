---
paths:
  - "**/*.astro"
  - "**/*.mdx"
  - "**/astro.config.*"
  - "**/content.config.ts"
  - "**/src/actions/**"
  - "**/src/middleware.*"
---

# Astro Rules

Astro 5.x / 6.x best practices for AI-assisted development. Astro renders zero JavaScript by default — every component outputs static HTML unless explicitly opted into client-side interactivity via `client:*` directives (island architecture).

### Project Structure

```
src/
├── assets/              # Images processed by Astro (optimized)
├── components/          # Reusable .astro and framework components
├── content/             # Content collection source files (Markdown, MDX, JSON)
├── content.config.ts    # Content collections configuration (Astro 5+)
├── layouts/             # Page layout components
├── pages/               # File-based routing (REQUIRED directory)
├── styles/              # Global CSS/Sass stylesheets
└── utils/               # Helper functions, shared logic
```

- `src/pages/` is the only required subdirectory — every file here becomes a route.
- `public/` files copy directly to build output (no processing). Use for favicons, robots.txt, PDFs.
- `src/assets/` is where images go for optimization.
- `src/content.config.ts` (Astro 5+) replaces the old `src/content/config.ts`.
- Prefix files with `_` to exclude from routing: `src/pages/_draft.astro`.

### Component Anatomy

```astro
---
// COMPONENT SCRIPT (server-side only, never reaches browser)
import Button from "../components/Button.astro";

interface Props {
  title: string;
  subtitle?: string;
}

const { title, subtitle = "Default subtitle" } = Astro.props;
const data = await fetch("https://api.example.com/data").then(r => r.json());
---

<!-- COMPONENT TEMPLATE -->
<section>
  <h1>{title}</h1>
  <p>{subtitle}</p>
  <Button label="Click me" />
</section>

<style>
  /* Scoped CSS — only applies to this component */
  section {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
```

**Rules:**

- Component script runs **server-side only**.
- Top-level `await` is supported in frontmatter.
- Template supports JSX-like expressions: `{variable}`, `{condition && <Tag />}`, `{items.map(item => <li>{item}</li>)}`.
- Always define a `Props` interface for type safety.
- Use destructuring with default values for optional props.
- Never pass functions as props to hydrated components (not serializable).

### Slots

```astro
<!-- Default slot -->
<div class="card">
  <slot />
</div>

<!-- Named slots -->
<header><slot name="header" /></header>
<main><slot /></main>
<footer><slot name="footer" /></footer>

<!-- Fallback content -->
<slot name="sidebar">
  <p>Default sidebar when nothing provided</p>
</slot>

<!-- Slot transfer through nested layouts -->
<BaseLayout>
  <slot name="head" slot="head" />
  <slot />
</BaseLayout>
```

- Prefer slots over passing HTML through props.
- Use props for data/configuration, slots for content/structure.
- Framework components (`.jsx`, `.svelte`) cannot import `.astro` components — pass content via slots.

### Content Collections (Astro 5+)

```typescript
// src/content.config.ts
import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: reference("authors"),
  }),
});

export const collections = { blog };
```

| Loader   | Purpose               | Usage                                                      |
| -------- | --------------------- | ---------------------------------------------------------- |
| `glob()` | Load from directories | `glob({ pattern: '**/*.md', base: './src/content/blog' })` |
| `file()` | Load from single file | `file('src/data/dogs.json')`                               |
| Custom   | External API, CMS, DB | Implement a loader function                                |

```typescript
// Querying
import { getCollection, getEntry, render } from "astro:content";

const allPosts = await getCollection("blog");
const published = await getCollection("blog", ({ data }) => !data.draft);
const post = await getEntry("blog", "my-post-slug");
const { Content, headings } = await render(post);
```

- Always define a schema for validation and TypeScript types.
- Use `z.coerce.date()` for date fields.
- Use `reference()` for cross-collection relationships.
- Run `npx astro sync` after schema changes to regenerate types.

### Routing

```
src/pages/index.astro          -> /
src/pages/about.astro          -> /about
src/pages/blog/index.astro     -> /blog
src/pages/blog/[slug].astro    -> /blog/:slug (dynamic)
src/pages/docs/[...slug].astro -> /docs/* (catch-all)
```

```astro
---
// Dynamic route with content collections
import { getCollection, render } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map(post => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
```

**Route priority:** Static routes > Named dynamic `[slug]` > Rest `[...slug]` > Alphabetical.

**SSR routes** (with adapter): Set `export const prerender = false;` and skip `getStaticPaths()`.

**Pagination:**

```astro
---
export async function getStaticPaths({ paginate }) {
  const posts = await getCollection("blog");
  return paginate(posts, { pageSize: 10 });
}
const { page } = Astro.props;
---
```

### Client Directives (Island Architecture)

| Directive                 | Priority     | When to Use                                            |
| ------------------------- | ------------ | ------------------------------------------------------ |
| `client:load`             | Immediate    | Above-fold interactive elements (buy buttons, auth UI) |
| `client:idle`             | Browser idle | Important but not critical (newsletter, chat widget)   |
| `client:visible`          | In viewport  | Below-fold content, heavy components                   |
| `client:media="(query)"`  | Media match  | Breakpoint-specific components (mobile menu)           |
| `client:only="framework"` | Client-only  | Browser-only APIs, SSR-incompatible components         |

**Decision tree:**

- No interactivity needed? -> No directive (static HTML)
- Must work immediately? -> `client:load`
- Above the fold? -> `client:idle`
- Below the fold? -> `client:visible`
- Only at certain screen sizes? -> `client:media`
- Breaks during SSR? -> `client:only`

### Server Islands

```astro
<!-- Dynamic server-rendered content on otherwise static pages -->
<UserAvatar server:defer>
  <div slot="fallback" class="skeleton avatar-skeleton"></div>
</UserAvatar>
```

- Requires an adapter (Cloudflare, Netlify, Node, etc.).
- Can access cookies, headers, sessions, databases.
- Props must be serializable and small (< 2048 bytes for HTTP caching).
- Always provide `slot="fallback"` for good UX.

### Image Optimization

```astro
---
import { Image, Picture } from "astro:assets";
import heroImage from "../assets/hero.png";
---

<!-- Local image (optimized) -->
<Image src={heroImage} alt="Hero banner" />

<!-- Multiple formats -->
<Picture src={heroImage} formats={["avif", "webp"]} alt="Hero" />

<!-- Responsive (Astro 5.10+) -->
<Image
  src={heroImage}
  alt="Hero"
  layout="constrained"
  width={800}
  height={600}
/>
```

- **Always import from `src/assets/`** for optimization (not `public/`).
- `alt` text is required on `<Image>` and `<Picture>`.
- Use `<Picture>` with `formats={['avif', 'webp']}` for max compression.
- SVGs can be imported as components (Astro 5.7+): `<Logo width={64} fill="currentColor" />`.
- Use `getImage()` for programmatic processing (e.g., background images).

### View Transitions & Client Router

```astro
---
import { ClientRouter } from "astro:transitions";
---

<head>
  <ClientRouter />
</head>

<!-- Transition directives on elements -->
<header transition:name="hero">...</header>
<main transition:animate="slide">...</main>
<div transition:persist>Preserved across navigations</div>
```

- Add `<ClientRouter />` to `<head>` for SPA-like client-side routing with animated transitions.
- Built-in animations: `fade` (default), `slide`, `none`, `initial`.
- `transition:name` — pair elements across pages for morphing animations.
- `transition:persist` — keep element state (e.g., video players, forms) across navigations.
- Scripts may need `astro:page-load` event listener to re-run after navigation.
- Forms work with `<ClientRouter />` — supports `GET` and `POST` with `enctype`.
- Use `data-astro-reload` on links/forms to opt out of client-side navigation.
- CSP note: `<ClientRouter />` is **not compatible** with Astro's built-in CSP.

```typescript
// Programmatic navigation
import { navigate } from "astro:transitions/client";
await navigate("/new-page");
```

### Actions

```typescript
// src/actions/index.ts
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";

export const server = {
  newsletter: defineAction({
    accept: "form",
    input: z.object({ email: z.string().email() }),
    handler: async (input, ctx) => {
      if (!ctx.cookies.has("session")) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Login required",
        });
      }
      await subscribe(input.email);
      return { success: true };
    },
  }),
};
```

```astro
---
// HTML form (zero JS, works without client-side JS)
import { actions } from "astro:actions";
const result = Astro.getActionResult(actions.newsletter);
---

<form method="POST" action={actions.newsletter}>
  <input type="email" name="email" required />
  <button>Subscribe</button>
</form>
{result?.error && <p class="error">Failed to subscribe</p>}
```

```typescript
// Client-side RPC call
const { data, error } = await actions.newsletter({ email });
// Or throw on error:
const data = await actions.newsletter.orThrow({ email });
```

- Actions are defined in `src/actions/index.ts` and auto-discovered.
- Use `accept: 'form'` for HTML form submissions, default `'json'` for RPC.
- Pages calling actions via HTML forms must be on-demand rendered (`prerender = false`).
- Use `ActionError` with codes like `UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`.
- Actions are public endpoints (`/_actions/...`) — always authorize in the handler.

### Middleware

```typescript
// src/middleware.ts
import { defineMiddleware, sequence } from "astro:middleware";

const auth = defineMiddleware(async (context, next) => {
  const session = context.cookies.get("session")?.value;
  context.locals.user = session ? await getUser(session) : null;
  return next();
});

const guard = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith("/dashboard") && !context.locals.user) {
    return context.redirect("/login");
  }
  return next();
});

export const onRequest = sequence(auth, guard);
```

- Runs on every page/endpoint render (build-time for static, request-time for SSR).
- Must return a `Response` — either directly or via `next()`.
- Use `context.locals` to pass data to pages (type it in `src/env.d.ts` via `App.Locals`).
- Use `context.rewrite()` to render a different page without redirecting.
- Chain multiple middlewares with `sequence()` — they run in order.

### SEO & Metadata

```astro
---
const canonicalURL = new URL(Astro.url.pathname, Astro.site).href;
---

<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={new URL(image, Astro.site)} />
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

- Set `site` in `astro.config.mjs` — required for canonical URLs, sitemap, RSS.
- Use consistent `trailingSlash` configuration.
- Use semantic HTML (`<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`).

### MDX

```mdx
---
title: "My Post"
---

import Callout from "../../components/Callout.astro";

<Callout type="warning">Custom component in MDX</Callout>
```

- Include `client:*` directives on interactive framework components in MDX.
- Use `<Content components={{...}} />` for consistent styling across all content.
- Prefer Markdown syntax where possible; use components only when Markdown is insufficient.

### TypeScript

```astro
---
import type { HTMLAttributes } from "astro/types";
import type { CollectionEntry } from "astro:content";

interface Props extends HTMLAttributes<"a"> {
  href: string;
  external?: boolean;
}

const { href, external = false, ...attrs } = Astro.props;
---
```

- Extend `astro/tsconfigs/strict` in tsconfig.json.
- Use `import type` for type-only imports.
- Use `ComponentProps<typeof Component>` to reference another component's props.
- Run `astro check` in CI for type checking.

### Fonts (Astro 6)

```typescript
// astro.config.mjs
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [400, 500, 700],
      styles: ["normal", "italic"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.local(),
      name: "CustomFont",
      cssVariable: "--font-custom",
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/custom-400.woff2"],
          },
          {
            weight: 700,
            style: "normal",
            src: ["./src/assets/fonts/custom-700.woff2"],
          },
        ],
      },
    },
  ],
});
```

- Built-in providers: `google()`, `local()`, `fontsource()`, `bunny()`, `fontshare()`, `adobe()`, `npm()`.
- Fonts are downloaded at build time — no external requests at runtime.
- Astro auto-generates optimized fallback fonts using font metrics.
- Use CSS variables in your styles: `font-family: var(--font-inter);`.
- Store local font files in `src/` (not `public/`) to avoid duplication in build output.

### Security

```typescript
// astro.config.mjs
export default defineConfig({
  security: {
    checkOrigin: true, // CSRF protection (default for SSR)
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' https://cdn.example.com",
      ],
    },
    allowedDomains: [{ hostname: "**.example.com", protocol: "https" }],
  },
});
```

- `checkOrigin` — auto-validates request origin header for CSRF protection on SSR pages.
- `csp` (Astro 6) — auto-hashes bundled scripts/styles for Content Security Policy. Test with `build` + `preview` (not available in dev).
- CSP runtime API: `Astro.csp?.insertDirective()`, `insertScriptHash()`, `insertStyleHash()`.
- `allowedDomains` — validates `X-Forwarded-Host` header to prevent host injection attacks.

### Streaming Performance

```astro
---
// BAD: blocks entire page until both fetches resolve
const user = await fetchUser();
const posts = await fetchPosts();
---

<!-- GOOD: move fetches into components for parallel streaming -->--- import
UserInfo from '../components/UserInfo.astro'; import PostList from
'../components/PostList.astro'; ---
<UserInfo />
<PostList />

<!-- ALSO GOOD: use promises directly in template -->
--- const userPromise = fetchUser(); const postsPromise = fetchPosts(); ---
<p>{userPromise}</p>
<ul>{postsPromise}</ul>
```

- Move `await` calls into child components so Astro streams each independently.
- Or assign promises (without `await`) and use them directly in the template.
- Astro streams HTML in order — earlier content appears first while later content loads.

### Quick Reference: Key Imports

```typescript
// Content collections
import {
  getCollection,
  getEntry,
  getEntries,
  render,
  reference,
} from "astro:content";
import { defineCollection, defineLiveCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

// Images
import { Image, Picture } from "astro:assets";
import { getImage } from "astro:assets";

// View Transitions
import { ClientRouter, fade, slide } from "astro:transitions";
import { navigate, supportsViewTransitions } from "astro:transitions/client";

// Actions
import {
  actions,
  defineAction,
  ActionError,
  isInputError,
} from "astro:actions";

// Middleware
import { defineMiddleware, sequence } from "astro:middleware";

// Types
import type {
  HTMLAttributes,
  HTMLTag,
  Polymorphic,
  ComponentProps,
} from "astro/types";
import type { CollectionEntry } from "astro:content";
import type {
  GetStaticPaths,
  InferGetStaticParamsType,
  InferGetStaticPropsType,
} from "astro";

// Environment (Astro 5+)
import { API_KEY } from "astro:env/server";
import { PUBLIC_URL } from "astro:env/client";

// Fonts (Astro 6)
import { defineConfig, fontProviders } from "astro/config";
```

### Astro 5/6 Features

**Astro 5:**

- Content Layer API with pluggable loaders (5x faster Markdown builds)
- Server Islands (`server:defer`)
- `astro:env` for type-safe environment variables
- SVG components (5.7+), responsive images (5.10+)
- No more `output: 'hybrid'` — use `prerender = false` per-page

**Astro 6:**

- `defineLiveCollection` for real-time data without rebuilds (`src/live.config.ts`)
- Built-in Fonts API with providers (Google, local, Fontsource, etc.)
- Built-in CSP with automatic script/style hashing (`security.csp`)
- Vite Environment API with workerd for dev/production parity
- **Breaking:** Node 22+ required, Zod 4, removed `Astro.glob()` and legacy collections
- **Breaking:** Endpoints with file extensions no longer accessible with trailing slash

### Common Mistakes

| Don't                                          | Do                                                        |
| ---------------------------------------------- | --------------------------------------------------------- |
| Use `client:load` on everything                | Default to static; use `client:visible` or `client:idle`  |
| Wrap layouts in framework components           | Use `.astro` layouts with targeted islands                |
| Map large arrays to client islands             | Render list statically, hydrate only interactive controls |
| Re-fetch data inside components                | Pass data through `getStaticPaths` props                  |
| Put optimizable images in `public/`            | Import from `src/assets/` and use `<Image>`               |
| Pass functions as props to hydrated components | Handle events inside the framework component              |
| Import `.astro` in `.jsx`/`.svelte` files      | Pass content via slots from `.astro` parent               |
| Forget `astro sync` after schema changes       | Run `npx astro sync` to regenerate types                  |
| Omit `site` in config                          | Always set `site` for canonical URLs, sitemap, RSS        |
| Use `Astro.glob()` (removed in v6)             | Use `import.meta.glob()` or content collections           |
