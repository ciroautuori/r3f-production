# State Management: il modello a 3 velocità

Zustand coordina UI e scena. Non deve diventare il canale che aggiorna mesh a 60 FPS.

| Classe | Esempi | Dove vive | Frequenza |
|---|---|---|---|
| Business state | Configurazione prodotto, permessi, workflow, dati API, selezione salvabile | Store dominio / server cache (TanStack Query) | Event-driven |
| UI state | Modale aperta, pannello attivo, oggetto selezionato, camera preset | Zustand | Bassa/media |
| Transient 3D state | Rotazioni, lerp, hover pointer, tempo, particelle, camera smoothing | `useRef`, `useFrame`, oggetti Three.js | Ogni frame |

## Store per dominio (slice pattern)

Niente `useAppStore` gigantesco: slice per bounded context, middleware applicati dove le slice si combinano.

```ts
// src/features/scene/store/types.ts
export type QualityTier = 'low' | 'medium' | 'high'
export type CameraPreset = 'overview' | 'detail' | 'presentation'

export type SceneSlice = {
  selectedNodeId: string | null
  hoveredNodeId: string | null
  cameraPreset: CameraPreset
  qualityTier: QualityTier
  setSelectedNode: (id: string | null) => void
  setHoveredNode: (id: string | null) => void
  setCameraPreset: (preset: CameraPreset) => void
  setQualityTier: (tier: QualityTier) => void
}

export type UiSlice = {
  activePanel: 'overview' | 'details' | 'settings'
  inspectorOpen: boolean
  setActivePanel: (panel: UiSlice['activePanel']) => void
  setInspectorOpen: (open: boolean) => void
}

export type AppStore = SceneSlice & UiSlice
```

```ts
// src/features/scene/store/app-store.ts
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { StateCreator } from 'zustand'
import type { AppStore, SceneSlice, UiSlice } from './types'

const createSceneSlice: StateCreator<AppStore, [], [], SceneSlice> = (set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,
  cameraPreset: 'overview',
  qualityTier: 'medium',
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }, false, 'scene/select'),
  setHoveredNode: (hoveredNodeId) => set({ hoveredNodeId }, false, 'scene/hover'),
  setCameraPreset: (cameraPreset) => set({ cameraPreset }, false, 'scene/cameraPreset'),
  setQualityTier: (qualityTier) => set({ qualityTier }, false, 'scene/qualityTier'),
})

const createUiSlice: StateCreator<AppStore, [], [], UiSlice> = (set) => ({
  activePanel: 'overview',
  inspectorOpen: false,
  setActivePanel: (activePanel) => set({ activePanel }, false, 'ui/setActivePanel'),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }, false, 'ui/setInspectorOpen'),
})

export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (...a) => ({ ...createSceneSlice(...a), ...createUiSlice(...a) }),
        {
          name: 'studio-3d',
          partialize: (state) => ({
            cameraPreset: state.cameraPreset,
            activePanel: state.activePanel,
            qualityTier: state.qualityTier,
          }),
        },
      ),
    ),
    { name: 'Studio 3D' },
  ),
)
```

`persist` solo per preferenze ripristinabili: mai modelli Three.js, token, dati sensibili o valori transitori.

## Selettori stretti

```tsx
// Bene: re-render solo se cambia il nodo selezionato
const selectedNodeId = useAppStore((s) => s.selectedNodeId)

// Bene: azione, riferimento stabile
const setSelectedNode = useAppStore((s) => s.setSelectedNode)

// Vietato: iscrizione a tutto lo store
const store = useAppStore()
```

Per campi multipli, `useShallow` mantiene riferimento stabile:

```tsx
import { useShallow } from 'zustand/react/shallow'

const { selectedNodeId, cameraPreset } = useAppStore(
  useShallow((s) => ({
    selectedNodeId: s.selectedNodeId,
    cameraPreset: s.cameraPreset,
  })),
)
```

## Bridge store-scena

La scena legge il target dallo store, interpola localmente, non scrive mai nello store a ogni frame:

```tsx
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../store/app-store'

const CAMERA_POSITIONS = {
  overview: new THREE.Vector3(0, 2, 8),
  detail: new THREE.Vector3(2, 1, 3),
  presentation: new THREE.Vector3(0, 0.5, 5),
}

export function SceneCamera() {
  const preset = useAppStore((s) => s.cameraPreset)
  const target = useRef(new THREE.Vector3())

  useFrame(({ camera }, delta) => {
    target.current.copy(CAMERA_POSITIONS[preset])
    camera.position.lerp(target.current, 1 - Math.exp(-5 * delta))
    camera.lookAt(0, 0, 0)
  })

  return null
}
```

