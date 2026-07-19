# WebGPU + TSL — percorso strategico

WebGPU non è il default: è l'upgrade path quando WebGL2 diventa il collo di bottiglia. Regola della roadmap: **prima WebGL solido (tutto il resto di questa skill), poi WebGPU con fallback funzionante**.

## Quando migrare (criteri concreti)

- Oltre ~50.000 particelle o simulazioni compute (flocking, fluidi, cloth)
- Scene draw-call-heavy dove il CPU overhead WebGL domina
- Post-processing pesante (SSGI, SSR, TAA di qualità) a risoluzione piena
- Gain atteso: 2–10× su workload compute; poco o nullo su scene semplici

Se nessun criterio è soddisfatto: resta su WebGL2, il costo di complessità non si ripaga.

## Supporto browser (luglio 2026, matrice corretta)

Chrome/Edge 113+; Firefox 141+ (Windows) / 145+ (macOS ARM); Safari 26+ (da settembre 2025). Copertura sufficiente per adozione **con fallback**, mai senza. `forceWebGL: true` per testare il percorso di fallback in CI.

## Setup canonico

```ts
import * as THREE from 'three/webgpu';
import { WebGPU } from 'three/webgpu';

if (!WebGPU.isAvailable()) { /* fallback WebGLRenderer */ }
const renderer = new THREE.WebGPURenderer({ canvas, antialias: true, forceWebGL: false });
await renderer.init();
```

In R3F v9:

```tsx
<Canvas gl={async (props) => { const r = new WebGPURenderer(props); await r.init(); return r; }}>
```

## Hard rules

1. **Mai GLSL/ShaderMaterial con WebGPU**: solo TSL / NodeMaterial. GLSL su WebGPU non compila.
2. **Mai EffectComposer**: post-processing via classe `PostProcessing` + nodi TSL (`pass(scene, camera)` entry, `renderOutput()` nodo finale).
3. **Import TSL sempre da `three/tsl`** (`compute`, `storage`, `If`, `uniform`, nodi) — non da `three/webgpu`.
4. **Mai `if` JS minuscolo in TSL**: sempre `If(cond, ...)`. Il JS è compile-time, TSL è il grafo GPU.
5. **`setAnimationLoop`, mai rAF manuale** (in R3F: gestito dal Canvas).
6. Da three **r181** `render()`/`compute()` sono sincroni; `renderAsync`/`computeAsync` deprecati. Prima di r181: `await computeAsync()` prima di ogni render dipendente.

## TSL essenziale

NodeMaterial inputs: `colorNode`, `positionNode`, `normalNode`, `emissiveNode`, `castShadowNode`, `dispersionNode`, `transmissionNode`, `anisotropyNode`... Type system chainable, `uniform().onFrameUpdate(fn)`, `toVar/toConst/varying/vertexStage`, `hash/range` per random deterministico, atomics e workgroup barrier per compute (`instancedArray`, `storageTexture`, `workgroupArray` — shared memory 10–100× più veloce). Tabella completa dei metodi e dei nodi: `webgpu-tsl-api.md`.

Post-processing TSL (firme): `bloom(node, strength, radius, threshold)`, `dof(node, viewZ, focusDistance, focalLength, bokehScale)`, `ssr`, `ssgi`, `traa`, `lut3D` — 25 effetti totali, vedi `webgpu-tsl-api.md` e emalorenzo `tsl-post-processing` (in `sources/`).

## Migrazione incrementale

Non riscrivere: una scena per volta, dietro feature flag. Renderer scelto a runtime (WebGPU → WebGL2 fallback), materiali TSL scritti in modo da degradare a NodeMaterial WebGL2 dove possibile. Breaking changes r170→r183 (PCFSoftShadowMap deprecato su WebGLRenderer in r182 → PCFShadowMap; `colorBufferType` → `outputBufferType` su WebGPU; TSL `PI2` → `TWO_PI`; PBR indirect specular r181 più luminoso → ridurre shadow bias in r183): checklist completa in `three-migration-r170-r183.md`.
