---
name: scrape-ingest
description: >-
  Run Urban Clarity data ingest scrapers (PLACSP public contracts, DIRCE municipal
  business stats, ADRH municipal income) via root pnpm aliases. Use when the user
  asks to scrape, ingest, backfill, or refresh PLACSP/DIRCE/ADRH data for a region,
  or when adding a new province/region scrape alias.
---

# Scrape / ingest

How to run scrapers. Sources/fields: `AGENTS.md`. Province codes: skill `ine-provinces`.

## Prerequisites

- Monorepo root; `pnpm install` done
- Root `.env` with `TURSO_URL` and `TURSO_AUTH_TOKEN` (scripts use `--env-file=../../.env`)
- Do not print or commit secrets

## Commands

| Goal | Command |
| ---- | ------- |
| PLACSP incremental (10 pages) | `pnpm scrape:placsp:<region>` |
| PLACSP backfill (50 pages) | `pnpm --filter=@urban-transparency/scrapper scrape:placsp:<region>:backfill` |
| DIRCE (table 4721) | `pnpm scrape:dirce:<region>` |
| ADRH (renta media mun + provincia) | `pnpm scrape:adrh:<region>` |

`<region>`: `cantabria` · `pais-vasco` · `asturias`

Prefer these aliases. For ad-hoc flags, read `packages/scrapper/scripts/scrape-placsp.ts` / `scrape-dirce.ts` / `scrape-adrh.ts` and pass args after `--`. Keep PLACSP `--delay-ms` polite (aliases use `1500`). ADRH also upserts province aggregates (2-digit INE codes) from table 53689.

On success, report the upsert / summary line. On failure, stop — do not hammer PLACSP/INE.

Scheduled GHA (quarterly): `scrape-adrh-*.yml` mirrors DIRCE. New CCAA: add aliases in `packages/scrapper/package.json` + root `package.json` + coverage in `docs/geographic-coverage.md`; for ADRH province labels extend `packages/scrapper/config/ine-province-labels.ts`. Do not hardcode regions into shared domain.