Lo store cambia solo al cambio di preset; il moto avviene nel runtime R3F. È la forma corretta di collegare stato React a animazione continua.

## Accesso imperativo

Per input ad alta frequenza (drag, controls, WebSocket, telemetry, scroll): API vanilla senza iscrivere React.

```ts
// Fuori da React o in callback ad alta frequenza
useAppStore.getState().setSelectedNode(nodeId)

// Reagire a un solo campo con subscribeWithSelector
const unsubscribe = useAppStore.subscribe(
  (state) => state.qualityTier,
  (tier, previousTier) => {
    if (tier !== previousTier) rendererPolicy.apply(tier)
  },
)
// Su teardown della feature/route: unsubscribe()
```

Non usare questa tecnica per muovere 5.000 oggetti a frame: per quello c'è instancing.

## Store transient separato

Per segnali rapidi condivisi tra hook, store vanilla non persistito, zero re-render React:

```ts
import { createStore } from 'zustand/vanilla'

type RuntimeState = {
  pointerNdc: { x: number; y: number }
  isInteracting: boolean
  setPointerNdc: (x: number, y: number) => void
  setInteracting: (value: boolean) => void
}

export const runtimeStore = createStore<RuntimeState>((set) => ({
  pointerNdc: { x: 0, y: 0 },
  isInteracting: false,
  setPointerNdc: (x, y) => set({ pointerNdc: { x, y } }),
  setInteracting: (isInteracting) => set({ isInteracting }),
}))
```

```tsx
useFrame(() => {
  const { pointerNdc, isInteracting } = runtimeStore.getState()
  // aggiorna oggetti Three.js senza render React
})
```

## Comandi, non mutazioni sparse

Azioni semantiche che centralizzano regole e side effect, invece di `set()` da dieci componenti:

```ts
const createSceneSlice: StateCreator<AppStore, [], [], SceneSlice & SceneCommands> = (set) => ({
  // ...state base
  selectNode: (nodeId) =>
    set(
      { selectedNodeId: nodeId, hoveredNodeId: null, cameraPreset: 'detail' },
      false,
      'scene/selectNode',
    ),
  clearSelection: () =>
    set({ selectedNodeId: null, cameraPreset: 'overview' }, false, 'scene/clearSelection'),
  enterPresentationMode: () =>
    set(
      { selectedNodeId: null, hoveredNodeId: null, cameraPreset: 'presentation' },
      false,
      'scene/enterPresentationMode',
    ),
})
```

Transizioni tracciabili in DevTools, stati impossibili prevenuti (es. pannello dettaglio aperto senza nodo selezionato), test facili.

## Persistenza e URL: la persistenza è un contratto

| Tipo | Destinazione | Esempi |
|---|---|---|
| Stato condivisibile | URL/search params | ID configurazione, nodo selezionato, vista |
| Preferenze personali | persist Zustand | Quality tier manuale, pannello aperto, camera preset |
| Stato autorevole | Backend | Progetto, permessi, workflow, audit log |
| Stato transiente | Ref / runtime store | Hover, drag, velocità, interpolazione |

Mai in `localStorage`: permessi, ruoli, token, configurazioni contrattuali. Mai duplicare cache API in Zustand: server state a TanStack Query.

## QualityGovernor

```tsx
export function QualityGovernor() {
  const setQualityTier = useAppStore((s) => s.setQualityTier)
  return (
    <PerformanceMonitor
      onDecline={() => setQualityTier('low')}
      onIncline={() => setQualityTier('high')}
      onFallback={() => setQualityTier('low')}
    />
  )
}
```

La scena seleziona il tier e modifica davvero ciò che costa GPU (DPR, ombre, LOD, particelle, post-processing), non memorizza una label.

## Regole operative

- Una sorgente di verità per dato: la selection non sta contemporaneamente in component state, Zustand e URL senza protocollo di sync.
- Lo store contiene intenti e target: `cameraPreset = "detail"`, non `camera.position.x` a frame.
- Three.js possiede lo stato fisico istantaneo: posizione interpolata, quaternion, velocity, mixer time, buffer, raycast result.
- Il backend possiede l'autorità: ruoli, configurazioni salvate, audit trail.
- Azioni idempotenti e nominate: essenziali per debug, analytics, replay.
- Unsubscribe obbligatorio nel teardown: ogni subscription imperativa, listener WS, observer di route.
- Devtools solo in sviluppo: isola middleware e logging dal bundle di produzione.
