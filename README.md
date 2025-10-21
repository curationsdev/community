# CURATIONS Community Hub

Astro-powered portal for [curations.dev](https://curations.dev) bringing together Human × AI projects, ideas, and conversations. The repo bundles the marketing site, open source showcase, idea submission flow, and forum prototype into one deployable package targeting Cloudflare Pages + Workers.

## Tech Stack

- **Astro 4** + Tailwind for the front-end experience
- **Cloudflare Pages** for static hosting
- **Cloudflare Workers & KV** for upvotes and idea submissions
- **Cloudflare Durable Objects** for the forum message layer
- **Biome** + Prettier for linting and formatting

## Getting Started

```bash
npm install
npm run dev
```

> The project scaffolding uses public npm packages. If you do not have network access inside your environment you can still inspect and modify the source, but the dev server will require installing dependencies locally.

## Project Structure

```
├── src
│   ├── components      # Shared UI primitives (cards, hero, vote button)
│   ├── data            # Mock data for projects, ideas, and forum channels
│   ├── layouts         # Base layout with header/footer + SEO metadata
│   ├── pages           # Astro route files for homepage, projects, ideas, forum
│   ├── styles          # Global CSS + Tailwind utilities
│   └── utils           # Helper utilities (reserved for future expansion)
├── public              # Static assets (SVG OG image, favicon, robots)
├── cloudflare          # Worker + Durable Object implementation
├── wrangler.toml       # Cloudflare deployment configuration
└── README.md
```

## Environment Variables

The Astro app reads public endpoints exposed by the Worker. When deploying to Cloudflare Pages, configure the following environment variables:

- `PUBLIC_VOTE_ENDPOINT` – URL of the vote endpoint (defaults to `/api/vote`)
- `PUBLIC_IDEA_ENDPOINT` – URL for new idea submissions (defaults to `/api/idea`)
- `PUBLIC_FORUM_ENDPOINT` – URL for the Durable Object forum handler (defaults to `/api/forum`)

## Cloudflare Deployment

The community hub deploys as a hybrid application:
- **Astro static site** → Cloudflare Pages
- **API Worker + Durable Objects** → Cloudflare Workers

### Quick Start

For detailed deployment instructions, see [`docs/cloudflare-deployment.md`](docs/cloudflare-deployment.md).

**Automated deployment via GitHub Actions:**
1. Set up GitHub secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
2. Push to `main` branch - workflows deploy automatically

**Manual deployment:**
1. Run `./scripts/setup-cloudflare.sh` to create KV namespaces
2. Update namespace IDs in `wrangler.toml`
3. Deploy Worker: `npx wrangler deploy`
4. Connect repo to Cloudflare Pages via dashboard

## Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Fast-track deployment to Cloudflare
- **[Deployment Guide](docs/cloudflare-deployment.md)** - Comprehensive Cloudflare setup
- **[GitHub Integrations](docs/github-integrations.md)** - Available automation tools and connectors

## Automation, Agents & Connectors

- Browse the catalog in [`docs/github-integrations.md`](docs/github-integrations.md) for GitHub Apps, AI models, and workflow connectors ready to enable.
- Document any new automation touchpoints you introduce so the community can toggle them on without spelunking for secrets.

## Roadmap & Stretch Goals

- Hook the front-end vote + submission components to live Worker endpoints.
- Implement OAuth providers (GitHub/Google) for forum identity, with anonymous fallback.
- Expand the prompt gallery and add leaderboard metrics.
- Add announcement banner to highlight launches.

Contributions, issues, and vibe checks welcome in the [Discussions](https://github.com/curationsdev/community/discussions) tab once we go live!
