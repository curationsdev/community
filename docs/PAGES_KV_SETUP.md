# Cloudflare Pages KV Bindings Setup

This guide explains how to configure KV namespace bindings for Cloudflare Pages Functions to enable API functionality.

## Why This Is Needed

The API functions in `functions/api/[[path]].ts` require access to two KV namespaces:
- `CURATIONS_VOTES` - Stores vote counts for projects and ideas
- `CURATIONS_IDEAS` - Stores submitted ideas

These bindings tell Cloudflare Pages Functions which KV namespaces to use.

## Step-by-Step Setup

### 1. Access Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Log in with `wyatt.stephens@curations.cc` (or your account)
3. Select your account

### 2. Navigate to Pages Project

1. Click **Workers & Pages** in the left sidebar
2. Find and click on your Pages project (e.g., `curations-community`)
3. Go to **Settings** tab

### 3. Configure KV Bindings

1. Scroll down to **Functions** section
2. Click **KV namespace bindings**
3. Click **Add binding**

#### Add CURATIONS_VOTES Binding

- **Variable name**: `CURATIONS_VOTES`
- **KV namespace**: Select your votes namespace from the dropdown
  - Production: `curations-community-CURATIONS_VOTES` (ID: `85931fcebb044408881042bec2cb33de`)
  - Or the namespace you created earlier
- Click **Save**

#### Add CURATIONS_IDEAS Binding

- Click **Add binding** again
- **Variable name**: `CURATIONS_IDEAS`
- **KV namespace**: Select your ideas namespace from the dropdown
  - Production: `curations-community-CURATIONS_IDEAS` (ID: `b81adffa386f42819603a1246902a648`)
  - Or the namespace you created earlier
- Click **Save**

### 4. (Optional) Add Durable Object Binding

If you want to enable forum functionality (requires Cloudflare Workers paid plan):

1. In the same **Functions** section
2. Click **Durable Object bindings**
3. Click **Add binding**
4. **Variable name**: `CURATIONS_FORUM`
5. **Durable Object class name**: `ForumDurableObject`
6. **Script**: Select your worker script
7. Click **Save**

### 5. Verify Configuration

After adding bindings, you should see:

```
KV namespace bindings
├─ CURATIONS_VOTES → curations-community-CURATIONS_VOTES
└─ CURATIONS_IDEAS → curations-community-CURATIONS_IDEAS

Durable Object bindings (optional)
└─ CURATIONS_FORUM → ForumDurableObject
```

### 6. Redeploy (Automatic)

The bindings take effect immediately, but to ensure everything is fresh:

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. Or push a new commit to trigger automatic deployment

## Verifying KV Namespaces Exist

If you haven't created the KV namespaces yet:

### Using Wrangler CLI

```bash
# Login to Cloudflare
npx wrangler login

# Create production namespaces
npx wrangler kv:namespace create CURATIONS_VOTES
npx wrangler kv:namespace create CURATIONS_IDEAS

# Note the IDs returned and use them in the bindings
```

### Using Cloudflare Dashboard

1. Go to **Workers & Pages** → **KV**
2. Click **Create namespace**
3. Name: `curations-community-CURATIONS_VOTES`
4. Click **Add**
5. Repeat for `curations-community-CURATIONS_IDEAS`
6. Note the namespace IDs for use in bindings

## Environment-Specific Bindings

For preview/development environments:

1. In Pages project settings, go to **Environment variables**
2. Switch to **Preview** environment
3. Add the same KV bindings but pointing to dev namespaces:
   - `CURATIONS_VOTES` → `curations-community-dev-CURATIONS_VOTES`
   - `CURATIONS_IDEAS` → `curations-community-dev-CURATIONS_IDEAS`

This ensures preview deployments use separate data storage.

## Testing After Setup

### 1. Test Vote Endpoint

```bash
# Get all votes
curl https://curations.dev/api/votes

# Should return JSON: {}  or  {"project-id": count, ...}
```

### 2. Test Idea Submission

```bash
curl -X POST https://curations.dev/api/idea \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Testing API","categories":["test"]}'

# Should return JSON with the created idea
```

### 3. Test in Browser

1. Visit https://curations.dev/projects
2. Click a vote button
3. Check browser console (F12) for successful API response
4. Visit https://curations.dev/ideas
5. Submit a new idea
6. Verify it appears in the list

## Troubleshooting

### Error: "KVNamespace is not defined"

**Cause:** KV bindings not configured in Pages Functions settings.

**Fix:** Follow steps 3-4 above to add bindings.

### Error: "CURATIONS_VOTES.get is not a function"

**Cause:** Variable name mismatch between code and binding.

**Fix:** Ensure the binding variable name is exactly `CURATIONS_VOTES` (case-sensitive).

### Error: 500 Internal Server Error

**Cause:** Multiple possibilities - binding issues, namespace doesn't exist, or code error.

**Fix:**
1. Check Pages Functions logs: **Deployments** → Click deployment → **Functions log**
2. Verify bindings are configured correctly
3. Verify KV namespaces exist in **Workers & Pages** → **KV**

### API Returns Empty Data

**Cause:** Using wrong namespace (dev vs production) or namespace is empty.

**Fix:**
1. Check which namespace is bound in Pages settings
2. View namespace contents: **Workers & Pages** → **KV** → Select namespace
3. Submit test data to verify writes work

### CORS Errors

**Cause:** Should not happen with the fix, but could indicate old deployment.

**Fix:**
1. Verify latest code is deployed (check deployment hash)
2. Hard refresh browser (Ctrl+Shift+R)
3. Check that `functions/api/[[path]].ts` includes CORS headers

## Maintenance

### Viewing KV Data

1. Go to **Workers & Pages** → **KV**
2. Click on a namespace
3. Browse keys and values
4. Can manually add/edit/delete entries for testing

### Backing Up Data

```bash
# Export all votes
npx wrangler kv:key list --namespace-id="85931fcebb044408881042bec2cb33de" > votes-backup.json

# Export all ideas
npx wrangler kv:key list --namespace-id="b81adffa386f42819603a1246902a648" > ideas-backup.json
```

### Clearing Test Data

Be careful! This deletes data permanently.

```bash
# List all keys in a namespace
npx wrangler kv:key list --namespace-id="YOUR_NAMESPACE_ID"

# Delete a specific key
npx wrangler kv:key delete "key-name" --namespace-id="YOUR_NAMESPACE_ID"
```

## Additional Resources

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [KV Bindings Documentation](https://developers.cloudflare.com/pages/platform/functions/bindings/#kv-namespaces)
- [KV API Reference](https://developers.cloudflare.com/kv/api/)
- [Troubleshooting Functions](https://developers.cloudflare.com/pages/platform/functions/debugging-and-logging/)

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│ Required KV Bindings for curations.dev             │
├─────────────────────────────────────────────────────┤
│ Variable: CURATIONS_VOTES                           │
│ Namespace: curations-community-CURATIONS_VOTES      │
│ ID: 85931fcebb044408881042bec2cb33de                │
│                                                     │
│ Variable: CURATIONS_IDEAS                           │
│ Namespace: curations-community-CURATIONS_IDEAS      │
│ ID: b81adffa386f42819603a1246902a648                │
│                                                     │
│ Optional (Forum - Paid Plan):                       │
│ Variable: CURATIONS_FORUM                           │
│ Durable Object: ForumDurableObject                  │
└─────────────────────────────────────────────────────┘
```

---

**Need help?** Check the troubleshooting sections in:
- This document
- [`API_INTEGRATION_FIX.md`](./API_INTEGRATION_FIX.md)
- [`cloudflare-deployment.md`](./cloudflare-deployment.md)
