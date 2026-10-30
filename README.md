# SILICON ATLAS

A buildless, browser-local desktop CPU/GPU catalogue and upgrade guide.

## Run locally

From this folder, run:

    python -m http.server 4173 --directory dist

Open http://localhost:4173. Serve over HTTP rather than opening index.html directly: JavaScript modules need an HTTP origin. No package installation or build command is required. Deploy the contents of `dist/` to any static host. Hash routes preserve browser history without server rewrites.

## Files

- `dist/app.js`: routes, filters, product dossiers, comparison selection and URL state.
- `dist/data.js`: 43 manufacturer-sourced records (RTX 50, RX 9000, Arc B580, Ryzen 9000, Core Ultra 200S / 200S Plus, plus RTX 40, RX 7000, Ryzen 7000, Core 14th Gen), glossary and source provenance.
- `dist/art.js`: procedural SVG floorplan illustrations generated from each record (SM/CU/Xe count, memory bus, CCD and P/E-core layout).
- `dist/fx.js`: motion layer — WebGL shader backdrop, cursor light, magnetic buttons, tilt cards, scroll reveals, count-ups, kinetic type, pinned lineup rail, video reveal.
- `dist/media/`: original procedurally rendered video loops (`die-flythrough.mp4`, `wafer.mp4`), their posters and the die texture.
- `dist/types.d.ts`: extensible product, benchmark/test-condition and compatibility types.
- `dist/rules.js`: transparent upgrade-checklist rules.
- `dist/scene.js`: original conceptual GPU model with spinning fans, cycling light bar, particles, pointer parallax and scroll-driven rotation/explosion.
- `dist/style.css`: responsive layouts and reduced-motion treatment.
- `dist/vendor/`: locally bundled Three.js 0.170.0 and MIT license.
- `README-data.md`: verification scope and data limitations.
- `qa/`: browser screenshots and functional verification results.

## Capabilities

Separate GPU/CPU explorers, combined filters and sorting, 20 product dossiers, up to three same-category comparison slots, difference filtering, search within selectors, shareable comparison URLs, local persistence, workload-specific unavailable states, upgrade checklists, source links and a touch/keyboard-accessible glossary.

The 3D assembly rotates and separates as the visitor scrolls; reverse scrolling reverses the scene and stopping holds its state. Rendering occurs only on changes, pauses offscreen/in background, caps pixel density at 1.6 and disposes resources when navigating away. Reduced-motion users receive a static assembly and expanded text.

## Deliberate data gaps

No fabricated FPS, benchmark rankings, prices, bottleneck scores or automatic compatibility guarantees. Benchmark and live price integrations remain unavailable. The catalogue covers the current desktop generations as of 30 October 2026 plus the previous one; it is not exhaustive. Licensed retail product photography is not included; product art is schematic floorplans generated from specifications, labelled as such. The videos are procedurally rendered illustrations (Python + ffmpeg), not footage of real silicon. Fonts (Archivo, JetBrains Mono) load from Google Fonts and fall back to Arial / Consolas offline. No external analytics, accounts or backend are needed.

## Maintenance

Add or update records in data.js following types.d.ts; preserve unique stable IDs and exact variant names. Verify each specification group against its linked official source and update its verification date. Keep missing values null. Add measured benchmarks only with source permission and complete test conditions; implement dataset rendering before exposing performance sorting. Record board-partner dimensions separately from reference data. Licensed photography can be added to each product record and rendered with descriptive alt text after permission is established.

## Local state

Comparison and build-form values remain in localStorage on the visitor's browser. Sharing a comparison URL shares only product IDs, not the entered build details. The application uses no live integrations and transmits no build form data.
