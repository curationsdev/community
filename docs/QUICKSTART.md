# Quick Start: Deploy CURATIONS Community to Cloudflare

This is a condensed guide specifically for deploying to the `wyatt.stephens@curations.cc` Cloudflare account.

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

### 5. Deploy Worker (Automatic)

Once you merge to `main` branch, the GitHub Actions workflow will automatically:
- Deploy the Worker with Durable Objects
- Deploy the Astro site to Cloudflare Pages

Watch the progress at: https://github.com/curationsdev/community/actions

### 6. Access Your Dev Environment

After deployment completes:

**Pages URL:** Your site will be available at:
- `https://curations-community.pages.dev` (auto-generated)
- Or `https://curations-community-[random].pages.dev`

Check deployment details in:
- Cloudflare Dashboard → Workers & Pages → curations-community

**Worker API:** The API endpoints will be available at:
- `https://curations-community.pages.dev/api/vote`
- `https://curations-community.pages.dev/api/idea`
- `https://curations-community.pages.dev/api/forum`

### 7. Configure Custom Domain (When Ready)

After the domain transfer completes:

1. In Cloudflare Dashboard → Workers & Pages → curations-community
2. Go to "Custom domains"
3. Add `community.curations.dev`
4. Cloudflare handles DNS automatically

## Verification Checklist

After deployment, verify:

- [ ] Site loads at Pages URL
- [ ] Vote buttons are clickable (check browser console for errors)
- [ ] Forum pages render correctly
- [ ] Projects page shows all projects
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
