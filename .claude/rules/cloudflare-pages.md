# Cloudflare Pages Rules

## Project Structure

```
my-pages-project/
├── functions/               # Serverless functions (file-based routing)
│   ├── _middleware.ts        # Global middleware
│   ├── tsconfig.json         # Separate TS config for functions
│   ├── types.d.ts            # Generated types (wrangler types)
│   ├── index.ts              # Route: /
│   └── api/
│       ├── _middleware.ts    # API-scoped middleware
│       ├── users/
│       │   ├── index.ts      # Route: /api/users
│       │   ├── [id].ts       # Route: /api/users/:id
│       │   └── [[path]].ts   # Route: /api/users/* (catch-all)
│       └── health.ts         # Route: /api/health
├── public/                   # Static files
│   ├── _headers              # Custom HTTP headers (static assets only)
│   └── _redirects            # Redirect rules (static assets only)
├── dist/                     # Build output (pages_build_output_dir)
│   └── _routes.json          # Controls which routes invoke Functions
├── wrangler.jsonc            # Configuration (source of truth)
└── package.json
```

- `/functions` directory must be at project root, NOT inside build output
- Use `wrangler.jsonc` (preferred over `.toml`) — some features are JSON-only
- Once you use a wrangler config, it becomes the **source of truth** — dashboard config becomes read-only

## wrangler.jsonc Configuration

### Basic Setup

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-pages-app",
  "pages_build_output_dir": "./dist",
  "compatibility_date": "2026-03-15",
  "compatibility_flags": ["nodejs_compat"],
  "kv_namespaces": [{ "binding": "KV", "id": "<NAMESPACE_ID>" }],
  "d1_databases": [
    { "binding": "DB", "database_name": "my-db", "database_id": "<DB_ID>" },
  ],
  "vars": {
    "API_HOST": "https://api.example.com",
  },
}
```

### Environment-Specific Overrides

```jsonc
{
  "env": {
    "preview": {
      // Non-inheritable keys must be FULLY redeclared
      "kv_namespaces": [{ "binding": "KV", "id": "<PREVIEW_NAMESPACE_ID>" }],
      "vars": { "API_KEY": "preview-key" },
    },
    "production": {
      "kv_namespaces": [{ "binding": "KV", "id": "<PROD_NAMESPACE_ID>" }],
      "vars": { "API_KEY": "prod-key" },
    },
  },
}
```

**Inheritable** (selectively overridden): `name`, `pages_build_output_dir`, `compatibility_date`, `compatibility_flags`
**Non-inheritable** (must redeclare ALL in env): `vars`, `kv_namespaces`, `d1_databases`, `r2_buckets`, `durable_objects`, `services`, `queues`, `hyperdrive`, `vectorize`, `ai`

### Key Practices

- Always set `compatibility_date` to today's date on new projects
- Always enable `nodejs_compat` if using Node.js built-ins
- Use `$schema` for IDE autocompletion
- Generate binding types with `wrangler types` — never hand-write Env interfaces

## Pages Functions

### HTTP Method Handlers

```typescript
// functions/api/users.ts -> route: /api/users
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({ users: [] });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json();
  return Response.json({ created: body }, { status: 201 });
};
```

### EventContext Properties

```typescript
export const onRequest: PagesFunction<Env> = async (context) => {
  context.request;              // Incoming Request
  context.env;                  // Bindings, vars, secrets (includes ASSETS)
  context.params;               // Dynamic route parameters
  context.data;                 // Shared data from middleware
  context.waitUntil(promise);   // Background async work
  context.passThroughOnException();
  context.next(input?, init?);  // Next handler or static assets

  // Fetch a static asset
  const asset = await context.env.ASSETS.fetch(new URL("/index.html", context.request.url));
  return asset;
};
```

### Dynamic Routes

```typescript
// functions/users/[id].ts -> /users/123
export const onRequestGet: PagesFunction = async ({ params }) => {
  return Response.json({ id: params.id }); // string
};

