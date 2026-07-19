# Polish chain — da scena corretta a esperienza award-level

L'ordine non è opinabile: **lighting/HDRI → tone mapping → materiali hero → post chain → motion → grain → audio**. Ogni passo assume quello prima. Saltare l'ordine produce il look "tech demo".

## 1. Illuminazione

Unità fisiche (three r160+, `useLegacyLights=false` di default): DirectionalLight in lux (sole 50.000–100.000), PointLight in candele (~1700 per una lampadina 100W, `power = intensity × 4π`), SpotLight ~10.000 cd (`power = intensity × π`), RectAreaLight in nits. Regola dura: **intensità fisiche richiedono tone mapping attivo**, altrimenti tutto brucia.

Budget luci: mobile 3–4 luci / 1 shadow caster; desktop 8–16 luci / 2–3 shadow. PointLight con shadow **mai su mobile**: i draw call ombra sono `oggetti × 6 × point light` (100 oggetti + 2 PointLight = 1200 shadow draw call). Anche con HDRI, tieni una DirectionalLight per la direzione dell'ombra.

Shadow tuning: `mapSize` 2048 (tier: 512 mobile → 4096 hero desktop), `bias: -0.0001`, `normalBias: 0.02`, `radius: 4` solo con PCFSoft. Prima leva di qualità: restringere il frustum ortografico della shadow camera al minimo necessario. Scena statica: `shadowMap.autoUpdate = false` e `shadowMap.needsUpdate = true` solo quando cambia qualcosa. Gotcha: `light.target` va aggiunto alla scena; `shadowMap.type` non è cambiabile dopo il primo render.

Ombre fake dove basta: drei `ContactShadows` (con `frames={Infinity}` **solo** se serve — altrimenti renderizza ogni frame a vuoto), `AccumulativeShadows` + `RandomizedLight` (`temporal frames={100}`) per look di studio.

## 2. IBL / HDRI

`scene.environment` è la singola modifica con più impatto: `<Environment preset="city">` di drei fa internamente PMREM. Per highlight di studio controllati: `<Lightformer>` dentro `<Environment>`. Controlli scena: `backgroundBlurriness` (0–1), `backgroundIntensity`, `backgroundRotation`. Regola non negoziabile: **`metalness > 0` senza envMap = blob nero**. Preferire HDRI compressi (KTX2/EXR half-float) ai `.hdr` RGBE. Vanilla sotto il cofano: `pmremGenerator.fromEquirectangular(tex).texture`, poi `tex.dispose()` e `pmremGenerator.dispose()`.

## 3. Tone mapping

Default R3F v9: `ACESFilmicToneMapping` + output sRGB — non toccarli. Alternative: AgX (r160+, highlight più puliti, look più moderno), Neutral (r162, fedeltà colore per UI/product). Regola strutturale: la post chain lavora in HDR, il tone mapping chiude. Con `@react-three/postprocessing`: lascia il renderer senza tone mapping (`flat` o default del composer) e metti `<ToneMapping>` come **ultimo** effetto.

## 4. Post chain (@react-three/postprocessing)

Esistono tre sistemi **incompatibili** — mai mischiarli (buffer format diversi): `EffectComposer` built-in di three, `postprocessing` di pmndrs (quello che usa `@react-three/postprocessing`), `PostProcessing` WebGPU/TSL. In R3F v9 la scelta production è pmndrs.

Setup canonico:

```tsx
<EffectComposer multisampling={4} frameBufferType={HalfFloatType}>
  <Bloom mipmapBlur intensity={0.45} luminanceThreshold={0.82} luminanceSmoothing={0.4} />
  <Vignette eskil={false} offset={0.3} darkness={0.6} />
  <Noise opacity={0.05} />
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
</EffectComposer>
```

`multisampling={4}` = MSAA nativo sul render target WebGL2 (meglio di FXAA/SMAA); `0` su mobile. `HalfFloatType` obbligatorio per bloom HDR corretto. Ordine pass: effetti geometrici (GTAO > SSAO) → Bloom → DoF → grading/LUT → AA/ToneMapping ultimi. Budget pass: mobile 2–3, desktop 4–6; risoluzione bloom 0.5×, SSAO 0.25–0.5×, DoF full.

Bloom selettivo: `<SelectiveBloom selection={ref}>` oppure emissive con `toneMapped={false}` per superare 1.0 e farsi raccogliere dal threshold. Parametri: intensity 0.5–2 (hero ~0.45), threshold 0.8–1, radius 0.4–1 (mipmapBlur fa il resto).

