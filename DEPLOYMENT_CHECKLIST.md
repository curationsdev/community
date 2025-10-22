# Cloudflare Deployment Checklist

Quick reference checklist for deploying CURATIONS Community to Cloudflare.

## Pre-Deployment (One-Time Setup)

### 1. GitHub Configuration
- [ ] Repository is public ✅ (already done)
- [ ] Add `CLOUDFLARE_API_TOKEN` secret
  - Get from: https://dash.cloudflare.com/profile/api-tokens
  - Location: Repo Settings → Secrets → Actions
- [ ] Add `CLOUDFLARE_ACCOUNT_ID` secret
  - Get from: Cloudflare Dashboard → Account ID (right sidebar)
  - Location: Repo Settings → Secrets → Actions

### 2. Cloudflare KV Namespaces
- [ ] Log in to Cloudflare: `npx wrangler login`
- [ ] Run setup script: `./scripts/setup-cloudflare.sh`
- [ ] Copy namespace IDs from script output
- [ ] Update `wrangler.toml` with namespace IDs:
  - [ ] Production `CURATIONS_VOTES` ID
  - [ ] Production `CURATIONS_IDEAS` ID
  - [ ] Dev `CURATIONS_VOTES` ID
  - [ ] Dev `CURATIONS_IDEAS` ID
- [ ] Commit and push updated `wrangler.toml`

### 3. Cloudflare Pages Setup
- [ ] Go to https://dash.cloudflare.com
- [ ] Select account: wyatt.stephens@curations.cc
- [ ] Navigate to: Workers & Pages
- [ ] Click: Create application → Pages → Connect to Git
- [ ] Authorize GitHub
- [ ] Select repository: `curationsdev/community`
- [ ] Configure build settings:
  - [ ] Project name: `curations-community`
  - [ ] Production branch: `main`
  - [ ] Build command: `npm run build`
  - [ ] Build output directory: `dist`
- [ ] Add environment variables:
  - [ ] `PUBLIC_VOTE_ENDPOINT` = `/api/vote`
  - [ ] `PUBLIC_IDEA_ENDPOINT` = `/api/idea`
  - [ ] `PUBLIC_FORUM_ENDPOINT` = `/api/forum`
  - [ ] `NODE_VERSION` = `20`
- [ ] Click: Save and Deploy

## Deployment

### Automatic (Recommended)
- [ ] Merge this PR to `main` branch
- [ ] GitHub Actions will automatically:
  - [ ] Build the Astro site
  - [ ] Deploy to Cloudflare Pages
  - [ ] Deploy the Worker
- [ ] Monitor deployment:
  - [ ] GitHub Actions tab: https://github.com/curationsdev/community/actions
  - [ ] Cloudflare Dashboard: Workers & Pages

### Manual (If Needed)
- [ ] Deploy Worker: `npm run deploy:worker`
- [ ] Or deploy dev environment: `npm run deploy:worker:dev`

## Verification

### Post-Deployment Checks
- [ ] Site loads at Pages URL
  - Check: https://curations-community.pages.dev
- [ ] All pages render correctly:
  - [ ] Homepage (/)
  - [ ] Projects (/projects)
  - [ ] Ideas (/ideas)
  - [ ] Forum (/forum)
- [ ] Vote buttons are clickable (check browser console for errors)
- [ ] No 404 errors on navigation
- [ ] API endpoints respond:
  - [ ] Test vote endpoint: POST to `/api/vote`
  - [ ] Test idea endpoint: POST to `/api/idea`
  - [ ] Test forum endpoint: GET `/api/forum`

### Verification Script
- [ ] Run: `./scripts/verify-setup.sh`
- [ ] Resolve any reported issues

## Post-Deployment

### Monitoring Setup
- [ ] Review Cloudflare Analytics in dashboard
- [ ] Check Worker logs for errors
- [ ] Set up Cloudflare email alerts (optional)
- [ ] Configure uptime monitoring (optional)

### Documentation
- [ ] Update team on deployment URL
- [ ] Document any custom configurations
- [ ] Note any issues encountered for future reference

## Domain Configuration (When Ready)

### After curations.dev Transfer Completes
- [ ] In Cloudflare Dashboard → Workers & Pages → curations-community
- [ ] Go to: Custom domains
- [ ] Click: Set up a custom domain
- [ ] Enter: `community.curations.dev`
- [ ] Cloudflare will automatically configure DNS
- [ ] Wait for SSL certificate provisioning (~15 minutes)
- [ ] Update `astro.config.mjs` site URL to production domain
- [ ] Commit and push change
- [ ] Test: https://community.curations.dev

## Troubleshooting

### Build Fails
- [ ] Check GitHub Actions logs
- [ ] Verify all dependencies in package.json
- [ ] Test build locally: `npm run build`
- [ ] Check Node version: `node -v` (should be 20+)

### Worker Deployment Fails
- [ ] Verify namespace IDs in wrangler.toml
- [ ] Check API token permissions
- [ ] Try deploying manually: `npm run deploy:worker`
- [ ] Review Wrangler logs for errors

### Pages Site Loads but API Fails
- [ ] Check Worker is deployed successfully
- [ ] Verify service bindings in Pages settings
- [ ] Check Worker logs in Cloudflare Dashboard
- [ ] Test API endpoints directly

### Getting Help
- [ ] Review: `docs/QUICKSTART.md` troubleshooting section
- [ ] Check: `docs/cloudflare-deployment.md` for detailed help
- [ ] Cloudflare docs: https://developers.cloudflare.com/pages/

## Quick Reference

### Important URLs
- **GitHub Actions**: https://github.com/curationsdev/community/actions
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Pages URL**: https://curations-community.pages.dev
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens

### Useful Commands
```bash
# Verify setup
./scripts/verify-setup.sh

# Create KV namespaces
./scripts/setup-cloudflare.sh

# Build locally
npm run build

# Deploy worker
npm run deploy:worker

# Deploy worker (dev)
npm run deploy:worker:dev

# Start local dev
npm run dev
```

## Status

- [x] Infrastructure code complete
- [x] Documentation complete
- [x] Scripts tested
- [x] Security scan passed
- [ ] GitHub secrets configured (team action)
- [ ] KV namespaces created (team action)
- [ ] Cloudflare Pages connected (team action)
- [ ] First deployment (automatic after above)

---

**Next Step:** Configure GitHub secrets and create KV namespaces (see steps 1 & 2 above)

**For Good Vibes, Human × AI Collaboration! 💚**
