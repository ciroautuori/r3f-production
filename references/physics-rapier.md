# Fisica — Rapier in produzione

Premessa onesta: un hero 3D quasi mai ha bisogno di fisica. Se serve (configuratore con drag fisico, scene playful, oggetti impilabili), la scelta production è **Rapier**.

## Decision tree motore

| | Rapier | cannon-es |
|---|---|---|
| Uso | production | prototyping |
| Corpi | 100 – 10.000+ | < 100 |
| Determinismo | sì | no |
| CCD | sì | no |
| Peso | ~300–600KB WASM, init async | ~100KB, init sync |

Regola: sempre Rapier in production; cannon-es solo per prototipi usa-e-getta.

## Setup @react-three/rapier

```tsx
<Physics timeStep="vary" interpolate updatePriority={-50}>
  <RigidBody colliders="cuboid">...</RigidBody>
</Physics>
```

`timeStep="vary"` segue il framerate (smooth); `"vary"` + `interpolate` evita judder. `updatePriority={-50}` = fisica prima del render (vedi priority rules in anti-patterns.md). Per determinismo: `timeStep={1/60}`.

## Gotcha verificati (tutti da review reale)

1. **Rapier ritorna plain `{x, y, z}`**: MAI `mesh.position.copy(body.translation())` — sempre `mesh.position.set(pos.x, pos.y, pos.z)`. (cannon-es invece è compatibile con `.copy()`, altra ragione per non mischiare i due mondi.)
2. **`colliders="trimesh"` SOLO per corpi statici.** Dinamici concavi → `convexHull`. Trimesh dinamico = instabile e lentissimo.
3. **`world.step()` senza argomenti in Rapier** (fixed interno 1/60); in cannon è `world.step(fixed, delta, maxSubSteps=3)`.
4. **CCD** per corpi veloci (proiettili, drag veloce): `.setCcdEnabled(true)` — altrimenti tunneling attraverso i collider.
5. **WASM non è GC-managed**: con rapier raw, SEMPRE `world.free()` e `eventQueue.free()` in cleanup. @react-three/rapier gestisce il cleanup della sua istanza, ma attenzione a istanze multiple / HMR.
6. Eventi collisione: `EventQueue` con `drainCollisionEvents` / `drainContactForceEvents` — drain ad ogni step, mai accumulare.
7. Sensori per trigger zone (no risposta fisica): `sensor` + `onIntersectionEnter`.
8. Character controller: kinematic body + `useRapier` world access; non reinventare con dynamic body + constraints.

## Integrazione col nostro stack

La fisica è una sorgente di stato fisico: vive dentro il Canvas, mai nello store Zustand. Se un evento fisico deve arrivare alla UI (punteggio, stato gioco), passa per i comandi semantici del bridge (`state-management.md`), throttle o su cambio, mai per frame. Corpi che escono dal mondo: cleanup con `RigidBody` removal, non lasciarli cadere all'infinito (simulano per sempre).
