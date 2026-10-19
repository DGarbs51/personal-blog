# Devon Garbalosa's Blog

Welcome to my personal blog! This is where I share my thoughts, experiences, and learnings about software development, technology, and the ever-evolving world of tech.

## 🚀 Built With

- **[Astro](https://astro.build/)** - The web framework for content-driven websites
- **[MDX](https://mdxjs.com/)** - Markdown with JSX support
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/)** - Hosting and deployment

## 🌟 Features

- ✅ Lightning-fast performance with Astro
- ✅ SEO-friendly with canonical URLs and OpenGraph data
- ✅ Responsive design that works on all devices
- ✅ RSS feed for easy subscription
- ✅ Sitemap for better search engine indexing
- ✅ Markdown & MDX support for rich content
- ✅ Syntax highlighting for code blocks
- ✅ Modern, clean design based on Bear Blog

## 📝 Content

You'll find articles about:

- Web development tutorials and guides
- Software engineering best practices
- Technology reviews and insights
- Personal learning experiences
- Industry trends and thoughts

## 🛠️ Development

### Prerequisites

- Node.js (v22.22 or higher)
- [Bun](https://bun.sh/)

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Deployment

This blog is deployed to Cloudflare Workers as static assets. Workers Builds deploys automatically on every push to `main`. It runs `bun run build`, then `bunx wrangler deploy`. Pushes to other branches do not build. The site serves only on `dgarbs51.com`, and `www.dgarbs51.com` redirects to it.

To check the deploy config locally without deploying:

```bash
bun run build
bunx wrangler deploy --dry-run
```

## 📁 Project Structure

```
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable UI components
│   ├── content/     # Blog posts and content
│   ├── layouts/     # Page layouts
│   ├── pages/       # Routes and pages
│   └── styles/      # Global styles
├── astro.config.js  # Astro configuration
└── wrangler.jsonc   # Cloudflare deployment config
```

## 🤝 Connect With Me

- **GitHub**: [dgarbs51](https://github.com/dgarbs51)
- **LinkedIn**: [devon-garbalosa](https://www.linkedin.com/in/devon-garbalosa/)
- **X**: [@dgarbs51\_](https://x.com/dgarbs51_)
- **Blog**: [dgarbs51.com](https://dgarbs51.com)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ by Devon Garbalosa
