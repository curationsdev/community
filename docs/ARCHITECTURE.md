# CURATIONS Community Architecture

## Overview

This document explains how the curations.dev infrastructure works after the API integration fix (2025-10-22).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                  │
│  • Loads HTML/CSS/JS from Cloudflare Pages                      │
│  • Makes API calls to /api/* endpoints                          │
│  • Receives real-time data from KV storage                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    curations.dev (Cloudflare)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐          ┌─────────────────────┐        │
│  │  Cloudflare Pages  │          │  Pages Functions    │        │
│  │  (Static Site)     │          │  (API Layer)        │        │
│  ├────────────────────┤          ├─────────────────────┤        │
│  │                    │          │                     │        │
│  │  Routes:           │          │  Routes:            │        │
│  │  • /               │          │  • /api/vote        │        │
│  │  • /projects       │          │  • /api/votes       │        │
│  │  • /ideas          │          │  • /api/idea        │        │
│  │  • /forum          │          │  • /api/ideas       │        │
│  │  • All static HTML │          │  • /api/forum       │        │
│  │                    │          │                     │        │
│  │  Source:           │          │  Source:            │        │
│  │  • dist/           │          │  • functions/api/   │        │
│  │                    │          │      [[path]].ts    │        │
│  └────────────────────┘          └──────────┬──────────┘        │
│                                              │                   │
│                                              │ Read/Write        │
│                                              ↓                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Cloudflare KV Storage                       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  ┌─────────────────────┐    ┌──────────────────────┐   │   │
│  │  │  CURATIONS_VOTES    │    │  CURATIONS_IDEAS     │   │   │
│  │  ├─────────────────────┤    ├──────────────────────┤   │   │
│  │  │ Key: project-id-1   │    │ Key: idea-uuid-1     │   │   │
│  │  │ Value: "42"         │    │ Value: {JSON}        │   │   │
│  │  │                     │    │                      │   │   │
│  │  │ Key: project-id-2   │    │ Key: idea-uuid-2     │   │   │
│  │  │ Value: "18"         │    │ Value: {JSON}        │   │   │
│  │  └─────────────────────┘    └──────────────────────┘   │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Static Page Request

```
User Browser
    │
    │ GET /projects
    ↓
Cloudflare Pages
    │
    │ Serve /projects/index.html
    ↓
User Browser
    │
    │ Render page with vote buttons
    └─→ Vote buttons ready for interaction
```

### API Request (Vote)

```
User Browser
    │
    │ Click vote button
    │
    │ POST /api/vote
    │ Body: {"id": "project-1"}
    ↓
Cloudflare Pages (_routes.json)
    │
    │ Route to Functions (exclude /api/* from static)
    ↓
Pages Function (functions/api/[[path]].ts)
    │
    │ 1. Parse request
    │ 2. Get current count from KV
    │
    ├─→ CURATIONS_VOTES.get("project-1")
    │   └─→ Returns "41"
    │
    │ 3. Increment count
    │ 4. Write back to KV
    │
    ├─→ CURATIONS_VOTES.put("project-1", "42")
    │
    │ 5. Return response
    ↓
User Browser
    │
    │ {"id": "project-1", "votes": 42}
    │
    └─→ Update UI with new count
```

### API Request (Idea Submission)

```
User Browser
    │
    │ Fill form on /ideas page
    │ Click "Send Idea"
    │
    │ POST /api/idea
    │ Body: {"title": "...", "description": "...", "categories": [...]}
    ↓
Pages Function
    │
    │ 1. Generate UUID
    │ 2. Create idea object
    │ 3. Store in KV
    │
    ├─→ CURATIONS_IDEAS.put(uuid, JSON.stringify({
    │       id: uuid,
    │       title: "...",
    │       description: "...",
    │       categories: [...],
    │       votes: 0,
    │       createdAt: "2025-10-22T..."
    │   }))
    │
    │ 4. Return created idea
    ↓
User Browser
    │
    │ Receive idea with ID
    │
    └─→ Show success message
        Add idea to UI immediately
```

## Component Breakdown

### 1. Astro Static Site (src/)

**Purpose:** Generate static HTML pages

**Key Files:**
- `src/pages/*.astro` - Route definitions
- `src/components/*.astro` - Reusable UI components
- `src/layouts/*.astro` - Page templates

**Output:** `dist/` directory with HTML, CSS, JS

### 2. Pages Functions (functions/)

**Purpose:** Handle API requests serverlessly

**Key Files:**
- `functions/api/[[path]].ts` - Catch-all API handler

**Features:**
- Runs on Cloudflare's edge network
- Has access to KV namespaces via bindings
- Executes on every request (no caching)
- Includes CORS headers for browser access

### 3. Routing Configuration (public/_routes.json)

**Purpose:** Tell Cloudflare Pages how to route requests

**Content:**
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/api/*"]
}
```

**Meaning:**
- `include: ["/*"]` - Serve all routes as static files
- `exclude: ["/api/*"]` - EXCEPT /api/* routes
- Excluded routes are handled by Functions

### 4. KV Storage

**Purpose:** Persistent key-value storage

**CURATIONS_VOTES:**
- Key format: `project-id` or `idea-uuid`
- Value format: String number (e.g., `"42"`)
- Operations: GET (read count), PUT (update count)

**CURATIONS_IDEAS:**
- Key format: UUID (e.g., `"550e8400-e29b-41d4-a716-446655440000"`)
- Value format: JSON string of idea object
- Operations: GET (read idea), PUT (store idea), LIST (get all)

## Data Flow

### Vote Count Update

1. **Client-side optimistic update**
   - Button shows new count immediately
   - Spinner/loading indicator appears

2. **API call**
   - POST to /api/vote
   - Backend increments count in KV

3. **Response handling**
   - Success: Keep optimistic update
   - Error: Revert to previous count

4. **Eventual consistency**
   - KV updates propagate globally (~1-2 seconds)
   - Other users see updated count on next page load

### Idea Submission Flow

1. **Form validation** (client-side)
   - Title: Required
   - Description: Required
   - Categories: Optional, comma-separated

2. **API submission**
   - POST to /api/idea
   - Generates UUID
   - Stores in CURATIONS_IDEAS KV

3. **Optimistic UI update**
   - Immediately show idea in list
   - Mark as "just submitted"

4. **Background refresh**
   - After 2 seconds, fetch fresh data
   - Replace optimistic item with confirmed data

## Security

### CORS Configuration

All API responses include:
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type'
```

**Why:** Browser security requires CORS headers for API calls from the same domain.

### Input Validation

- Vote: Requires `id` field
- Idea: Requires `title` and `description`
- All JSON parsing is wrapped in try-catch

### Rate Limiting

Cloudflare provides default rate limiting on Pages Functions:
- Free plan: 100,000 requests/day
- Can add custom rate limiting rules in dashboard

## Performance Characteristics

### Static Pages
- **CDN Cached:** Yes
- **Load Time:** <100ms (cached), ~500ms (first load)
- **Global:** Served from 275+ Cloudflare locations

### API Functions
- **CDN Cached:** No (always executes)
- **Response Time:** ~50-200ms
- **Execution:** On Cloudflare edge (near user)

### KV Storage
- **Read Latency:** <100ms (usually <10ms)
- **Write Latency:** Immediate locally, ~60s global propagation
- **Consistency:** Eventual consistency globally

## Deployment Pipeline

```
GitHub Repository
    │
    │ Push to main branch
    ↓
GitHub Actions
    │
    ├─→ Build Astro site (npm run build)
    │   └─→ Generates dist/
    │
    └─→ Deploy to Cloudflare Pages
        ├─→ Upload dist/ (static files)
        ├─→ Upload functions/ (API handlers)
        └─→ Apply _routes.json configuration
        
        ↓
        
Cloudflare Pages
    │
    └─→ Live at curations.dev
```

## Environment Variables

### Build Time (Astro)
- `PUBLIC_VOTE_ENDPOINT=/api/vote`
- `PUBLIC_IDEA_ENDPOINT=/api/idea`
- `PUBLIC_FORUM_ENDPOINT=/api/forum`

### Runtime (Pages Functions)
- Bindings configured in Cloudflare Dashboard:
  - `CURATIONS_VOTES` → KV namespace
  - `CURATIONS_IDEAS` → KV namespace
  - `CURATIONS_FORUM` → Durable Object (optional)

## Monitoring & Debugging

### Logs Location
1. Cloudflare Dashboard
2. Workers & Pages → curations-community
3. Deployments → Click deployment
4. Functions log tab

### What to Monitor
- Function invocation count
- Error rate
- Response time (should be <200ms)
- KV operation count

### Common Issues
- **404 on /api/*:** Functions not deployed or _routes.json missing
- **500 errors:** Check Functions logs, likely KV binding issue
- **CORS errors:** Should not happen with fix, check deployment
- **Stale data:** KV eventual consistency, wait 1-2 minutes

## Scalability

### Current Limits (Cloudflare Free Plan)
- **Requests:** 100,000/day
- **KV Reads:** 100,000/day
- **KV Writes:** 1,000/day
- **KV Storage:** 1 GB

### Upgrade Path
If limits are exceeded:
- **Pages:** Automatic scaling (no limits)
- **Functions:** Workers Paid ($5/month) - 10M requests
- **KV:** Paid plan - unlimited operations

## Comparison: Before vs After Fix

### Before (Broken)

```
User → Pages (static) → /api/vote → 404 (not found)
                                   ↓
                            Worker was separate
                            and not connected
```

### After (Fixed)

```
User → Pages → /api/vote → Functions → KV → Response
            ↓                    ↓
     Static pages        API handlers
```

## Future Enhancements

Potential improvements:
1. **Redis/D1:** For more complex queries than KV
2. **Durable Objects:** Real-time forum with WebSocket
3. **Analytics:** Track popular projects/ideas
4. **Admin Dashboard:** Manage content via UI
5. **Rate Limiting:** Per-IP vote limits

---

## Quick Reference

**Static Files:** Served from Pages, cached by CDN
**API Endpoints:** Handled by Pages Functions, not cached
**Data Storage:** Cloudflare KV, eventual consistency
**Deployment:** Automatic via GitHub Actions
**Monitoring:** Cloudflare Dashboard → Functions logs

For more details:
- **Fix Details:** [`API_INTEGRATION_FIX.md`](./API_INTEGRATION_FIX.md)
- **Deployment:** [`QUICKSTART.md`](./QUICKSTART.md)
- **KV Setup:** [`PAGES_KV_SETUP.md`](./PAGES_KV_SETUP.md)
