# Quick Start: Deploy CURATIONS Community to Cloudflare

This is a condensed guide specifically for deploying to the `wyatt.stephens@curations.cc` Cloudflare account.

> **🔧 API Fix Applied (2025-10-22):** This deployment now uses Cloudflare Pages Functions for API integration. See [`API_INTEGRATION_FIX.md`](./API_INTEGRATION_FIX.md) for details about the fix.

## Prerequisites Checklist

- [x] Repository is public
- [ ] Access to Cloudflare account (wyatt.stephens@curations.cc)
- [ ] GitHub repository admin access (for setting secrets)

## Step-by-Step Deployment

### 1. Set Up GitHub Secrets (5 minutes)

1. Go to https://github.com/curationsdev/community/settings/secrets/actions
2. Add two repository secrets:

**Get CLOUDFLARE_API_TOKEN:**
- Visit https://dash.cloudflare.com/profile/api-tokens
- Click "Create Token"
- Use template: "Edit Cloudflare Workers"
- Select account: wyatt.stephens@curations.cc
- Create token and copy it

**Get CLOUDFLARE_ACCOUNT_ID:**
- Visit https://dash.cloudflare.com
- Select your account
- Click "Workers & Pages" in sidebar
- Your Account ID is displayed on the right

Add these as secrets:
- Name: `CLOUDFLARE_API_TOKEN`, Value: [token from above]
- Name: `CLOUDFLARE_ACCOUNT_ID`, Value: [account ID from above]

### 2. Create KV Namespaces (2 minutes)

**Option A: Automated Script (recommended)**

If you have wrangler installed locally:

```bash
# Login to Cloudflare
npx wrangler login

# Run setup script
./scripts/setup-cloudflare.sh
```

The script will output namespace IDs. Copy them and update `wrangler.toml`.

**Option B: Manual via Dashboard**

1. Go to https://dash.cloudflare.com
2. Select account → Workers & Pages → KV
3. Create these namespaces:
   - `curations-community-CURATIONS_VOTES`
   - `curations-community-CURATIONS_IDEAS`
   - `curations-community-dev-CURATIONS_VOTES`
   - `curations-community-dev-CURATIONS_IDEAS`
4. Copy each namespace ID

### 3. Update wrangler.toml

Edit `wrangler.toml` and replace `<to-be-created>` placeholders with your namespace IDs:

```toml
[[kv_namespaces]]
binding = "CURATIONS_VOTES"
id = "YOUR_PRODUCTION_VOTES_ID"

[[kv_namespaces]]
binding = "CURATIONS_IDEAS"
id = "YOUR_PRODUCTION_IDEAS_ID"

# And in the [env.dev] section:
[[env.dev.kv_namespaces]]
binding = "CURATIONS_VOTES"
id = "YOUR_DEV_VOTES_ID"

[[env.dev.kv_namespaces]]
binding = "CURATIONS_IDEAS"
id = "YOUR_DEV_IDEAS_ID"
```

Commit and push this change.

### 4. Connect Cloudflare Pages (5 minutes)

1. Go to https://dash.cloudflare.com
2. Select account (wyatt.stephens@curations.cc)
3. Click "Workers & Pages" → "Create application" → "Pages"
4. Click "Connect to Git"
5. Authorize GitHub and select `curationsdev/community`
6. Configure:
   - **Project name:** `curations-community`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
7. Add environment variables:
   ```
   PUBLIC_VOTE_ENDPOINT = /api/vote
   PUBLIC_IDEA_ENDPOINT = /api/idea
   PUBLIC_FORUM_ENDPOINT = /api/forum
   NODE_VERSION = 20
   ```
8. Click "Save and Deploy"

### 5. Configure KV Bindings in Pages (CRITICAL - 3 minutes)

**This step is required for API functionality!**

After Pages deployment completes:

1. Go to your Pages project in Cloudflare Dashboard
2. Click **Settings** tab
3. Scroll to **Functions** section
4. Click **KV namespace bindings** → **Add binding**
5. Add these bindings:

**First Binding:**
- Variable name: `CURATIONS_VOTES`
- KV namespace: Select `curations-community-CURATIONS_VOTES`
- Click **Save**

**Second Binding:**
- Variable name: `CURATIONS_IDEAS`
- KV namespace: Select `curations-community-CURATIONS_IDEAS`
- Click **Save**

> 📖 **Detailed guide:** See [`PAGES_KV_SETUP.md`](./PAGES_KV_SETUP.md) for screenshots and troubleshooting.

### 6. Redeploy Pages (1 minute)

After adding KV bindings:

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. Wait for deployment to complete (~2 minutes)

This ensures the Functions have access to KV namespaces.

### 7. Deploy Worker (Optional)

The Worker is now optional since API is handled by Pages Functions. If you still want to deploy it:

```bash
npx wrangler deploy
```

Or wait for GitHub Actions to deploy automatically on merge to `main`.

Watch the progress at: https://github.com/curationsdev/community/actions

### 8. Access Your Environment

After deployment completes:

**Pages URL:** Your site will be available at:
- `https://curations-community.pages.dev` (auto-generated)
- Or `https://curations-community-[random].pages.dev`

Check deployment details in:
- Cloudflare Dashboard → Workers & Pages → curations-community

**API Endpoints:** Via Pages Functions, available at:
- `https://curations-community.pages.dev/api/vote` - POST to vote
- `https://curations-community.pages.dev/api/votes` - GET vote counts
- `https://curations-community.pages.dev/api/idea` - POST to submit idea
- `https://curations-community.pages.dev/api/ideas` - GET all ideas
- `https://curations-community.pages.dev/api/forum` - Forum endpoints (optional)

### 9. Configure Custom Domain (When Ready)

After the domain transfer completes:

1. In Cloudflare Dashboard → Workers & Pages → curations-community
2. Go to "Custom domains"
3. Add `community.curations.dev`
4. Cloudflare handles DNS automatically

## Verification Checklist

After deployment, verify:

- [ ] Site loads at Pages URL
- [ ] KV bindings are configured (Settings → Functions)
- [ ] API responds: `curl https://[your-url]/api/votes` returns `{}`
- [ ] Vote buttons work (click and see count increment)
- [ ] Idea submission works (form on /ideas page)
- [ ] Forum pages render correctly
- [ ] Browser console shows no API errors

**If API doesn't work:**
1. Check KV bindings are set (Step 5)
2. Check Functions logs: Deployments → Click deployment → Functions log
3. See troubleshooting in [`API_INTEGRATION_FIX.md`](./API_INTEGRATION_FIX.md)
- [ ] Ideas page is accessible
- [ ] GitHub Actions workflows complete successfully

## Troubleshooting

**Build fails in GitHub Actions:**
- Check Actions tab for error logs
- Ensure all dependencies install correctly
- Verify Node version is 20

**Worker deployment fails:**
- Verify KV namespace IDs are correct in wrangler.toml
- Check API token has correct permissions
- Ensure account ID matches your Cloudflare account

**Pages site loads but API endpoints fail:**
- Check Worker is deployed successfully
- Verify service bindings in Pages settings
- Check Worker logs in Cloudflare Dashboard

## Next Steps

- [ ] Test all interactive features
- [ ] Configure production domain when ready
- [ ] Set up monitoring and alerts
- [ ] Review and enable Cloudflare analytics
- [ ] Consider enabling Cloudflare Web Analytics

## Getting Help

- Full documentation: [`docs/cloudflare-deployment.md`](./cloudflare-deployment.md)
- GitHub integrations guide: [`docs/github-integrations.md`](./github-integrations.md)
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/

---

**For Good Vibes, Human × AI Collaboration! 💚**