// functions/docs/[[path]].ts -> /docs/a/b/c (catch-all)
export const onRequestGet: PagesFunction = async ({ params }) => {
  return Response.json({ segments: params.path }); // string[]
};
```

### TypeScript Setup

```bash
npx wrangler types --path='./functions/types.d.ts'
```

```json
// functions/tsconfig.json (separate from root)
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["esnext"],
    "types": ["./types.d.ts"]
  }
}
```

Root tsconfig must exclude `functions/`:

```json
{
  "include": ["src/**/*"],
  "exclude": ["functions/**/*"]
}
```

## Bindings

### KV

```typescript
export const onRequestGet: PagesFunction<{ KV: KVNamespace }> = async ({
  env,
}) => {
  const value = await env.KV.get("key");
  return new Response(value);
};
```

### D1

```typescript
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({
  env,
}) => {
  const data = await env.DB.prepare("SELECT * FROM users LIMIT 10").all();
  return Response.json(data);
};

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async ({
  request,
  env,
}) => {
  const { name, email } = await request.json();
  const result = await env.DB.prepare(
    "INSERT INTO users (name, email) VALUES (?, ?)"
  )
    .bind(name, email)
    .run();
  return Response.json(result, { status: 201 });
};
```

### R2

```typescript
export const onRequestGet: PagesFunction<{ BUCKET: R2Bucket }> = async ({
  params,
  env,
}) => {
  const obj = await env.BUCKET.get(params.key as string);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type":
        obj.httpMetadata?.contentType ?? "application/octet-stream",
    },
  });
};
```

### Durable Objects (external Worker only)

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "name": "DO",
        "class_name": "MyDurableObject",
        "script_name": "do-worker", // must reference external Worker
      },
    ],
  },
}
```

### Workers AI

```jsonc
{ "ai": { "binding": "AI" } }
```

```typescript
export const onRequestPost: PagesFunction<{ AI: Ai }> = async ({
  request,
  env,
}) => {
  const { prompt } = await request.json();
  const answer = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { prompt });
  return Response.json(answer);
};
```

### Service Bindings

```jsonc
{ "services": [{ "binding": "SERVICE", "service": "my-worker" }] }
```

### Hyperdrive (PostgreSQL)

```typescript
import postgres from "postgres";

export const onRequestGet: PagesFunction<{ HYPERDRIVE: Hyperdrive }> = async ({
  env,
}) => {
  const sql = postgres(env.HYPERDRIVE.connectionString);
  const result = await sql`SELECT * FROM records`;
  return Response.json({ result });
};
```

### Remote Bindings for Local Dev

```jsonc
{ "d1_databases": [{ "binding": "DB", "database_id": "xxx", "remote": true }] }
```

## Routing

### `_routes.json` (in build output dir)

Controls which requests invoke Functions vs serve static assets:

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

- Min 1 include, max 100 combined rules
- Exclude takes priority over include
- Wildcards `*` match any number of path segments

### `_redirects` (in public/)

```
/old-blog /blog 301
/blog/* /posts/:splat 301
/twitter https://twitter.com/myprofile 301
```

- 2,000 static + 100 dynamic = 2,100 max
- First matching rule wins
- NOT applied to Pages Functions responses

### `_headers` (in public/)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff

