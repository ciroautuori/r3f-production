---
name: r3f-production
description: Build production-grade 3D web experiences with React Three Fiber, Three.js, Zustand and Next.js, enterprise standard. Progressive enhancement, GPU budgets, DOM-first accessible UX, cinematic polish (ACES, HDRI, bloom, grain). Usa quando l'utente chiede una scena 3D, hero WebGL, configuratore prodotto 3D, scroll-driven 3D, sito "Awwwards-style" ma production, R3F, useFrame, drei, quality tier adattivo, ottimizzazione draw call, GLB/Draco/KTX2, o menziona Three.js in un progetto React/Next.js. Also triggers on "3D landing", "WebGL hero", "interactive product showcase", "scroll storytelling", "cinematic web experience". NON usare per: dashboard CRUD senza 3D, siti statici senza WebGL, landing dove un'immagine basta (3D decorativo = conversione persa), deliverable single-file HTML vanilla.
license: MIT
---

# R3F Production: 3D web enterprise-grade

Due anime, un solo standard: la disciplina enterprise (3d-tips, 3d-zustand) e il craft cinematografico della scuola Awwwards (Active Theory, Lusion, 14islands). Il 3D è un **runtime GPU con budget di prestazioni**, non una libreria per animazioni decorative. La regola chiave: **3D progressivo, osservabile, accessibile, sempre sostituibile da un fallback 2D**.

## Filosofia (leggere prima del codice)

1. **Il DOM vince.** Dati, form, CTA, navigazione, tabelle: tutto nel DOM. Il `<Canvas>` è isolato, client-only, lazy. Una homepage interamente WebGL impoverisce SEO, accessibilità, conversione e mantenibilità.
2. **Aesthetics > Geometry.** Un icosaedro con HDRI, ACESFilmic e bloom batte un modello da 200k triangoli illuminato male. Budget su lighting e post-processing prima, geometria dopo.
3. **Lerp everything.** Nessun valore cambia istantaneamente: camera, rotazioni, hover, progress. Damping framerate-independent: `factor = 1 - Math.exp(-lambda * delta)`.
4. **Budget GPU espliciti.** Ogni esperienza dichiara draw call, triangoli, texture, DPR max. Enforced in QA, non lasciati al caso.
5. **Stato a 3 velocità.** Business state nel server/cache, UI state in Zustand, transient per-frame nei ref. Mai stato reattivo a 60 FPS.
6. **Accessibilità non negoziabile.** `prefers-reduced-motion` rispettato, ogni funzione critica ha equivalente DOM, il canvas si mette in pausa fuori viewport.

## Stack SOTA July 2026

```
Next.js App Router + TypeScript (strict)
@react-three/fiber v9 + @react-three/drei + three (pin in package.json, mai CDN)
zustand (UI state) + TanStack Query (server state). MAI Redux.
@react-three/postprocessing (EffectComposer, Bloom, Vignette, Noise)
gltf-transform / gltfjsx / Draco / KTX2-Basis (asset pipeline)
GSAP + ScrollTrigger + Lenis: SOLO per scroll choreography (motion DOM: framer-motion)
WebGPU renderer + TSL: strategic watch, adottare solo con fallback WebGL solido
```

Note di versione: R3F v9 applica di default `ACESFilmicToneMapping` e output sRGB. Non toccarli: è il look "non-WebGL" gratis. `dispersion` su `MeshPhysicalMaterial` richiede three >= r167. Pin esatti nel `package.json` del progetto, mai upgrade silenziosi.

## Workflow in 6 step (saltare uno step = output da tech demo)

### Step 1: Archetipo esperienza

Ogni 3D site production rientra in uno di questi. Sceglierne uno e commettere:

| Archetipo | Pattern | Uso enterprise |
|---|---|---|
| Object showcase | Hero object, camera orbita/zoom su scroll | Product page, configuratore |
| Room walkthrough | Camera path su spline in interno | Real estate, hospitality |
| Vertical descent | Scroll = discesa tra layer | Case study, storytelling |
| Flyover | Camera traversa landscape | Yacht/travel experience |
| Particle field | Points reattivi a scroll/mouse | Hero atmosferica, brand |

Se l'utente non l'ha detto, chiedere quale archetipo. Non inventarne di nuovi.

### Step 2: Architettura Canvas

Leggere `references/canvas-architecture.md`: CanvasShell con DPR adattivo, `frameloop="demand"` per scene passive, lazy loading, fallback 2D, lifecycle e dispose, struttura directory `three/` separata da `features/`.

### Step 3: Asset pipeline

GLB come artefatto compilato: Blender -> `scripts/export_glb.py` (Draco) -> gltf-transform (KTX2) -> validazione -> CDN. LOD low/mid/high, `useGLTF` + gltfjsx per grafi JSX, `Suspense` annidato per caricamento progressivo. Dettagli in `references/BLENDER_PIPELINE.md` e `references/PROCEDURAL_GEOMETRY.md` (code-only geometry: default prima di generatori AI).

### Step 4: Polish chain (in questo ordine)

Leggere `references/polish-chain.md`. L'ordine conta:

1. HDRI come `scene.environment` (`<Environment>` di drei)
2. Lighting: una DirectionalLight per direzione ombra anche con HDRI
3. Post-processing: `@react-three/postprocessing` (Bloom -> Vignette -> Noise/grain ultimo)
4. Materiali hero: `meshPhysicalMaterial` con transmission + dispersion per vetro
5. Scroll timeline: GSAP ScrollTrigger + Lenis, Lenis possiede lo scroll
6. Custom cursor (opzionale, signature premium)
7. Film grain come layer composito finale, intensità ~0.05