Path WebGPU/TSL (bloom, dof, ssr, ssgi, traa, lut3D): vedi `webgpu-tsl-api.md`. Signature complete dei pass vanilla: `postprocessing-passes-api.md`.

## 5. Materiali hero

`meshPhysicalMaterial` copre tutto il premium: vetro `transmission: 1, thickness: 0.5, ior: 1.5, roughness: 0` + `dispersion` (three ≥ r167, costa un pass extra); car paint `metalness: 0.9, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.1`; sheen per tessuti, iridescence per oil-slick. Alternative drei: `MeshTransmissionMaterial` (chromatic aberration, distortion, thickness — vetro economico e bello), `MeshReflectorMaterial` (blur, mixStrength, depthScale — pavimenti). Utility: `polygonOffset` contro z-fighting; `alphaTest` invece di `transparent` per foliage/decal (evita sort issues).

Disciplina color space (errore #1 in produzione): `map`/emissive in sRGB, normal/roughness/metalness/AO **mai** sRGB (NoColorSpace/Linear). Da r151 il secondo canale UV è `uv1` (non `uv2`), da r152 `texture.channel`. `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()` per pavimenti/strade.

## 6. Motion (DOM + 3D)

Stack: Lenis possiede lo scroll, ScrollTrigger legge da Lenis, `scroll-behavior: smooth` rimosso dal CSS. In Next.js: dynamic import `ssr: false` per Canvas/GSAP, gate `matchMedia('(prefers-reduced-motion: reduce)')` prima di avviare Lenis/GSAP/WebGL, cleanup completo su unmount (geometry/material/renderer dispose). Handler scroll/pointer scrivono solo variabili consumate da un loop (rAF/useFrame), mai lavoro nel handler.

Numeri, non gusti: stagger window 40–80ms per UI, 80–140ms per reveal hero/editoriali; **mai reveal importanti solo-opacity** — fade sempre accoppiato a translate/scale/mask/clip-path ("fade with movement"); easing lineare solo per spinner, marquee, progress; spring concreti: snappy `stiffness 300 / damping 20` (card, modal), fluid `stiffness 150 / damping 15 / mass 0.5` (hover, cursor), heavy `stiffness 100 / damping 30` (hero reveal).

Tre layer di motion, sempre: azione primaria (ciò che l'utente ha innescato), follow-through secondario (elementi che rincorrono), vita ambientale di background (drift, particelle lente). Nel 3D: damping `1 - Math.exp(-8 * delta)` (≈0.06–0.1 a 60fps), parallasse gerarchica (il foreground si muove più del background, la distanza di moto segue la gerarchia), camera scroll-driven via `ScrollControls` di drei o rig manuale. Custom cursor: opzionale, mai di default su corporate.

## 7. Type & palette (overlay DOM)

Il 3D premium muore con typography generica. Scala con contrasto estremo: 12 caption / 16 body / 24 h3 / 48 h2 / 80+ display. Font pairing distintivi per dominio (Syne, Outfit, Archivo, Sora, Bricolage Grotesque, Fraunces, Instrument Serif); veto su Inter come default; tracking a zero, polish affidato a peso/size/contrasto; variable font axes animabili su scroll. Radii agli estremi deliberati: 0, 8 o 9999px — mai mixare 4 e 12 a caso. Spacing su baseline 4/8px.

Palette: massimo 2 accent color per progetto, base monocromatica + un solo "pop" per gli interattivi, verifica algoritmica WCAG AA 4.5:1. Quattro tavole di partenza: Dark & Neon, Studio Monochrome, Nature Dark, High Contrast Warm. Glassmorphism (`backdrop-filter`) con parsimonia: l'abuso uccide l'effetto.

## 8. Audio (opzionale)

Howler.js, gate obbligatorio su gesto utente, ambient a -18/-24dB sotto il mix, mute persistente in localStorage, OFF di default su mobile. Mai autoplay.

## Self-audit polish (prima di "fatto")

Nessun `position: absolute` su testo in container ad altezza fissa (flexbox + `margin-top: auto`); card sovrapposte con z-index gestito e `opacity: 0` sulle inattive; padding ≥ 1rem nei panel; protezione di contrasto su sfondi colorati (text-shadow o background semi-opaco); `prefers-reduced-motion` testato; il look regge con DPR 1 e post chain ridotta (tier medium).
