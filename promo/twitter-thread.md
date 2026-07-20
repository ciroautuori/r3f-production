# 7-tweet thread — one hard rule per tweet, hook + final ask.

1/ "It runs at 120fps on my M4" is not a metric. r3f-production is a skill that audits R3F scenes against real budgets — draw calls, triangles, DPR, an 88/100 ship gate. Ship-gate decisions, not vibes. https://github.com/ciroautuori/r3f-production

2/ Rule: no setState in useFrame. Calling setState at 60fps makes React re-render the whole tree — the render loop dies. Fix: refs + mutation + delta. Frame-rate independent. Identical at 30Hz and 144Hz.

3/ Rule: no `metalness > 0` without an environment map. Without env, PBR metallic surfaces return black — the textbook "black blob" bug. Fix: drei `<Environment>` always first. A 50-triangle icosaedron with HDRI beats a 200k model lit wrong.

4/ Rule: no frame-count animations. `rotation.y += 0.01` runs 2.4x faster at 144Hz than at 60Hz. Always use `delta`. Damping: `1 - Math.exp(-lambda * delta)`. Identical motion across refresh rates.

5/ Rule: no uncapped DPR. Retina 4x pixels = zero perceived gain, 4x fill cost. `dpr={[1, 1.5]}` baseline; 2 only on high tier. Verify at mid Android and integrated GPU laptops, not just your machine.

6/ Audit scorecard: an 88/100 ship gate with one line of evidence per entry. Below 88 you do not ship. Above 88 without per-entry evidence is just as invalid. A11y, motion, layout, depth, perf, dispose, post chain, responsiveness, brand — ten rows.

7/ Also included: three-speed state (Zustand refs for per-frame), polish chain in order, GLB pipeline (Draco XOR Meshopt), headless Blender exporter, self-hosted CI design (Forgejo/GitHub runner). MIT, English-only. Files welcome. https://github.com/ciroautuori/r3f-production