### Step 5: Stato

Leggere `references/state-management.md`: modello a 3 velocità, slice per bounded context, selettori stretti con `useShallow`, bridge store-scena (lo store contiene intenti/target, Three.js possiede lo stato fisico), store vanilla per segnali rapidi, comandi semantici nominati.

### Step 6: Audit

Leggere `references/quality-governance.md`. Prima di dichiarare fatto:

- Lighthouse Performance >= 85 desktop, >= 70 mobile; FCP < 1.8s, LCP < 2.5s
- 60fps desktop, 30fps floor su Android medio; DPR cappato
- Budget draw call/triangoli rispettato (tabella in quality-governance)
- GLB Draco-compressi, texture KTX2 dove possibile
- Zero allocazioni in `useFrame`, zero `setState` nel loop
- `prefers-reduced-motion` testato, fallback 2D verificato
- Test reale: mobile Safari, Android Chrome medio, laptop GPU integrata, desktop high-DPI

## Hard Rules: mai fare queste cose

Long form in `references/anti-patterns.md`.

1. **Niente `setState` o store update in `useFrame`.** Ref + mutation + `delta`.
2. **Niente allocazioni per frame** (`new Vector3()`, array, materiali nel loop). Riusare via ref/useMemo/module scope.
3. **Niente `metalness > 0` senza environment map.** Risultato: blob neri.
4. **Niente DPR uncapped.** `dpr={[1, 1.5]}` baseline, 2 solo tier high.
5. **Niente GLB non compressi.** Draco o Meshopt obbligatori.
6. **Niente OrbitControls in produzione.** Camera scroll-driven o rig driven.
7. **Niente animazioni frame-count.** Solo `delta` time; a 144Hz e 30Hz il moto deve essere identico.
8. **Niente mix CSS scroll + JS scroll.** Lenis possiede lo scroll, ScrollTrigger legge da Lenis, `scroll-behavior: smooth` rimosso.
9. **Niente raycast su tutta la scena per frame.** Array piccolo di mesh interagibili.
10. **Niente mount/unmount di scene pesanti in transizione.** `visible` + riuso asset.
11. **Niente oggetti Three.js nel persist Zustand.** Persisti solo preferenze ripristinabili.
12. **Niente audio autoplay.** Gate su gesto utente, mute persistente, OFF default mobile.
13. **Niente 3D dove un'immagine basta.** Il 3D decorativo su funnel B2B costa conversione e non aggiunge fiducia.

## Reference files (caricare on demand, non tutti insieme)

Core (scritti per questa skill, standard enterprise):
- `references/canvas-architecture.md`: CanvasShell, quality adattivo, lifecycle, fallback, struttura progetto
- `references/state-management.md`: modello 3 velocità, slice Zustand, bridge scena, runtime store
- `references/polish-chain.md`: lighting fisico, HDRI/Lightformer, ACES/AgX/Neutral, post chain pmndrs, materiali hero, motion (Lenis+ScrollTrigger, spring, stagger), type/palette, audio
- `references/quality-governance.md`: budget GPU, soglie renderer.info, core web vitals, profili quality, telemetria, context loss, scorecard audit 88/100
- `references/anti-patterns.md`: WRONG/WHY/CORRECT merged + tabella diagnostica rendering sintomo→causa→fix
- `references/performance-diagnosis.md`: flowchart diagnostico, decision tree instancing/BatchedMesh, leve in ordine costo/beneficio, raycasting
- `references/model-optimization.md`: pipeline GLB 5 stadi, ordine gltf-transform, Draco XOR Meshopt, ETC1S/UASTC, LOD chain, budget file
- `references/physics-rapier.md`: decision tree motori, setup @react-three/rapier, gotcha sync/WASM/trimesh
- `references/webgpu-tsl.md`: quando migrare, browser matrix luglio 2026, setup R3F, hard rules TSL

Asset e shader (da awwwards-3d, MIT):
- `references/PROCEDURAL_GEOMETRY.md`: geometria code-only (primitives, displacement, math shapes)
- `references/SHADERS.md`: building block GLSL + appendice onBeforeCompile production (cache key, dissolve edge glow)
- `references/BLENDER_PIPELINE.md`: ricette Blender + export GLB ottimizzato
- `scripts/export_glb.py`: export headless Blender -> GLB Draco (+ flag `--meshopt`)

Vendor (copiati con attribuzione + errata header, API reference):
- `references/webgpu-tsl-api.md`: tabella completa nodi TSL/NodeMaterial (impertio, errata: import da three/tsl, r181 sync)
- `references/postprocessing-passes-api.md`: signature 27+ pass vanilla (impertio, nota: OutputPass mai GammaCorrectionShader)
- `references/three-migration-r170-r183.md`: breaking changes r170→r183 (emalorenzo)

## Quando sei bloccato

- Materiale piatto o nero: HDRI mancante. Step 4, punto 1.
- Performance pessima: taglia pass di post-processing prima della geometria. quality-governance.md.
- Scroll janky: Lenis non wired a ScrollTrigger. polish-chain.md.
- Re-render continui: stato nel posto sbagliato. state-management.md, tabella 3 velocità.
- "Funziona ma non sembra premium": hai saltato Step 4. Torna indietro e applica in ordine.
