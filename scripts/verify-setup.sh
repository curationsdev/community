#!/bin/bash
# Verification script to check deployment readiness

set -e

echo "🔍 CURATIONS Community - Deployment Verification"
echo "=================================================="
echo ""

ERRORS=0

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo "✅ Node.js version: $(node -v)"
else
    echo "❌ Node.js version too old. Required: 18+, Found: $(node -v)"
    ERRORS=$((ERRORS + 1))
fi

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed. Run: npm install"
    ERRORS=$((ERRORS + 1))
fi

# Check if build works
echo ""
echo "🔨 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Run: npm run build"
    ERRORS=$((ERRORS + 1))
fi

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "✅ Build output directory exists"
else
    echo "❌ Build output directory not found"
    ERRORS=$((ERRORS + 1))
fi

# Check wrangler.toml
echo ""
echo "⚙️  Checking Cloudflare configuration..."
if [ -f "wrangler.toml" ]; then
    echo "✅ wrangler.toml exists"
    
    # Check if KV namespace IDs are set
    if grep -q "<to-be-created>" wrangler.toml; then
        echo "⚠️  KV namespace IDs not yet configured in wrangler.toml"
        echo "   Run: ./scripts/setup-cloudflare.sh"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ KV namespace IDs configured"
    fi
else
    echo "❌ wrangler.toml not found"
    ERRORS=$((ERRORS + 1))
fi

# Check GitHub workflows
echo ""
echo "🔄 Checking GitHub Actions workflows..."
if [ -f ".github/workflows/cloudflare-deploy.yml" ]; then
    echo "✅ Cloudflare Pages workflow exists"
else
    echo "❌ Cloudflare Pages workflow not found"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".github/workflows/cloudflare-worker-deploy.yml" ]; then
    echo "✅ Cloudflare Worker workflow exists"
else
    echo "❌ Cloudflare Worker workflow not found"
    ERRORS=$((ERRORS + 1))
fi

# Check documentation
echo ""
echo "📚 Checking documentation..."
if [ -f "docs/QUICKSTART.md" ]; then
    echo "✅ Quick start guide exists"
else
    echo "⚠️  Quick start guide not found"
fi

if [ -f "docs/cloudflare-deployment.md" ]; then
    echo "✅ Deployment guide exists"
else
    echo "⚠️  Deployment guide not found"
fi

# Summary
echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo "✨ All checks passed! Ready for deployment."
    echo ""
    echo "Next steps:"
    echo "  1. Configure GitHub secrets (see docs/QUICKSTART.md)"
    echo "  2. Set up KV namespaces: ./scripts/setup-cloudflare.sh"
    echo "  3. Connect to Cloudflare Pages via dashboard"
    exit 0
else
    echo "❌ Found $ERRORS issue(s). Please fix before deploying."
    exit 1
fi
