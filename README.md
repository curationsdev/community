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

## Cloudflare Worker Deployment

The Worker (see `cloudflare/worker.ts`) handles vote counts, idea storage, and proxies forum traffic to the Durable Object class. To deploy:

1. Create KV namespaces for `CURATIONS_VOTES` and `CURATIONS_IDEAS`.
2. Bind a Durable Object named `CURATIONS_FORUM` to the `ForumDurableObject` class.
3. Update the generated namespace IDs inside `wrangler.toml`.
4. Publish the worker:

```bash
npx wrangler deploy
```

## Cloudflare Pages Integration

1. Connect the GitHub repository to Cloudflare Pages.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Add environment variables listed above. If deploying preview builds, repeat them for preview environments.
4. Bind the Worker using the [Cloudflare Pages Functions integration](https://developers.cloudflare.com/pages/functions/bindings/).

## Automation, Agents & Connectors

- Browse the catalog in [`docs/github-integrations.md`](docs/github-integrations.md) for GitHub Apps, AI models, and workflow connectors ready to enable.
- Document any new automation touchpoints you introduce so the community can toggle them on without spelunking for secrets.

## Roadmap & Stretch Goals

- Hook the front-end vote + submission components to live Worker endpoints.
- Implement OAuth providers (GitHub/Google) for forum identity, with anonymous fallback.
- Expand the prompt gallery and add leaderboard metrics.
- Add announcement banner to highlight launches.

Contributions, issues, and vibe checks welcome in the [Discussions](https://github.com/curationsdev/community/discussions) tab once we go live!
