# Performance diagnosis — dal sintomo alla causa

Primo strumento, sempre: `renderer.info` (`render.calls`, `render.triangles`, `memory.geometries/textures`, `programs.length`). Non ottimizzare prima di aver letto questi numeri. Soglie target/warning/critical: `quality-governance.md`.

## Flowchart diagnostico

```
FPS bassi?
├─ draw calls > 200? ──sì──► CPU-bound su submit: instancing/merge/BatchedMesh, meno materiali unici
│
├─ triangles > 2M? ──sì────► GPU vertex-bound: LOD, simplify, frustum culling per area
│
├─ programs.length alto? ──► shader-variant explosion: unifica materiali, meno define dinamiche
│
├─ frame time ok ma jank? ─► GC pause: allocazioni in useFrame, setState nel loop
│
├─ memory counters crescono? ► leak: dispose mancato (geometry, material, 12 slot texture, render target)
│
└─ heap JS cresce? ────────► leak lato JS: listener non rimossi, cache senza eviction, ref circolari
```

GPU-bound vs CPU-bound: riduci DPR a 0.5 → se FPS non migliora è CPU/draw-call-bound; se migliora è GPU/fill-bound (post-processing, overdraw, texture).

## Decision tree geometrie ripetute

- Poche copie (< 100), stessa mesh: `MergedGeometry` (BufferGeometryUtils) se statiche, altrimenti mesh separate
- > 100 copie: sempre `InstancedMesh` (o drei `<Merged>`/`<Instances>`)
- > 10.000 istanze o materiali diversi per istanza: `BatchedMesh` (r159+)
- Frustum culling su InstancedMesh opera sulla **bounding sphere dell'intero gruppo**: splittare per area/zona, altrimenti il culling non scatta mai

## Leve in ordine di costo/beneficio

1. Taglia pass di post-processing (costo zero, beneficio immediato) — bloom 0.5× res, SSAO off su mobile
2. Abbassa DPR (PerformanceMonitor / AdaptiveDpr)
3. Shadow: mapSize giù, caster meno, `autoUpdate=false` su scene statiche
4. LOD + frustum culling per area
5. Instancing/batching/merge
6. Texture: KTX2, dimensioni giù, anisotropy selettiva
7. Solo alla fine: riscrivere geometria

## Raycasting

three-mesh-bvh (~100× su mesh complesse), throttling hover a ~50ms (20fps bastano), filtro via `layers`, GPU picking con `readRenderTargetPixels` per selezione massiva, Octree per capsule collision. In R3F: drei `Bvh` component, `raycast={() => null}` per escludere i decorativi.

## Regola d'oro

Ottimizza per il dispositivo peggiore del tier dichiarato (Android medio per mobile, GPU integrata per desktop). "Sul mio M4 va a 120fps" non è una metrica.
