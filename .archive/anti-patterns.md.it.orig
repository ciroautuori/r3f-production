# Anti-patterns — WRONG / WHY / CORRECT

Formato: ogni voce ha il codice-review tell (come lo riconosci in review), perché è sbagliato, e la correzione. Merged da: 3d-tips, 3d-zustand, awwwards-3d hard rules, impertio errors/R3F/drei/physics, emalorenzo rules, nice-wolf ECS (citato negativamente).

## Loop e stato React

**`setState` o store update dentro `useFrame`** — WHY: re-render React a 60fps, il loop muore. CORRECT: ref + mutation + `delta`; intenti nel bridge store (vedi state-management.md).

**Allocazioni per frame** (`new Vector3()`, `new Color()`, array, oggetti nel loop) — WHY: GC pause = jank. CORRECT: oggetti riusati via ref/useMemo/module scope.

**Animazioni basate su frame-count** (`rotation.y += 0.01`) — WHY: a 144Hz va 2.4× più veloce che a 60Hz. CORRECT: sempre `delta` time; damping `1 - Math.exp(-lambda * delta)`.

**Polling da mondo esterno con `setInterval` + `setState`** (pattern ECS nice-wolf: `setInterval(updateEntities, 100)` / `setState` a 16ms) — WHY: re-render per frame, l'opposto del transient pattern. CORRECT: `useFrame` + subscribe imperativo; se serve ECS vero, non è un hero 3D (dominio sbagliato).

**`useFrame(cb, priority > 0)` senza sapere che disattiva il render automatico** — WHY: schermo nero se nessun subscriber chiama `gl.render`. CORRECT: priority solo per ordinare (physics −100, camera follow +100), l'ultimo renderizza.

**Mutazioni in `frameloop="demand"` senza `invalidate()`** — WHY: non appaiono mai a schermo. CORRECT: `invalidate()` dopo ogni mutazione, o subscription con `useFrame(cb, active ? 0 : null)` per pausa/resume.

## Struttura R3F

**`args` che cambiano identity** (`args={[new ...]}` inline) — WHY: ricrea l'oggetto three ad ogni render. CORRECT: args stabili, o props su oggetto esistente.

**Mount/unmount di scene pesanti in transizione** — WHY: ricompila shader, ricarica asset. CORRECT: `visible` + riuso asset, `dispose={null}` se gestito altrove.

**Raycast su tutta la scena per frame** — WHY: O(n) su mesh complesse. CORRECT: array piccolo di interagibili, `raycast={() => null}` per escludere, drei `Bvh`/`meshBounds`, proxy collision mesh invisibili.

**OrbitControls in produzione** — WHY: look da demo. CORRECT: camera scroll-driven o rig. In dev: sempre `makeDefault` sui controls (senza, gli eventi R3F si rompono).

**TransformControls senza disabilitare OrbitControls durante il drag** — WHY: drag impossibile. CORRECT: drei lo fa se entrambi `makeDefault`.

**ContactShadows con `frames={Infinity}` di default** — WHY: renderizza ogni frame a vuoto. CORRECT: frames={1} o Infinity solo se la scena si muove davvero.

## Post-processing e color pipeline

**`GammaCorrectionShader` come pass finale** — WHY: con `outputColorSpace = SRGBColorSpace` (r152+) è doppia gamma → colori slavati. CORRECT: `OutputPass` (r154+), o `<ToneMapping>` ultimo in pmndrs.

**AA prima degli effetti** — WHY: antialiasa aloni di bloom. CORRECT: MSAA del composer (`multisampling`) o SMAA **dopo** gli effetti.

**`renderer.render()` + `composer.render()` insieme** — WHY: doppio render per frame. CORRECT: solo composer.

**Bloom senza tone mapping / senza HalfFloatType** — WHY: HDR clampato, bloom invisibile o blown-out. CORRECT: `frameBufferType={HalfFloatType}`, ToneMapping ultimo.

**`composer.setSize` dimenticato nel resize** — WHY: blur/post sbagliati dopo resize. CORRECT: R3F lo gestisce; vanilla → resize handler che aggiorna composer + uniform FXAA + bloom resolution.

