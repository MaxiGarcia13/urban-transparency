---
name: ine-provinces
description: >-
  Resolve Spanish CCAA / regions to 2-digit INE province codes and coverage
  status for Urban Clarity. Use when mapping a region to --province flags,
  choosing scrape aliases, filtering by province, or asking which provinces
  belong to a comunidad autónoma.
---

# INE provinces

**Source of truth:** [`docs/geographic-coverage.md`](../../../docs/geographic-coverage.md) (CCAA → province codes + metric readiness + seed aliases). Do not invent a parallel list.

Municipalities: `packages/shared/cities/data/spain.json` (`id` starts with province). In code: `listMunicipalitiesByProvinceCodes` from `@urban-transparency/shared`.

- Codes are always **2-digit**, zero-padded (`01`, not `1`)
- Talk in region names; pass province codes to scrapers/APIs (`--province 39`)
- Scrapers: skill `scrape-ingest`
