# Show HN: r3f-production — A skill that audits R3F 3D scenes against a real scorecard

Hi HN,

I shipped a Codex CLI / Claude Code skill called `r3f-production` for production-grade 3D web on React Three Fiber + Three.js + Zustand + Next.js.

The pitch in one line: most R3F resources teach you how to build a *demo*; this skill audits a 3D experience against a real scorecard — GPU budgets, anti-patterns, accessibility, an 88/100 ship gate — so an agent or a reviewer can decide "is this actually production-ready?" instead of guessing.

What's in it:

- 13 hard rules with WRONG / WHY / CORRECT (e.g. `metalness > 0` without an envMap = black blob; `setState` in `useFrame` kills the loop at 60fps; frame-count animations drift 2.4x between 144Hz and 60Hz).
- A 6-step workflow: experience archetype → canvas architecture → GLB asset pipeline → polish chain (HDRI, tone mapping, post, motion) → three-speed state (Zustand refs / store) → audit.
- The 88/100 audit scorecard: ten entries, each with one line of evidence. Below 88 you do not ship; above 88 without per-entry evidence is just as invalid.
- Vendor API reference files (TSL/NodeMaterial, post-processing passes, the r170→r183 migration) preserved under MIT with attribution and a July 2026 errata header, because three.js API surface moves fast.
- A headless Blender → Draco GLB exporter (`scripts/export_glb.py`).
- Self-hosted CI docs: the skill's own `.github/workflows/ci.yml` runs the same on GitHub Actions and Forgejo Actions, so you can run CI on your own VPS with zero minute-billing.

Why a skill (not a library): the value is in the rules and the scorecard, not runtime code. Keeping it as a Codex/Claude skill puts the rules where the 3D code is actually written.

Repo + skill install:

    git clone https://github.com/ciroautuori/r3f-production.git ~/.codex/skills/r3f-production

MIT, English-only, contributions welcome. Especially welcome: errata to the vendor API references as three.js revs, and attribution corrections in `CREDITS.md`.

Happy to answer questions on the scorecard, the self-hosted CI setup, or three.js SOTA in July 2026.
