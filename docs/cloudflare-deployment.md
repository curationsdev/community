# Cloudflare Deployment Guide

This guide walks through deploying the CURATIONS Community Hub to Cloudflare Pages and Workers, with specific instructions for the `wyatt.stephens@curations.cc` Cloudflare account.

## Prerequisites

- Access to the Cloudflare account (wyatt.stephens@curations.cc)
- GitHub repository access to `curationsdev/community`
- Cloudflare API Token with appropriate permissions

## Deployment Overview

The CURATIONS Community Hub consists of two main components:

1. **Astro Static Site** → Deployed to Cloudflare Pages
2. **Worker + Durable Objects** → Deployed as Cloudflare Workers

## Part 1: Create Cloudflare KV Namespaces

Before deploying, you need to create the KV namespaces for storing votes and ideas.

### Option A: Using Wrangler CLI

```bash
# Login to Cloudflare
npx wrangler login

# Create production KV namespaces
npx wrangler kv:namespace create CURATIONS_VOTES
npx wrangler kv:namespace create CURATIONS_IDEAS

# Create development KV namespaces
npx wrangler kv:namespace create CURATIONS_VOTES --env dev
npx wrangler kv:namespace create CURATIONS_IDEAS --env dev
```

### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account (wyatt.stephens@curations.cc)
3. Navigate to **Workers & Pages** → **KV**
4. Click **Create namespace**
5. Create two namespaces:
   - `curations-community-CURATIONS_VOTES` (production)
   - `curations-community-CURATIONS_IDEAS` (production)
   - `curations-community-dev-CURATIONS_VOTES` (dev)
   - `curations-community-dev-CURATIONS_IDEAS` (dev)
6. Copy the namespace IDs and update them in `wrangler.toml`

## Part 2: Update wrangler.toml

After creating the KV namespaces, update the IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CURATIONS_VOTES"
id = "your-production-votes-id-here"

[[kv_namespaces]]
binding = "CURATIONS_IDEAS"
id = "your-production-ideas-id-here"

# And for dev environment:
[[env.dev.kv_namespaces]]
binding = "CURATIONS_VOTES"
id = "your-dev-votes-id-here"

[[env.dev.kv_namespaces]]
binding = "CURATIONS_IDEAS"
id = "your-dev-ideas-id-here"
```

## Part 3: Deploy Cloudflare Worker

### Option A: Deploy via GitHub Actions (Recommended)

The repository includes a GitHub Actions workflow that automatically deploys the Worker on push to `main`.

**Setup GitHub Secrets:**

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

**Get Cloudflare API Token:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Select the account (wyatt.stephens@curations.cc)
5. Copy the generated token

**Get Account ID:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages**
4. Your Account ID is displayed on the right sidebar

### Option B: Deploy Manually

```bash
# From the repository root
npx wrangler deploy

# Or deploy to dev environment
npx wrangler deploy --env dev
```

## Part 4: Deploy to Cloudflare Pages

### Option A: Connect via GitHub (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account (wyatt.stephens@curations.cc)
3. Navigate to **Workers & Pages**
4. Click **Create application** → **Pages** → **Connect to Git**
5. Authorize GitHub and select `curationsdev/community`
6. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leave default)
7. Add environment variables:
   - `PUBLIC_VOTE_ENDPOINT` = `/api/vote`
   - `PUBLIC_IDEA_ENDPOINT` = `/api/idea`
   - `PUBLIC_FORUM_ENDPOINT` = `/api/forum`
8. Click **Save and Deploy**

### Option B: Deploy via GitHub Actions

The workflow at `.github/workflows/cloudflare-deploy.yml` will automatically deploy to Cloudflare Pages on every push to `main` or pull request.

Ensure GitHub secrets are configured (see Part 3).

## Part 5: Bind Worker to Pages

## Part 5: Connect Worker API Endpoints to Pages

To route API calls from your Pages deployment to the Worker:

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Select your Pages project (`curations-community`)
3. Go to **Settings** → **Functions**
4. Under **Routes**, add a new route:
   - Route: `/api/*`
   - Target: `curations-community` (your worker name)
   - Environment: `production`

This configuration ensures that all requests to `/api/*` on your Pages domain are forwarded to your deployed Worker.
## Part 6: Configure Custom Domain (When Ready)

Once the domain transfer is complete:

1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Select your Pages project
3. Go to **Custom domains**
4. Click **Set up a custom domain**
5. Enter `community.curations.dev`
6. Cloudflare will automatically configure DNS

## Development Environment

For local development with the Worker:

```bash
# Start Astro dev server
npm run dev

# In another terminal, start the Worker in dev mode
npx wrangler dev
```

The Worker will be available at `http://localhost:8787` and the Astro site at `http://localhost:4321`.

## Testing the Deployment

After deployment, verify the following:

1. **Static site loads:** Visit your Pages URL (e.g., `curations-community.pages.dev`)
2. **Vote functionality:** Try clicking vote buttons on projects
3. **Idea submission:** Submit a test idea from the Ideas page
4. **Forum posts:** Try posting in the forum (when ready)

## Troubleshooting

### Worker deployment fails

- Ensure KV namespace IDs are correctly set in `wrangler.toml`
- Verify API token has correct permissions
- Check Wrangler version: `npx wrangler --version` (should be 3.x)

### Pages build fails

- Check build logs in Cloudflare Dashboard
- Ensure all environment variables are set
- Try building locally: `npm run build`

### API endpoints return 404

- Verify Worker is deployed and running
- Check service bindings in Pages settings
- Ensure Worker routes are configured

## Monitoring and Logs

View logs in Cloudflare Dashboard:

- **Worker logs:** Workers & Pages → Your Worker → Logs
- **Pages deployment logs:** Workers & Pages → Your Pages → Deployments → View logs

## Next Steps

- [ ] Configure production KV namespaces
- [ ] Set up GitHub secrets for CI/CD
- [ ] Test Worker deployment
- [ ] Connect repository to Cloudflare Pages
- [ ] Verify API endpoints work
- [ ] Set up custom domain (after transfer)
- [ ] Configure monitoring and alerts

## Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
