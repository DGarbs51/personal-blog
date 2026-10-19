---
paths:
  - "wrangler.jsonc"
  - "public/_headers"
  - "public/_redirects"
  - "astro.config.*"
---

# Cloudflare Workers Static Assets Rules

This site deploys as an assets-only Worker through Workers Builds. It is not a Cloudflare Pages project. There is no Worker script (`main`), no bindings, and no `functions/` directory.

## Deploy Flow

1. Push to `main`.
2. Workers Builds runs the build command (`bun run build`), which writes the static site to `./dist`.
3. Workers Builds runs the deploy command (`bunx wrangler deploy`), which uploads `./dist` as static assets.

The build trigger runs on `main` only. Pushes to other branches do not build, and the site has no Previews.

Validate config changes locally before you push:

```sh
bun run build
bunx wrangler deploy --dry-run
```

## wrangler.jsonc

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "dgarbs51-personal-blog",
  "compatibility_date": "2026-10-19",
  "routes": [
    { "pattern": "dgarbs51.com", "custom_domain": true },
    { "pattern": "www.dgarbs51.com", "custom_domain": true },
  ],
  "workers_dev": false,
  "preview_urls": false,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
  },
}
```

- `wrangler.jsonc` is the source of truth. Do not use Pages keys such as `pages_build_output_dir`.
- `routes` attaches `dgarbs51.com` and `www.dgarbs51.com` as Custom Domains. A zone Redirect Rule sends `www` to the apex with a `301`, so the Worker only answers on the apex. Remove the routes before you point DNS at another host.
- `workers_dev: false` and `preview_urls: false` turn off every `*.workers.dev` URL, so the site is only reachable on its own domain.
- `assets.directory` must match the Astro output directory (`./dist`).
- `not_found_handling: "404-page"` serves the nearest `404.html` with a `404` status.
- `html_handling` defaults to `auto-trailing-slash`. Keep the default unless the Astro `trailingSlash` setting changes.
- Set `compatibility_date` to the current date when you upgrade wrangler.
- Only add `main`, `assets.binding`, or `compatibility_flags` if the site gets server-side code. An `assets.binding` without `main` is invalid.

## Headers and Redirects

- Put `_headers` and `_redirects` in `public/`. Astro copies them to `dist/`, and Workers static assets applies them natively.
- These rules apply only to static asset responses, not to responses from Worker code.
- Content-hashed files in `/_astro/*` can use `Cache-Control: public, max-age=31536000, immutable`. Other assets keep the default `public, max-age=0, must-revalidate` with an `ETag`.

## Build Image

- Workers Builds defaults to Node.js 24 and Bun 1.4. Both meet the Astro 7 requirement of Node.js `>=22.22.0`.
- To pin a version, add `.node-version` or set the `NODE_VERSION` or `BUN_VERSION` build variable.

## Common Mistakes

| Mistake                                       | Fix                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------- |
| Following Cloudflare Pages docs               | Use the Workers static assets docs. Pages config does not apply here. |
| Putting `_headers` or `_redirects` in `dist/` | Put them in `public/`. The build clears `dist/`.                      |
| Adding `assets.binding` with no `main`        | Leave it out until a Worker script exists.                            |
| Case-sensitive paths                          | The Linux build image is case-sensitive. Match file names exactly.    |
