# Quality governance — budget, telemetria, scorecard

La qualità non si dichiara, si misura. Ogni esperienza 3D dichiara i suoi budget prima di scrivere codice e li verifica in audit. Fonte dei numeri: 3d-tips (StudioCentOS), cloudai/impertio/emalorenzo mining, Nyx UI-Max scorecard.

## Budget GPU per use case

| Use case | Draw call | Triangoli | DPR max | Shadow |
|---|---|---|---|---|
| Hero / landing | < 100 | < 100k | 1.5 | 1 directional |
| Configuratore prodotto | < 250 | < 300k | 2 | 2 |
| Dashboard 3D | < 150 | < 150k | 1.5 | 0–1 |
| Mobile (tutto) | dimezza tutto | dimezza tutto | 1.5 | mai PointLight |

## Soglie di allarme (renderer.info)

| Metrica | Target | Warning | Critical |
|---|---|---|---|
| Draw call | < 100 | 100–500 | > 500 |
| Triangoli | < 1M | 1–3M | > 3M |
| Texture caricate | < 50 | 50–200 | > 200 |
| Shader programs | < 20 | 20–50 | > 50 |
| Frame time | < 16.6ms | 16.6–33ms | > 33ms |

`programs.length` = combinazioni materiali uniche: se esplode è shader-variant explosion (troppi materiali con define diverse). Se `memory.geometries` o `memory.textures` **crescono continuamente** durante l'uso = leak (dispose mancato). Soglie leak: textures > 100, geometries > 500 senza motivo.

## Core web vitals (budget di produzione)

Bundle JS per chunk 3D < 150KB gzip; modello hero < 500KB (mai > 2MB su mobile); texture < 1MB cad. in KTX2; FCP < 1.8s, LCP < 2.5s, TTI < 3s; Lighthouse Performance ≥ 85 desktop, ≥ 70 mobile. Lazy-mount del Canvas con IntersectionObserver (mai montare WebGL fuori viewport), caricamento progressivo low-res → high-res con dispose del low-res.

## Profili quality (device detection)

Detection: `navigator.hardwareConcurrency <= 4`, `navigator.deviceMemory < 4`, e GPU reale via `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL` — utile anche in telemetria). Mappa sui QUALITY tiers di `canvas-architecture.md`:

| Profilo | pixelRatio | Texture max | Shadow | Post |
|---|---|---|---|---|
| high | 2 | 2048 | on (2048) | full |
| medium | 1.5 | 1024 | on (1024) | ridotta (2–3 pass) |
| low | 1 | 512 | off | off |

In R3F non reinventare la ruota: `PerformanceMonitor` (regress/onDecline/onIncline → abbassa DPR/passer tier) e `AdaptiveDpr`/`AdaptiveEvents` di drei fanno già scaling adattivo con isteresi. Il nostro `QualityGovernor` (vedi `state-management.md`) li orchestra e persiste il tier scelto.

## Telemetria in produzione

`renderer.info` è il primo strumento: `render.calls`, `render.triangles`, `memory.geometries/textures`, `programs.length`. Dev: stats-gl (non stats.js), Spector.js per frame capture. Prod: campiona frame time e draw call una volta per sessione (dopo idle) e manda a un endpoint metriche insieme a GPU vendor/renderer e tier quality attivo. Debug locale GPU persa: `WEBGL_lose_context` extension.

## Context loss (obbligatorio su mobile)

```ts
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); /* pausa loop, UI fallback */ });
canvas.addEventListener('webglcontextrestored', () => { /* ricrea risorse GPU, invalida */ });
```

Senza `preventDefault()` il restore non arriva mai. Catena di degradazione: WebGPU → WebGL2 → fallback statico (immagine/DOM). Il fallback statico deve esistere **sempre**, non è un nice-to-have.

## Scorecard audit (soglia 88/100, evidenza 1 riga per voce)

Adattamento 3D dello UI-Max scorecard (Nyx-awwwards-ui). Prima di restituire codice "finito", compila ogni voce con una riga di evidenza:

| Voce | Punti | Criterio |
|---|---|---|
| A11Y-01 | 14 | `prefers-reduced-motion` gated, equivalente DOM per funzioni critiche, contrasto AA |
| MOTION-01 | 12 | easing/offset/delay coerenti (stagger 40–140ms, mai solo-opacity) |
| MOTION-02 | 10 | tre layer di motion (primaria, follow-through, ambientale) |
| LAYOUT-01 | 12 | composizione primo viewport intenzionale, no testo absolute in fixed-height |
| DEPTH-01 | 12 | ≥ 2 tecniche di profondità legate a scroll/pointer (parallasse gerarchica) |
| PERF-01 | 12 | budget tabella sopra rispettati, DPR cappato, zero allocazioni in useFrame |
| 3D-01 | 10 | dispose completo (12 slot texture), nessun leak counter in crescita |
| 3D-02 | 8 | post chain ordinata (GTAO→Bloom→grading→ToneMapping), HalfFloat |
| RESP-01 | 10 | testato 375 / 768 / 1440px |
| BRAND-01 | 8 | domain-fit: no "dark neon generico" fuori brand |

Sotto 88 non si consegna. Sopra 88 senza evidenza per voce nemmeno.
