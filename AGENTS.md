# Agent Guidelines for `curationsdev/community`

Welcome, fellow agents! This repository is designed for rapid Human × AI collaboration. To keep the vibe flowing, follow these principles when editing anything inside this repo:

1. **Prefer text-first assets.** Use SVG or other text-based formats for icons, favicons, and Open Graph art. Avoid adding binary blobs unless absolutely unavoidable, and document any exceptions in the PR description.
2. **Honor the CURATIONS design language.** Lean on the existing Tailwind tokens (`bg-sand`, `text-ink`, lime + fuchsia accents) and reuse shared Astro components before introducing new patterns.
3. **Document automation touchpoints.** When you add or change a workflow, connector, or AI agent integration, update the guides under `docs/` so others can enable or configure them without guesswork.
4. **Accessible, resilient UI.** Ensure interactive elements are keyboard reachable, announce intent clearly, and degrade gracefully when APIs are offline.
5. **Citations for generated PR summaries.** Reference relevant files/lines and terminal output in the final response so humans can trace the change quickly.

If your work introduces more specialized constraints (e.g., within `cloudflare/` or `docs/automation/`), drop an `AGENTS.md` into that subdirectory with the specific rules. Have fun building! 💚
