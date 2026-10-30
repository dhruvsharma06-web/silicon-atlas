# SILICON ATLAS data

The catalogue contains 10 desktop GPUs and 10 desktop CPUs. It intentionally covers established GeForce RTX 40, Radeon RX 7000, Ryzen 7000 and Intel Core 14th Gen products; it does not claim to cover the latest generation or all available products.

Manufacturer pages were inspected on 30 October 2026. Each record has an official source URL, a verification date and grouped provenance. AMD and Intel records use individual product pages; NVIDIA records use the official comparison table. Values refer to manufacturer reference configurations unless stated otherwise. Board-partner dimensions, connectors and power limits require a separate exact-variant record.

The exported `products` array is presentation-independent. `types.d.ts` documents product, variant, source, benchmark conditions and compatibility contracts. GPU `memory` is VRAM in GB; CPU `memory` is null, not zero. `power` is watts under the accompanying vendor-specific `powerLabel`; it is not a common cross-vendor measurement. `psu` is manufacturer system guidance for GPUs, not a measured draw. `length` is reference length in millimetres and `slots` is reference thickness. Unavailable values remain null. CPU `cache` describes L3; detailed L2 is in `specs`.

No benchmark dataset is shipped. `benchmarkRuns` and record `benchmarks` are empty. Do not infer performance from specifications or add demo results to production. To add measurements, obtain redistribution permission, preserve full test conditions, and only compare runs from equivalent conditions. Average FPS and percentile lows need separate metrics. For a derived relative difference, use `(candidate - baseline) / baseline * 100` only on comparable values with a nonzero baseline and identify higher/lower-is-better.

No price dataset or retailer integration is shipped. Product photography is null because permission for redistribution has not been established. A conceptual illustration must never be represented as the actual retail product.

To extend: verify an exact desktop variant against its manufacturer's page; add its record with a stable unique ID and date; include source provenance; preserve units and missing data; update relevant filters; inspect compatibility guidance and comparisons. Recheck firmware requirements and current support documentation before publishing purchase guidance. Socket matching alone does not establish motherboard compatibility. PSU recommendations depend on the manufacturer's assumed test system and must not be treated as a universal guarantee.
