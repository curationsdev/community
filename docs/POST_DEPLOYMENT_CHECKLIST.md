# Post-Deployment Checklist for API Fix

Use this checklist after deploying the API integration fix to Cloudflare Pages.

## Immediate Actions (After Merge)

### 1. Verify Automatic Deployment
- [ ] Check GitHub Actions: https://github.com/curationsdev/community/actions
- [ ] Ensure workflow completes successfully
- [ ] Note the deployment URL from Actions logs

### 2. Configure KV Bindings (CRITICAL)

> ⚠️ **Without this step, APIs will not work!**

Follow [`PAGES_KV_SETUP.md`](./PAGES_KV_SETUP.md) to configure:

1. Go to Cloudflare Dashboard → Workers & Pages → curations-community
2. Settings → Functions → KV namespace bindings
3. Add bindings:
   - [ ] `CURATIONS_VOTES` → `curations-community-CURATIONS_VOTES`
   - [ ] `CURATIONS_IDEAS` → `curations-community-CURATIONS_IDEAS`
4. Save changes

### 3. Trigger Redeploy
- [ ] Go to Deployments tab
- [ ] Click "Retry deployment" on latest deployment
- [ ] Wait for completion (~2 minutes)

## Testing Phase

### 4. Test API Endpoints

**Test Votes Endpoint:**
```bash
# Should return {} or object with vote counts
curl https://curations.dev/api/votes
```
- [ ] Returns valid JSON (not 404)
- [ ] No errors in response

**Test Vote Submission:**
```bash
curl -X POST https://curations.dev/api/vote \
  -H "Content-Type: application/json" \
  -d '{"id":"test-project-1"}'
```
- [ ] Returns JSON with `{"id":"test-project-1","votes":1}`
- [ ] Subsequent calls increment the count

**Test Ideas List:**
```bash
curl https://curations.dev/api/ideas
```
- [ ] Returns array (empty `[]` or with ideas)
- [ ] No errors in response

**Test Idea Submission:**
```bash
curl -X POST https://curations.dev/api/idea \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Idea","description":"Testing API","categories":["test"]}'
```
- [ ] Returns JSON with created idea (includes `id`, `createdAt`)
- [ ] Status code is 201

### 5. Test in Browser

**Projects Page:**
1. [ ] Visit https://curations.dev/projects
2. [ ] Click a vote button
3. [ ] Vote count increments
4. [ ] Check browser console (F12) for errors
5. [ ] See success notification appear

**Ideas Page:**
1. [ ] Visit https://curations.dev/ideas
2. [ ] Page loads without errors
3. [ ] Existing ideas display (if any)
4. [ ] Scroll to submission form
5. [ ] Fill in: Title, Description, Categories
6. [ ] Click "Send Idea"
7. [ ] See success message
8. [ ] New idea appears in list (may take 1-2 seconds)
9. [ ] Can vote on the new idea

**Forum Pages:**
1. [ ] Visit https://curations.dev/forum
2. [ ] All channels load
3. [ ] Can navigate to individual channels
4. [ ] (Forum posting requires Durable Objects - optional feature)

### 6. Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browser

### 7. Incognito/Private Mode
- [ ] Open in incognito/private window
- [ ] Test vote functionality
- [ ] Test idea submission
- [ ] Verify no cache issues

## Monitoring

### 8. Check Cloudflare Logs

**Pages Functions Logs:**
1. Go to Cloudflare Dashboard → Workers & Pages → curations-community
2. Deployments → Click latest deployment
3. Click "Functions log" tab
4. Look for:
   - [ ] No error messages
   - [ ] Successful API requests logged
   - [ ] No KV binding errors

**Analytics:**
1. Navigate to Analytics tab
2. Check:
   - [ ] Page views increasing
   - [ ] Function invocations working
   - [ ] No 500 errors

### 9. KV Namespace Contents

Verify data is being stored:

