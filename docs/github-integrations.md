# GitHub Integrations, Agents, and Connectors

This guide catalogs automation surfaces we can enable for the CURATIONS Community Hub. Each entry notes what it does, the GitHub integration type, and quick-start steps so we can wire things up rapidly once credentials are available.

> ℹ️ Availability for some apps or models depends on the organization account tier. If an integration is not yet enabled, the "Activation" column highlights how to request or self-service install it.

## Cloudflare & Deployment Automation

| Integration | Type | Purpose | Activation |
| --- | --- | --- | --- |
| [Cloudflare Pages GitHub App](https://dash.cloudflare.com/) | GitHub App | Connects this repo to Cloudflare Pages for automatic builds and previews. | Install from Cloudflare dashboard → Pages → "Connect to Git" → authorize `curationsdev/community`. |
| [`cloudflare/pages-action`](https://github.com/cloudflare/pages-action) | GitHub Action | Trigger Pages deployments from workflows (useful for custom build matrix or monorepo setups). | Add workflow using action `cloudflare/pages-action@v1` with API token + account/project IDs stored in secrets. |
| [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action) | GitHub Action | Automates Worker + Durable Object deployments alongside the Pages build. | Add `wrangler-action@v3` step with `CF_API_TOKEN`, `CF_ACCOUNT_ID`, and `workingDirectory: cloudflare`. |
| [Cloudflare KV Migration Bot](https://developers.cloudflare.com/workers/wrangler/kv) | CLI (Wrangler) | Scriptable KV namespace creation, binding, and seeding. | Add npm script `wrangler kv:namespace create` and run inside Actions with Wrangler. |

## GitHub-Native Agents & Automations

| Integration | Type | Purpose | Activation |
| --- | --- | --- | --- |
| [GitHub Actions](https://docs.github.com/actions) | Native | CI/CD workflows for linting, testing, preview deploys, syncing data. | Enable in repo settings (Actions → General). Create workflows under `.github/workflows/`. |
| [Dependabot](https://github.com/dependabot) | GitHub App | Automated dependency PRs for npm, GitHub Actions, and Docker. | Enable in repo settings → Security → Code security. Configure via `.github/dependabot.yml`. |
| [GitHub Advanced Security CodeQL](https://securitylab.github.com/tools/codeql) | GitHub Action/App | Static analysis for vulnerabilities. | Requires GitHub Advanced Security license. Enable in Security tab → Code scanning → "Set up CodeQL". |
| [Mergify](https://github.com/marketplace/mergify) | GitHub App | Automates merge queues and rule-based PR merges. | Install from GitHub Marketplace and add `.mergify.yml`. |
| [All Contributors Bot](https://github.com/apps/allcontributors) | GitHub App | Automates contributor acknowledgements. | Install app → add `.all-contributorsrc` → use `/all-contributors add` comments. |

## AI Models & Prompting Assistants

| Integration | Type | Purpose | Activation |
| --- | --- | --- | --- |
| [GitHub Copilot](https://github.com/features/copilot) | GitHub Service | In-editor pair programming model (GPT-4o, Claude, etc.). | Requires org Copilot seats. Enable at org level, assign seats to maintainers. |
| [Copilot Chat for Pull Requests](https://docs.github.com/copilot/github-copilot-chat/about-github-copilot-chat) | GitHub App | Chat-based PR reviews + inline suggestions. | Enable Copilot for Pull Requests (public beta) in repo settings if available. |
| [OpenAI Actions for GitHub](https://github.com/openai/openai-openapi) | GitHub Action | Run OpenAI models inside workflows (docs generation, summarization). | Create workflow using community actions such as `openai/openai-actions@main`, store `OPENAI_API_KEY` secret. |
| [Anthropic Claude in Actions](https://github.com/anthropic/anthropic-quickstarts) | GitHub Action | Use Claude models for issue triage or release notes. | Add action `anthropic/anthropic-quickstart-action@v1`, supply `ANTHROPIC_API_KEY`. |
| [Replicate Deploy Action](https://github.com/replicate/replicate-action) | GitHub Action | Run open-source models (image/audio) for marketing assets. | Install action, set `REPLICATE_API_TOKEN`. |

## Issue & Community Management Bots

| Integration | Type | Purpose | Activation |
| --- | --- | --- | --- |
| [GitHub Discussions Auto Moderator](https://github.com/marketplace/discussions-auto-moderator) | GitHub App | Manage spam/label routing within Discussions. | Install app, configure `.github/discussions-auto-moderator.yml`. |
| [Probot Settings](https://github.com/probot/settings) | GitHub App | Sync repository settings, labels, and branch protections via code. | Install app and commit `.github/settings.yml`. |
| [Issue Forms + Formspree/Worker Webhook](https://docs.github.com/issues/building-community/configuring-issue-templates-for-your-repository) | Issue Templates | Collect prompts/ideas with structured metadata. | Add `.github/ISSUE_TEMPLATE/*.yml`. Optionally connect to Cloudflare Worker webhook for notifications. |
| [Stale Bot](https://github.com/probot/stale) | GitHub App | Auto-close inactive issues while leaving curated ones pinned. | Install app, configure `.github/stale.yml`. |

## Observability & Analytics Hooks

| Integration | Type | Purpose | Activation |
| --- | --- | --- | --- |
| [DataDog CI Visibility Action](https://github.com/DataDog/datadog-actions) | GitHub Action | Send build/test telemetry. | Add `datadog-ci@v3` action with API keys. |
| [Sentry Release Action](https://github.com/getsentry/action-release) | GitHub Action | Automate release tracking and source maps for the Astro build. | Install action, set `SENTRY_AUTH_TOKEN`, project/org slug. |
| [Plausible Deploy Action](https://github.com/plausible/analytics) | GitHub Action | Sync analytics site metadata post-deploy. | Use HTTP API via workflow calling `plausible`. |

## How to Extend This Catalog

1. **Propose** a new connector in an issue or PR, referencing the Marketplace listing or documentation.
2. **Document** required secrets, scopes, and automation behavior in this file (add a new row under the relevant section).
3. **Implement** the workflow/app installation and note any environment variables inside the README deployment section.
4. **Announce** the change in the changelog or release notes so the community knows what tooling is available.

When a connector requires credentials we do not yet have, leave the configuration commented within workflow files and mark the table row with "Pending token" so it's easy to revisit.