**Composer mai disposed** — WHY: leak di render target. CORRECT: dispose in cleanup.

**`logarithmicDepthBuffer` con post-processing** — WHY: incompatibile con depth-based pass (SSAO/DoF). CORRECT: near/far ratio stretto.

## Materiali e texture

**`metalness > 0` senza environment map** — WHY: blob neri. CORRECT: `<Environment>` sempre prima dei materiali metallici.

**sRGB su normal/roughness/metalness/AO map** — WHY: shading rotto. CORRECT: sRGB solo su albedo/emissive.

**`geometry.setAttribute('uv2', ...)`** — WHY: morto da r151. CORRECT: `uv1`, o `texture.channel = 1` (r152+).

**`material.needsUpdate = true` ogni frame** — WHY: ricompilazione shader continua. CORRECT: solo quando cambia un define; per uniform dinamiche `onBeforeCompile` + `userData.shader.uniforms`.

**`transparent` dove basta `alphaTest`** — WHY: sort issues, halo. CORRECT: `alphaTest: 0.5` per cutout.

**Importare `ContactShadows` da three/examples** — WHY: non esiste, è un componente drei. Errore visto in skill pubbliche: non propagarlo.

## Performance e asset

**1000 mesh singole invece di instancing/batching** — WHY: draw call explosion. CORRECT: > 100 copie sempre InstancedMesh; > 10k con spatial subdivision o `BatchedMesh` (r159+); frustum culling su InstancedMesh opera sulla bounding sphere dell'intero gruppo → splittare per area.

**GLB non compressi / Draco e Meshopt insieme** — WHY: peso ×5–10; KHR_draco e EXT_meshopt sono mutualmente esclusivi (anche via gltfpack). CORRECT: uno solo; pipeline in `model-optimization.md`.

**DPR uncapped** — WHY: 4× pixel su retina per zero guadagno percepito. CORRECT: `dpr={[1, 1.5]}`, 2 solo tier high.

**Shadow su PointLight su mobile** — WHY: costo ×6 per luce. CORRECT: fake contact shadow con gradient plane.

**`shadowMap.type` cambiato dopo il primo render** — WHY: non ha effetto / crash. CORRECT: deciso a monte.

**Oggetti three.js nel persist di Zustand** — WHY: serializzazione impossibile, stato zombie. CORRECT: `partialize` solo preferenze (quality tier, muted, riduzione motion).

## Fisica (Rapier)

**`mesh.position.copy(body.translation())`** — WHY: Rapier ritorna plain `{x,y,z}`, `.copy()` fallisce silenziosamente o perde precisione. CORRECT: `.set(pos.x, pos.y, pos.z)` (o `useRapier` hooks).

**`colliders="trimesh"` su corpi dinamici** — WHY: instabile e lentissimo. CORRECT: trimesh solo statici; dinamici concavi → `convexHull`.

**WASM mai liberato** (raw rapier) — WHY: WASM non è GC-managed = leak certo. CORRECT: `world.free()` e `eventQueue.free()` in cleanup.

## Diagnostica rendering: sintomo → causa → fix

| Sintomo | Causa probabile | Fix |
|---|---|---|
| Schermo nero | envMap mancante su metal; camera dentro near plane; composer+renderer doppio render | Environment; near 0.1; solo composer |
| Colori slavati/sbiaditi | doppia gamma; tone mapping mancante con luci fisiche | OutputPass; ToneMapping ultimo |
| Z-fighting | piani coplanari | `polygonOffset`, offset 0.001, near/far stretto |
| Trasparenza ordinata male | `transparent` su cutout | `alphaTest`; `depthWrite: false` consapevole |
| Banding sulle normal map | ETC1S su normali | UASTC solo per normal map |
| Bloom invisibile | threshold > emissive, o LDR buffer | HalfFloat, `toneMapped={false}` su emissive |
| FPS crolla dopo minuti | leak: counters in crescita | audit dispose (12 slot texture) |
| Shader nero dopo refactor | cache programma con `onBeforeCompile` | `material.customProgramCacheKey` |
