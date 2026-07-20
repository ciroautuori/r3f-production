**Title:** r3f-production — a Codex/Claude skill that audits production R3F against an 88/100 scorecard

**Body:**

I open-sourced a skill for shipping production 3D web on React Three Fiber. It's not a library — it's a Markdown + code skill that an agent (Codex CLI, Claude Code) loads so the rules are applied *while you write the 3D code*, not afterwards.

The bit everyone skips in tutorials: **the audit**. The skill ships an 88/100 scorecard (10 entries, each needs one line of evidence). Below 88 you don't ship; above 88 without evidence per entry is just as invalid.

Also included:

- 13 hard rules (e.g. no `setState` in `useFrame`, no per-frame allocations, no `metalness>0` without envMap, no uncapped DPR, no uncompressed GLB, no `OrbitControls` in prod, `delta` not frame-count).
- The three-speed state model: business state → server/cache, UI state → Zustand, per-frame transient → refs. Never reactive state at 60fps.
- The polish chain in order: HDRI → tone mapping → hero materials → post → motion → grain. Skip the order, you get a tech-demo look.
- A headless Blender → Draco GLB exporter.
- Self-hosted CI design (Forgejo Actions or GitHub self-hosted runner) so it runs on one VPS with zero Actions minute billing for all your repos.

Install:

    git clone https://github.com/ciroautuori/r3f-production.git ~/.codex/skills/r3f-production

Repo: https://github.com/ciroautuori/r3f-production (MIT). `CREDITS.md` lists every upstream reference preserved and the July 2026 errata I applied.

If you've shipped an R3F experience to production, what's the one rule you wish you had written down before shipping? I'll fold the best ones into the anti-patterns file.
