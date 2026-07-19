# Canvas Architecture (R3F enterprise)

Il `<Canvas>` vive dietro un confine client-side, caricato lazy, con fallback 2D funzionale. La UI mission-critical (dati, form, CTA, navigazione) resta nel DOM.

## Struttura progetto

```
app/                      # route Next.js
features/
  product/                # UI business (DOM)
  dashboard/
three/
  CanvasShell.tsx         # configurazione Canvas e capability
  scenes/                 # una scena per route/use case
  components/             # mesh, modelli, luci
  systems/                # input, animazioni, quality policy
  assets/                 # GLB, KTX2, HDR
  telemetry/              # fps, draw call, GPU/error reporting
components/
  ThreeFallback.tsx       # equivalente HTML/SVG/statico
```

Una scena per route/use case, lifecycle esplicito, asset ownership chiara. Mai un Canvas globale che accumula modelli, texture ed event listener tra navigazioni.

## CanvasShell baseline

```tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useState } from 'react'

export function CanvasShell({ children }: { children: React.ReactNode }) {
  const [dpr, setDpr] = useState(1)

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      performance={{ min: 0.5, debounce: 250 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onIncline={() => setDpr(1.5)}
        onDecline={() => setDpr(1)}
        onFallback={() => setDpr(1)}
      />
      <QualityProvider dpr={dpr}>{children}</QualityProvider>
    </Canvas>
  )
}
```

`frameloop="demand"` evita render continui quando nulla si muove; per mutazioni imperative usa `invalidate()`. Eccezione: hero con animazione continua. In quel caso rendi solo mentre l'animazione è attiva, poi torna idle. Non sacrificare la UX per una pseudo-ottimizzazione.

## Lazy + fallback

```tsx
'use client'

import dynamic from 'next/dynamic'
import { ThreeFallback } from '@/components/ThreeFallback'

const HeroScene = dynamic(() => import('@/three/scenes/HeroScene'), {
  ssr: false,
  loading: () => <ThreeFallback />,
})

export function HeroSection() {
  // Fallback anche per: no WebGL, prefers-reduced-motion, save-data
  const reduced = usePrefersReducedMotion()
  if (reduced) return <ThreeFallback />
  return <HeroScene />
}
```

## Stato e animazioni: il loop corretto

React orchestra struttura e stati lenti. `useFrame` aggiorna riferimenti Three.js in modo imperativo, indipendente dal frame rate:

```tsx
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef } from 'react'

export function Orb({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  const target = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!ref.current) return
    target.current.set(active ? 0.35 : 0, 0, 0)
    // damping framerate-independent: identico a 30Hz e 144Hz
    ref.current.position.lerp(target.current, 1 - Math.exp(-8 * delta))
    ref.current.rotation.y += delta * 0.15
  })

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 3]} />
      <meshStandardMaterial color="#D87946" roughness={0.3} />
    </mesh>
  )
}
```

Mai `setState()` in `useFrame`, in intervalli veloci o in `pointermove`: genera render React inutili. Usa ref, store con accesso non reattivo, e `delta` per velocità consistenti a refresh rate diversi.

## Lifecycle e memoria

Memoria GPU e WebGL context sono risorse di produzione:

- Oggetti creati manualmente (render target, geometrie, materiali, texture, post-processing, loader custom) vanno rilasciati con `.dispose()`. R3F gestisce le risorse dichiarative, non quelle imperative.
- Non montare/smontare scene pesanti durante transizioni o step di wizard: mantienile montate, usa `visible`, pre-carica e riusa gli asset. Shader, materiali, luci e buffer richiedono compilazione.
- Non creare `Vector3`, `Color`, materiali, geometrie o array in `useFrame`: riusa con `useRef`, `useMemo` o module scope per non premere sul GC.
- Non abusare di `dispose={null}`: solo se hai stabilito che il modello è intenzionalmente condiviso e il lifecycle è gestito altrove.

## Rendering adattivo

QualityPolicy esplicita, non `if` sparsi nella scena:

```ts
type QualityTier = 'low' | 'medium' | 'high'

type QualitySettings = {
  dprMax: number
  shadows: boolean
  postprocessing: boolean
  textureLod: 'low' | 'mid' | 'high'
  particleCount: number
}

export const QUALITY: Record<QualityTier, QualitySettings> = {
  low:    { dprMax: 1,   shadows: false, postprocessing: false, textureLod: 'low',  particleCount: 0 },
  medium: { dprMax: 1.5, shadows: false, postprocessing: false, textureLod: 'mid',  particleCount: 200 },
  high:   { dprMax: 2,   shadows: true,  postprocessing: true,  textureLod: 'high', particleCount: 600 },
}
```

Durante interazione (drag, orbit, scroll) riduci temporaneamente DPR, ombre e post-processing: `useThree().performance.regress()`. Ma la chiamata da sola non cambia nulla: collega `performance.current` a decisioni di rendering reali.

## Asset pipeline (sintesi)

- glTF/GLB formato standard, ogni asset è un artefatto compilato, non un export "come viene".
- Mesh pulite, UV, materiali PBR standard; elimina nodi/animazioni/materiali/texture inutilizzati.
- Il collo di bottiglia è quasi sempre il numero di draw call, non i triangoli: riduci materiali e texture per modello.
- LOD: low per primo paint, mid per uso normale, high solo su hardware idoneo.
- Draco/Meshopt per geometrie, KTX2/Basis per texture. Pipeline: Blender -> `scripts/export_glb.py` -> gltf-transform -> validazione -> CDN.
- `useGLTF` + gltfjsx per grafi JSX riusabili; R3F cachea per URL, quindi modelli condivisibili nell'albero.
- `Suspense` annidato: prima fallback low quality, poi upgrade progressivo.
- Oggetti ripetuti: `InstancedMesh` (o drei `<Merged>`/`<Instances>`), migliaia di istanze in una draw call.