1. Go to Workers & Pages → KV
2. Click `curations-community-CURATIONS_VOTES`
   - [ ] See keys for voted items
   - [ ] Values are numeric strings
3. Click `curations-community-CURATIONS_IDEAS`
   - [ ] See keys (UUIDs)
   - [ ] Values are JSON strings

## Performance Check

### 10. Response Times
- [ ] API responds within 1-2 seconds
- [ ] Vote button feedback is immediate
- [ ] Page loads are fast (~1-2s)
- [ ] No timeout errors

### 11. Cache Behavior
- [ ] Static pages are cached (instant reload)
- [ ] API requests are not cached (fresh data)
- [ ] Vote counts update properly

## Troubleshooting (If Issues Found)

### API Returns 404
→ Check `public/_routes.json` is in deployment
→ Verify Functions directory exists in deployment
→ See [`API_INTEGRATION_FIX.md`](./API_INTEGRATION_FIX.md) troubleshooting

### API Returns 500
→ Check Functions logs for errors
→ Verify KV bindings are configured
→ Ensure namespace IDs are correct

### CORS Errors
→ Should not happen with this fix
→ Check browser console for details
→ Verify latest code is deployed

### Data Not Persisting
→ Verify KV bindings
→ Check you're using production namespaces (not dev)
→ View namespace contents in dashboard

### Votes Count Wrong
→ May be cached in KV (eventual consistency)
→ Wait 1-2 minutes and check again
→ Verify correct namespace is bound

## Cleanup (Optional)

### 12. Remove Old Worker Deployment

If you want to keep only Pages Functions:

1. Go to Workers & Pages
2. Find `curations-community` Worker (separate from Pages)
3. Can delete if not needed
4. Pages Functions handle all API traffic

**Note:** Keeping the Worker doesn't cause issues and provides a backup.

### 13. Update DNS (If Needed)

If custom domain is already configured:
- [ ] Verify `curations.dev` points to Pages
- [ ] Test at production domain
- [ ] Ensure API works on custom domain

## Documentation Updates

### 14. Update Team

Inform team members:
- [ ] API fix is deployed
- [ ] How to test functionality
- [ ] Where to find logs
- [ ] Who to contact for issues

### 15. Update README (If Needed)

Confirm README reflects:
- [ ] Current architecture (Pages Functions)
- [ ] API endpoints
- [ ] Deployment status

## Sign-Off

- [ ] All critical tests pass
- [ ] API functionality confirmed
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Team informed

**Date Completed:** _____________

**Tested By:** _____________

**Issues Found:** _____________

**Resolution:** _____________

---

## Quick Test Script

Save this as `test-api.sh` for quick testing:

```bash
#!/bin/bash

BASE_URL="${1:-https://curations.dev}"

echo "Testing API at $BASE_URL"
echo ""

echo "1. Testing GET /api/votes..."
curl -s "$BASE_URL/api/votes" | jq .
echo ""

echo "2. Testing POST /api/vote..."
curl -s -X POST "$BASE_URL/api/vote" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-'$(date +%s)'"}' | jq .
echo ""

echo "3. Testing GET /api/ideas..."
curl -s "$BASE_URL/api/ideas" | jq '. | length' 
echo " ideas found"
echo ""

echo "4. Testing POST /api/idea..."
curl -s -X POST "$BASE_URL/api/idea" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Idea '"$(date +%H:%M:%S)"'","description":"Automated test","categories":["test"]}' | jq .
echo ""

echo "Done! Check for errors above."
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh https://curations.dev
```

---

## Support Resources

- **Fix Details:** [`API_INTEGRATION_FIX.md`](./API_INTEGRATION_FIX.md)
- **KV Setup:** [`PAGES_KV_SETUP.md`](./PAGES_KV_SETUP.md)
- **Deployment:** [`QUICKSTART.md`](./QUICKSTART.md)
- **General Help:** [`cloudflare-deployment.md`](./cloudflare-deployment.md)
