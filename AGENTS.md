# AGENTS.md — r3f-production

## Scope

This repository is a Codex CLI / Claude Code **skill** (Markdown rules + one Python helper script) for production-grade 3D web on React Three Fiber + Three.js + Zustand + Next.js.

## Working in this repo

- **English only.** No Italian (or other non-English) accent characters in any file under repo root (CI enforces this with a `grep` check on `SKILL.md README.md CONTRIBUTING.md CREDITS.md references/`). Original Italian sources live under `.archive/` and are the historical record — do not edit them.
- **Frontmatter `name` must equal the directory name**: `r3f-production`. Some skill loaders (opencode) refuse to register a skill when the two don't match.
- **Vendor reference files** under `references/` (`webgpu-tsl-api.md`, `postprocessing-passes-api.md`, `three-migration-r170-r183.md`) are preserved with attribution headers and July 2026 errata. If you change them, update `CREDITS.md`.
- **Three.js / R3F API surface moves fast.** When you cite a revision, state it (e.g. "since r181 `render()`/`compute()` are synchronous"). Do not assume defaults.
- SOTA date is 2026-07. Update the date string when you re-validate the stack.

## File layout

- `SKILL.md` — entrypoint, 6-step workflow, 13 hard rules.
- `references/*.md` — load-on-demand deep dives (canvas architecture, state, polish chain, quality governance, anti-patterns, performance, model optimization, physics, WebGPU/TSL, shaders, procedural geometry, Blender pipeline) + 3 vendor API refs.
- `scripts/export_glb.py` — headless Blender -> Draco GLB exporter (format: arrows are ASCII `->`, not `→`).
- `docs/SELF_HOSTED_CI.md` + `docs/scripts/` — self-hosted CI design (Forgejo Actions / GitHub self-hosted runner) + `portable-ci.yml`, `forgejo-runner-config.yaml`, `install-runner.sh`.
- `.github/` — CI workflow, issue/PR templates, dependabot, CODEOWNERS, FUNDING example.
- `promo/` — launch drafts (HN Show, Reddit r/threejs + r/reactthreefiber, Twitter thread, awesome-list PR). Use these only as starting points; never spam.
- `.archive/` — read-only Italian originals (historical record, do not modify).
- `PROMO.md` — growth & launch plan (the "why" behind `promo/`).

## Conventions

- Reference filenames are kebab-case English.
- Code samples: TypeScript / GLSL / Python / bash. Comments only explain a non-obvious decision.
- Rules / anti-patterns must come with: a code-review tell, why it is wrong, the fix. Ideally a real-world failure mode.
- The 88/100 audit scorecard in `references/quality-governance.md` is the ship gate. Below 88 you do not ship; above 88 without per-entry evidence is just as invalid.

## Committing

- One topic per commit. Do not commit `__pycache__/`, `.env`, or large binary assets.
- Do not edit `.archive/` originals.
- Update `CREDITS.md` whenever you touch a vendor reference file.

## CI (self-hosted or GitHub-hosted)

- `.github/workflows/ci.yml` runs `python3 -m py_compile scripts/export_glb.py` and the English-only accent grep.
- To run the same job on a self-hosted VPS (Forgejo Actions or GitHub self-hosted runner), copy `docs/scripts/portable-ci.yml` as the workflow and set `runs-on: [self-hosted, linux, x64, python]`. See `docs/SELF_HOSTED_CI.md`.
