**Title:** Open-sourced an R3F production skill: 13 hard rules + an 88/100 audit scorecard

**Body:**

I work on R3F scenes that have to survive real devices (mid Android, integrated-GPU laptops, high-DPI desktops), and the gap between a demo and production is mostly about budget discipline. I wrote a skill (Codex CLI / Claude Code, MIT, English-only) that enforces the discipline inline:

- 13 hard rules (no `setState` in `useFrame`, no per-frame `new Vector3()`, no `metalness>0` without env, no uncapped DPR, no uncompressed GLB, no `OrbitControls` in prod, `delta` not frame-count, no CSS+JS scroll mix, no per-frame raycast over all meshes, no mount/unmount of heavy scenes in transitions, no Three.js objects in persisted Zustand, no autoplay audio, no 3D where an image suffices).
- The three-speed state model (business / UI / transient) using Zustand refs for the per-frame stuff.
- A polish chain ordered: HDRI → tone mapping → hero materials → post (pmndrs) → motion (Lenis + ScrollTrigger) → grain.
- A 5-stage GLB pipeline (assess → mesh → texture → compress → validate) with the gltf-transform order and Draco XOR Meshopt made explicit.
- The audit scorecard: 88/100 ship gate, one line of evidence per entry, below 88 you don't ship.
- Self-hosted CI design so the skill's own workflow runs on Forgejo Actions or GitHub self-hosted runner on one VPS.

Repo: https://github.com/ciroautuori/r3f-production

Install as a skill:

    git clone https://github.com/ciroautuori/r3f-production.git ~/.codex/skills/r3f-production

What's one thing you always check in review before shipping an R3F scene? I'll add the best criteria to `references/quality-governance.md`.
