# SILICON ATLAS

A buildless, browser-local desktop CPU/GPU catalogue and upgrade guide.

## Run locally

From this folder, run:

    python -m http.server 4173 --directory dist

Open http://localhost:4173. Serve over HTTP rather than opening index.html directly: JavaScript modules need an HTTP origin. No package installation or build command is required. Deploy the contents of `dist/` to any static host. Hash routes preserve browser history without server rewrites.

## Files

- `dist/app.js`: routes, filters, product dossiers, comparison selection and URL state.
- `dist/data.js`: 20 manufacturer-sourced records, glossary and source provenance.
- `dist/types.d.ts`: extensible product, benchmark/test-condition and compatibility types.
- `dist/rules.js`: transparent upgrade-checklist rules.
- `dist/scene.js`: original conceptual GPU model and scroll-driven rotation/explosion.
- `dist/style.css`: responsive layouts and reduced-motion treatment.
- `dist/vendor/`: locally bundled Three.js 0.170.0 and MIT license.
- `README-data.md`: verification scope and data limitations.
- `qa/`: browser screenshots and functional verification results.

## Capabilities

Separate GPU/CPU explorers, combined filters and sorting, 20 product dossiers, up to three same-category comparison slots, difference filtering, search within selectors, shareable comparison URLs, local persistence, workload-specific unavailable states, upgrade checklists, source links and a touch/keyboard-accessible glossary.

The 3D assembly rotates and separates as the visitor scrolls; reverse scrolling reverses the scene and stopping holds its state. Rendering occurs only on changes, pauses offscreen/in background, caps pixel density at 1.6 and disposes resources when navigating away. Reduced-motion users receive a static assembly and expanded text.

## Deliberate data gaps

No fabricated FPS, benchmark rankings, prices, bottleneck scores or automatic compatibility guarantees. Benchmark and live price integrations remain unavailable. The catalogue covers selected established generations, not every latest product. Licensed retail product photography is not included; catalogue drawings are labeled category illustrations. The cinematic asset is real-time conceptual 3D, not generated video or a model-accurate teardown. No external analytics, accounts or backend are needed.

## Maintenance

Add or update records in data.js following types.d.ts; preserve unique stable IDs and exact variant names. Verify each specification group against its linked official source and update its verification date. Keep missing values null. Add measured benchmarks only with source permission and complete test conditions; implement dataset rendering before exposing performance sorting. Record board-partner dimensions separately from reference data. Licensed photography can be added to each product record and rendered with descriptive alt text after permission is established.

## Local state

Comparison and build-form values remain in localStorage on the visitor's browser. Sharing a comparison URL shares only product IDs, not the entered build details. The application uses no live integrations and transmits no build form data.
