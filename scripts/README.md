# Deployment Scripts

Utility scripts to help with Cloudflare deployment and setup.

## Available Scripts

### `setup-cloudflare.sh`

Creates Cloudflare KV namespaces required for the Worker.

**Usage:**
```bash
./scripts/setup-cloudflare.sh
```

**Prerequisites:**
- Wrangler CLI installed (script will install if missing)
- Logged into Cloudflare (`wrangler login`)

**What it does:**
1. Creates production KV namespaces for votes and ideas
2. Creates development KV namespaces
3. Outputs namespace IDs for updating `wrangler.toml`

### `verify-setup.sh`

Verifies that the project is ready for deployment.

**Usage:**
```bash
./scripts/verify-setup.sh
```

**Checks performed:**
- Node.js version (18+)
- Dependencies installed
- Build succeeds
- Cloudflare configuration files exist
- GitHub Actions workflows configured
- Documentation present
- KV namespace IDs configured

**Exit codes:**
- `0` - All checks passed
- `1` - One or more checks failed

## Making Scripts Executable

If you need to make scripts executable:

```bash
chmod +x scripts/*.sh
```

## Troubleshooting

**Permission denied:**
```bash
chmod +x scripts/setup-cloudflare.sh
./scripts/setup-cloudflare.sh
```

**Wrangler not found:**
```bash
npm install -g wrangler
wrangler login
```

**KV namespace creation fails:**
- Ensure you're logged into the correct Cloudflare account
- Verify your API token has appropriate permissions
- Check account has Workers subscription enabled
