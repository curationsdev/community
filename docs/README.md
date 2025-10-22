# CURATIONS Community Documentation

Welcome to the complete documentation for the CURATIONS Community Hub at [curations.dev](https://curations.dev).

## 🚀 Quick Start

**New to this project?** Start here:
- 📘 [**QUICKSTART.md**](./QUICKSTART.md) - Deploy to Cloudflare in 15 minutes

## 🔧 API Integration Fix (October 2025)

**Experiencing API issues?** These documents address the recent fix:

- 🩹 [**API_INTEGRATION_FIX.md**](./API_INTEGRATION_FIX.md) - Problem, solution, and troubleshooting
- ⚙️ [**PAGES_KV_SETUP.md**](./PAGES_KV_SETUP.md) - Configure KV bindings (required for API)
- ✅ [**POST_DEPLOYMENT_CHECKLIST.md**](./POST_DEPLOYMENT_CHECKLIST.md) - Verify deployment works

## 📚 Complete Guides

### Deployment & Setup
- [**cloudflare-deployment.md**](./cloudflare-deployment.md) - Comprehensive deployment guide
- [**QUICKSTART.md**](./QUICKSTART.md) - Fast-track deployment (15 min)
- [**PAGES_KV_SETUP.md**](./PAGES_KV_SETUP.md) - KV namespace configuration

### Architecture & Implementation
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - System architecture and data flow
- [**IMPLEMENTATION_OVERVIEW.md**](./IMPLEMENTATION_OVERVIEW.md) - Code structure overview

### Maintenance & Troubleshooting
- [**API_INTEGRATION_FIX.md**](./API_INTEGRATION_FIX.md) - API troubleshooting guide
- [**POST_DEPLOYMENT_CHECKLIST.md**](./POST_DEPLOYMENT_CHECKLIST.md) - Testing and verification

### Integrations & Automation
- [**github-integrations.md**](./github-integrations.md) - Available GitHub Apps and automations

## 📖 Documentation by Role

### For Developers

**Setting up locally:**
```bash
npm install
npm run dev
```

**Key files to understand:**
- `src/pages/*.astro` - Routes and pages
- `src/components/*.astro` - Reusable UI components
- `functions/api/[[path]].ts` - API handlers
- `cloudflare/worker.ts` - Standalone worker (optional)

**Read:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the system
- [IMPLEMENTATION_OVERVIEW.md](./IMPLEMENTATION_OVERVIEW.md) - Code structure

### For DevOps / Site Reliability

**Deploying and maintaining:**
- [QUICKSTART.md](./QUICKSTART.md) - Initial deployment
- [cloudflare-deployment.md](./cloudflare-deployment.md) - Detailed deployment
- [PAGES_KV_SETUP.md](./PAGES_KV_SETUP.md) - KV configuration
- [POST_DEPLOYMENT_CHECKLIST.md](./POST_DEPLOYMENT_CHECKLIST.md) - Verification

**Monitoring:**
- Cloudflare Dashboard → Workers & Pages → Functions logs
- Analytics tab for traffic metrics
- KV namespace contents for data inspection

### For Product / Non-Technical

**Understanding what was built:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level overview with diagrams
- [API_INTEGRATION_FIX.md](./API_INTEGRATION_FIX.md) - What was fixed and why

**Testing the site:**
- [POST_DEPLOYMENT_CHECKLIST.md](./POST_DEPLOYMENT_CHECKLIST.md) - Testing guide

## 🔍 Common Tasks

### "I need to deploy this for the first time"
→ [QUICKSTART.md](./QUICKSTART.md)

### "API endpoints aren't working"
→ [API_INTEGRATION_FIX.md](./API_INTEGRATION_FIX.md)
→ [PAGES_KV_SETUP.md](./PAGES_KV_SETUP.md)

### "I need to configure KV bindings"
→ [PAGES_KV_SETUP.md](./PAGES_KV_SETUP.md)

### "How does the system work?"
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

### "I just deployed, what should I test?"
→ [POST_DEPLOYMENT_CHECKLIST.md](./POST_DEPLOYMENT_CHECKLIST.md)

### "I want to add a GitHub integration"
→ [github-integrations.md](./github-integrations.md)

## 🆘 Troubleshooting

### API Returns 404
**Cause:** Functions not deployed or routing misconfigured

**Fix:**
1. Check `public/_routes.json` exists
2. Verify Functions deployed: Cloudflare Dashboard → Deployments
3. See [API_INTEGRATION_FIX.md](./API_INTEGRATION_FIX.md#troubleshooting)

### API Returns 500
**Cause:** KV bindings not configured

**Fix:**
1. Follow [PAGES_KV_SETUP.md](./PAGES_KV_SETUP.md)
2. Add bindings in Cloudflare Dashboard → Settings → Functions
3. Redeploy

### CORS Errors
**Cause:** Old deployment without CORS headers

**Fix:**
1. Pull latest code (includes CORS headers)
2. Redeploy to Cloudflare Pages
3. Hard refresh browser (Ctrl+Shift+R)

### Vote Counts Don't Update
**Cause:** KV eventual consistency or binding issues

**Fix:**
1. Wait 1-2 minutes for KV propagation
2. Check KV bindings configured correctly
3. View KV namespace in dashboard to verify writes

### Ideas Don't Appear
**Cause:** Form submission failed or KV not configured

**Fix:**
1. Check browser console for errors
2. Verify KV bindings (see [PAGES_KV_SETUP.md](./PAGES_KV_SETUP.md))
3. Check Functions logs for errors

## 📊 Project Status

**Current State:**
- ✅ Static site deployed to Cloudflare Pages
- ✅ API endpoints using Pages Functions
- ✅ KV storage for votes and ideas
- ✅ Real-time vote updates
- ✅ Idea submission system
- 🚧 Forum (requires Durable Objects - paid plan)

**Recent Changes (October 2025):**
- Fixed API integration using Pages Functions
- Added CORS headers to all API responses
- Created comprehensive documentation
- Improved error handling and logging

## 🔗 External Resources

- **Live Site:** [curations.dev](https://curations.dev)
- **GitHub:** [curationsdev/community](https://github.com/curationsdev/community)
- **Cloudflare Pages Docs:** [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Cloudflare Workers Docs:** [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)

## 💬 Getting Help

1. **Check this documentation** - Most answers are here
2. **Review logs** - Cloudflare Dashboard → Functions logs
3. **Check GitHub Issues** - See if others had the same problem
4. **Create an Issue** - Describe what's not working with:
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## 🤝 Contributing

Want to improve the docs?

1. Fork the repository
2. Edit files in `docs/`
3. Submit a pull request
4. Follow the [AGENTS.md](../AGENTS.md) guidelines

**Documentation standards:**
- Use clear, concise language
- Include code examples where helpful
- Add diagrams for complex concepts
- Link to related documents
- Keep troubleshooting sections practical

---

**Last Updated:** 2025-10-22
**Maintainer:** CURATIONS Team
**Questions?** Open an issue or check existing documentation first.