/assets/*
  Cache-Control: public, max-age=31556952, immutable

https://:project.pages.dev/*
  X-Robots-Tag: noindex
```

- Max 100 rules, static assets only — NOT applied to Functions responses
- Priority: Redirects > Headers > Functions

## Middleware

### Chaining

```typescript
// functions/_middleware.ts
async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

async function logging(context) {
  const start = Date.now();
  const response = await context.next();
  console.log(
    `${context.request.method} ${context.request.url} - ${Date.now() - start}ms`
  );
  return response;
}

// Executed in order
export const onRequest = [errorHandling, logging];
```

### CORS

```typescript
// functions/api/_middleware.ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

async function handleCors(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const response = await context.next();
  Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const onRequest = [handleCors];
```

### Scoping

```
functions/
├── _middleware.ts          # ALL routes
└── api/
    ├── _middleware.ts       # /api/* only
    └── admin/
        └── _middleware.ts   # /api/admin/* only
```

## Secrets

Never store in `wrangler.jsonc` or source code:

```bash
npx wrangler pages secret put API_SECRET
```

## Build Environment

| Variable       | Example | Purpose                               |
| -------------- | ------- | ------------------------------------- |
| `NODE_VERSION` | `20`    | Default is 12.18.0 — always override! |
| `NPM_VERSION`  | `10`    | npm version                           |

## Performance

- **Caching**: Pages has optimized defaults. Only add custom cache for fingerprinted assets (`immutable`)
- **Streaming**: Use `TransformStream` for large payloads instead of buffering
- **`waitUntil()`**: Defer non-critical work (analytics, logging) after response
- **`_routes.json`**: Exclude static assets to save Function invocations
- **Compression**: Gzip/Brotli automatic — no config needed
- **ETag/304**: Automatic for static assets

```typescript
// Background work pattern
export const onRequest: PagesFunction = async context => {
  const response = Response.json({ data: "fast" });
  context.waitUntil(logAnalytics(context));
  return response;
};
```

## Framework Integration

### Astro

```jsonc
// wrangler.jsonc
{ "pages_build_output_dir": "./dist", "compatibility_flags": ["nodejs_compat"] }
```

Note: `@astrojs/cloudflare` v13+ defaults to Workers. Pages still works with manual config.

### SvelteKit

```javascript
// svelte.config.js
import adapter from "@sveltejs/adapter-cloudflare";
export default {
  kit: {
    adapter: adapter({
      routes: { include: ["/*"], exclude: ["<all>"] },
    }),
  },
};
```

### Next.js

Use `@opennextjs/cloudflare` — targets Workers, not Pages. The older `@cloudflare/next-on-pages` is superseded.

### Accessing Bindings in Frameworks

- **Astro**: `Astro.locals.runtime.env`
- **SvelteKit**: `platform.env`
- **Next.js (OpenNext)**: `getRequestContext()`

## Common Mistakes

| Mistake                                     | Fix                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| Wrong output directory                      | Verify `pages_build_output_dir` matches framework output (Astro = `dist`)            |
| Default Node 12.18.0                        | Always set `NODE_VERSION` to 18+ or 20+                                              |
| Case-sensitive paths                        | Linux builds are case-sensitive — `./header` won't find `Header.js`                  |
| `_headers`/`_redirects` for Functions       | These only apply to static assets — set headers in function code                     |
| `passThroughOnException()` in Advanced Mode | Unavailable — handle errors explicitly                                               |
| Functions in build output                   | `/functions` must be at project root                                                 |
| Global mutable state                        | Variables persist between requests — never store request-scoped data at module level |
| Floating promises                           | Always `await`, `return`, or `waitUntil()`                                           |
| `Math.random()` for security                | Use `crypto.getRandomValues()` or `crypto.randomUUID()`                              |
| Same repo across CF accounts                | Not allowed                                                                          |
| Wildcard custom domains                     | Not supported                                                                        |
| Direct Upload with functions                | Dashboard upload doesn't support `/functions`                                        |

## Pages vs Workers

Workers is the recommended platform for new projects. Pages and Workers are converging — Workers gets all new investment. For existing Pages projects, no urgency to migrate.

| Feature             | Pages                        | Workers                  |
| ------------------- | ---------------------------- | ------------------------ |
| File-based routing  | Built-in                     | Not built-in             |
| Preview deployments | Automatic per branch         | Via Workers Builds       |
| Durable Objects     | External Worker binding only | Define classes directly  |
| Cron Triggers       | Not supported                | Supported                |
| Static assets       | Default                      | Requires `assets` config |

## Plugins

```typescript
// functions/_middleware.ts
import sentryPlugin from "@cloudflare/pages-plugin-sentry";
import accessPlugin from "@cloudflare/pages-plugin-cloudflare-access";

export const onRequest = [
  sentryPlugin({ dsn: "https://..." }),
  accessPlugin({ domain: "https://...", aud: "xxx" }),
];
```

Available: `@cloudflare/pages-plugin-cloudflare-access`, `@cloudflare/pages-plugin-sentry`, `@cloudflare/pages-plugin-turnstile`, `@cloudflare/pages-plugin-static-forms`, and more.
