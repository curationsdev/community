# API Integration Fix - Cloudflare Pages + Worker

## Problem Identified

The API endpoints (`/api/vote`, `/api/idea`, `/api/forum`) were not being processed when users interacted with the site. This was due to a missing integration between Cloudflare Pages (serving the static Astro site) and the Cloudflare Worker (handling API requests).

## Root Cause

When deploying to Cloudflare Pages:
1. Static HTML/CSS/JS files are served directly from Pages
2. API requests to `/api/*` were being handled by Pages (which has no API logic)
3. The separate Worker deployment was not connected to the Pages deployment
4. No routing configuration existed to forward API traffic to the Worker

## Solution Implemented

We've implemented a **Cloudflare Pages Functions** approach that creates API handlers directly within the Pages deployment. This is the recommended approach for Cloudflare Pages + API integration.

### Changes Made

1. **Created `public/_routes.json`**
   - Configures Cloudflare Pages routing
   - Excludes `/api/*` from static asset serving
   - Allows Functions to handle API routes

2. **Created `functions/api/[[path]].ts`**
   - Cloudflare Pages Function that handles all `/api/*` routes
   - Uses the same KV namespaces as the Worker
   - Includes proper CORS headers for cross-origin requests
   - Handles all API operations: votes, ideas, forum

3. **Updated `cloudflare/worker.ts`**
   - Added CORS headers to all API responses
   - Improved error handling with proper JSON responses
   - Made Worker compatible with both standalone and Pages deployment

### How It Works

```
User Browser
    ↓
curations.dev
    ↓
Cloudflare Pages
    ├─→ Static Routes (/, /projects, /ideas, /forum)
    │   └─→ Served from dist/ directory
    │
    └─→ API Routes (/api/*)
        └─→ Handled by functions/api/[[path]].ts
            └─→ Uses CURATIONS_VOTES and CURATIONS_IDEAS KV namespaces
```

## Deployment Configuration

### For Cloudflare Pages

The Pages deployment will automatically pick up:
- `public/_routes.json` - Routing configuration
- `functions/api/[[path]].ts` - API handler

**Required KV Bindings in Pages Settings:**
1. Go to Cloudflare Dashboard → Workers & Pages → Your Pages Project
2. Navigate to Settings → Functions
3. Add KV namespace bindings:
   - Variable name: `CURATIONS_VOTES`
   - KV namespace: Select your votes namespace
   - Variable name: `CURATIONS_IDEAS`
   - KV namespace: Select your ideas namespace
4. (Optional) For forum features:
   - Variable name: `CURATIONS_FORUM`
   - Durable Object: ForumDurableObject (requires paid plan)

### For Standalone Worker (Optional)

If you still want to deploy the Worker separately (not required with Pages Functions):
```bash
npx wrangler deploy
```

The Worker includes the same API logic and can be used as:
- Backup API endpoint
- Development environment
- Alternative deployment strategy

## Testing the Fix

### 1. Vote Functionality
- Navigate to `/projects`
- Click any vote button
- Should see vote count increment
- Check browser console for successful API call

### 2. Idea Submission
- Navigate to `/ideas`
- Scroll to "Submit a New Idea" form
- Fill in title, description, categories
- Click "Send Idea"
- Should see success message
- Idea should appear in the list

### 3. Verify API Endpoints

Test with curl or browser:
```bash
# Get all votes
curl https://curations.dev/api/votes

# Submit a vote
curl -X POST https://curations.dev/api/vote \
  -H "Content-Type: application/json" \
  -d '{"id":"test-project"}'

# Get all ideas
curl https://curations.dev/api/ideas

# Submit an idea
curl -X POST https://curations.dev/api/idea \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Idea","description":"Testing the API","categories":["test"]}'
```

## Cache Considerations

Cloudflare Pages caches static assets but not API responses by default. The API Functions:
- Are executed on every request (no caching)
- Read from/write to KV in real-time
- Should respond within 1-2 seconds

If you experience caching issues:
1. Check Cloudflare Dashboard → Caching → Configuration
2. Ensure `/api/*` paths are excluded from cache rules
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Test in incognito/private browsing mode

## Troubleshooting

### API Returns 404
- Verify `functions/api/[[path]].ts` exists
- Check Pages deployment logs for function errors
- Ensure KV namespaces are bound in Pages settings

### API Returns 500
- Check Pages Functions logs in Cloudflare Dashboard
- Verify KV namespace IDs are correct
- Check that namespaces have proper permissions

### CORS Errors
- The fix includes CORS headers in all responses
- If still seeing errors, check browser console for details
- Verify the error is not from a different service

### Votes/Ideas Not Persisting
- Verify KV namespace bindings in Pages settings
- Check KV namespace contents in Cloudflare Dashboard
- Ensure you're using the correct namespace (prod vs dev)

## Benefits of This Approach

1. **Single Domain**: All traffic goes through `curations.dev`
2. **Simplified Deployment**: No need to manage separate Worker routes
3. **Better Integration**: Pages Functions have direct access to KV
4. **Cost Effective**: Uses Pages' included Function invocations
5. **Easier Debugging**: Logs and monitoring in one place

## Migration Notes

- Existing Worker deployment can remain (won't conflict)
- KV namespaces are shared between Worker and Pages Functions
- No data migration needed
- Can switch back to standalone Worker if needed

## Next Steps

1. Deploy to Cloudflare Pages (see `docs/QUICKSTART.md`)
2. Configure KV bindings in Pages settings
3. Test all API functionality
4. Monitor Pages Functions logs for any issues
5. (Optional) Remove standalone Worker deployment if no longer needed

## Additional Resources

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Pages KV Bindings](https://developers.cloudflare.com/pages/platform/functions/bindings/)
- [Routing Configuration](https://developers.cloudflare.com/pages/platform/serving-pages/#route-matching)
