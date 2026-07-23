# r3f-rules

> Production-grade governance for 3D web on **React Three Fiber + Three.js + Zustand + Next.js**. Treat the 3D canvas as a runtime GPU with explicit performance, accessibility and quality budgets — then audit them.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/ciroautuori/r3f-rules?style=social)](https://github.com/ciroautuori/r3f-rules/stargazers)
[![GitHub last commit](https://img.shields.io/github/last-commit/ciroautuori/r3f-rules)](https://github.com/ciroautuori/r3f-rules/commits/main)
[![Skill](https://img.shields.io/badge/Codex%20Skill-r3f--rules-orange.svg)](./SKILL.md)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A 3D scene is a runtime with a GPU budget, not a decorative animation library.
The non-negotiable contract: 3D must be **progressive, observable, accessible,
and always replaceable by a 2D fallback**. `r3f-rules` turns that
contract into concrete steps, hard rules, and an audit scorecard.

## Why r3f-rules?

- **No more guesswork**: 13 hard rules for 3D web production that replace "it works on my machine" with deterministic performance.
- **Agent-first architecture**: Built as a native skill for Claude Code, Codex CLI, and Cursor so your AI pair-programmer enforces the rules as you type.
- **Production-grade metrics**: Stop building 3D demos and start shipping award-winning experiences with explicit GPU budgets, accessibility guarantees, and a strict 88/100 scorecard.

## Quick Start

### Using with Claude Code
Copy the `SKILL.md` or this repo into your project context, and let Claude know it should follow the `r3f-rules` for 3D components.

### Using with Codex CLI
```sh
git clone https://github.com/ciroautuori/r3f-rules.git ~/.codex/skills/r3f-rules
```
Then reference it by name `r3f-rules` from your agent.

### Using with Cursor
Add the `.cursorrules` file or copy `SKILL.md` instructions directly into your `Rules for AI` in Cursor settings to enforce the 13 rules automatically.

## The 13 Rules

| Rule | Description |
| ---- | ----------- |
| **Rule 1** | No `setState` or store update in `useFrame`. |
| **Rule 2** | No per-frame allocations (`new Vector3()`, ...). |
| **Rule 3** | No `metalness > 0` without an environment map. |
| **Rule 4** | No uncapped DPR. |
| **Rule 5** | No uncompressed GLB. |
| **Rule 6** | No `OrbitControls` in production. |
| **Rule 7** | No frame-count animations — only `delta`. |
| **Rule 8** | No CSS scroll + JS scroll mix. |
| **Rule 9** | No per-frame raycast over the whole scene. |
| **Rule 10** | No mount/unmount of heavy scenes in transitions. |
| **Rule 11** | No Three.js objects in persisted Zustand. |
| **Rule 12** | No autoplay audio. |
| **Rule 13** | No 3D where an image suffices. |

Full rules and rationale in `references/anti-patterns.md`.

## Contents

- `SKILL.md` — the skill entrypoint. Philosophy, SOTA stack (July 2026),
  6-step workflow, 13 hard rules.
- `references/` — load-on-demand deep dives:
  - `canvas-architecture.md` — CanvasShell, adaptive quality, lifecycle, fallback
  - `state-management.md` — the three-speed model, Zustand slices, store-scene bridge
  - `polish-chain.md` — physical lighting, HDRI/Lightformer, post chain, hero materials, motion
  - `quality-governance.md` — GPU budgets, renderer.info thresholds, 88/100 audit scorecard
  - `anti-patterns.md` — WRONG / WHY / CORRECT + symptom -> cause -> fix diagnostic table
  - `performance-diagnosis.md` — diagnostic flowchart, instancing/BatchedMesh decision tree
  - `model-optimization.md` — 5-stage GLB pipeline, Draco vs Meshopt, LOD chain
  - `physics-rapier.md` — Rapier decision tree, verified gotchas
  - `webgpu-tsl.md` — when to migrate, canonical setup, hard rules
  - `webgpu-tsl-api.md` *(vendor ref + errata)* — full TSL/NodeMaterial table
  - `postprocessing-passes-api.md` *(vendor ref + errata)* — 27+ vanilla pass signatures
  - `three-migration-r170-r183.md` *(vendor ref)* — r170 -> r183 breaking changes
  - `shaders.md` — GLSL building blocks + production `onBeforeCompile` appendix
  - `procedural-geometry.md` — code-only geometry
  - `blender-pipeline.md` — Blender MCP recipes + optimized GLB export
- `scripts/export_glb.py` — headless Blender -> Draco GLB exporter (+ `--meshopt` flag)
- `docs/SELF_HOSTED_CI.md` — one-VPS / many-repos CI design (Forgejo Actions or GitHub self-hosted runner), zero per-minute billing; portable workflow + runner scripts alongside
- `CREDITS.md` — full upstream attribution and errata for vendor reference files
- `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE` — repo health

## Audit scorecard (threshold: 88/100)

Before declaring a 3D experience done, every entry must have one line of
evidence. Below 88 you do not ship. Above 88 without per-entry evidence is just
as invalid. See `references/quality-governance.md` for the full table.

## Contributing

Contributions, corrections, and errata welcome. See
[CONTRIBUTING.md](./CONTRIBUTING.md). Attribution corrections are especially
welcome — see [CREDITS.md](./CREDITS.md).

## License

MIT © Ciro Autuori. Vendor reference files are preserved under their upstream
MIT licenses with attribution; see `CREDITS.md`.

---
⭐ Star this repo if it saved you a debug session
