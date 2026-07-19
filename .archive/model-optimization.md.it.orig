# Model optimization — pipeline GLB production

Il GLB è un artefatto compilato, non un sorgente. Pipeline a 5 stadi: **ASSESS → MESH → TEXTURE → COMPRESS → VALIDATE**. Regola zero: `gltf-transform inspect model.glb` SEMPRE prima di ottimizzare — non si ottimizza ciò che non si è misurato.

## Budget file

| Target | Peso | Triangoli | Texture |
|---|---|---|---|
| Hero asset | ≤ 1MB | ≤ 30k | 1024px |
| Mobile page budget | ≤ 2MB | ≤ 50k | 1024px |
| Desktop / configuratore | ≤ 5MB | ≤ 200k | 2048px |

## Ordine trasformazioni obbligatorio (gltf-transform)

`dedup → flatten → join → weld → simplify → texture (KTX2) → compress (Draco XOR Meshopt) → prune → quantize`

Invertire l'ordine = risultati peggiori o file rotti. Comando tipo:

```bash
gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress ktx2
# oppure pipeline manuale per controllo fine:
gltf-transform dedup in.glb - | gltf-transform flatten - - | gltf-transform join - - | \
gltf-transform weld - - | gltf-transform simplify --ratio 0.5 --error 0.001 - - | \
gltf-transform uastc - - | gltf-transform meshopt - out.glb
```

## Regole dure (tutte verificate, fonte impertio model-optimizer + emalorenzo)

1. **Draco XOR Meshopt, mai insieme** — KHR_draco e EXT_meshopt_compression sono mutualmente esclusivi, anche passando per gltfpack. Per il web: Meshopt decodifica più veloce (migliore per molti asset), Draco comprime di più (migliore per pochi asset grossi). Scegliere e documentare.
2. **ETC1S per color/ORM/emissive; UASTC SOLO per normal map.** ETC1S sulle normali = banding e faceted shading. UASTC ovunque su mobile = 8–16 byte/texel → OOM.
3. **Quantizzazione Draco bits**: position 14 (hero 16, props 11), normal 10 (12 hero, 8 props), UV 12.
4. **Simplify mai sotto il 10% dei triangoli** senza validazione visiva side-by-side.
5. **LOD chain**: ratio 1.0 / 0.5 / 0.25 / 0.10 con error tolerance crescente; −50% triangoli minimo tra livelli, altrimenti il LOD non serve.
6. **Mai Draco in export da Blender** (encoder datato): export GLB pulito (con `scripts/export_glb.py` o addon standard), compressione dopo con gltf-transform.
7. **Mai `join` su mesh con animazioni indipendenti** — rompe i binding.
8. **Decoder DRACO/KTX2 creati UNA volta**, riusati, poi `.dispose()` (WASM leak). Host in `/public/draco/` e `/public/basis/`, mai CDN in produzione.
9. **Mai sovrascrivere il file originale.** `assets/src/` (sorgente) → `public/models/` (artefatto).

## Export Blender (sintesi, dettagli in BLENDER_PIPELINE.md)

+Y up, apply modifiers, apply transforms; named materials (gltfjsx li usa); niente camera/luci nel GLB di produzione; animazioni: bake e nomi parlanti.

## Validazione (stadio 5, mai saltato)

`gltf-transform inspect out.glb`: draw call attesi, triangoli, texture count/size dentro budget. Apertura visiva in gltf.report o viewer drei: materiali corretti, normali sane, niente banding. Solo dopo → CDN/public.
