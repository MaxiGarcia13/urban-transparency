# Agent guide — Urban Clarity

This repository builds **Urban Clarity**: a spatial intelligence platform for **Spain** covering four metrics — Public Spending, Business Power, Salary & Household Income, and Rent Costs.

**Configured seeds:** Cantabria, País Vasco, and Asturias (coverage and INE province codes: `docs/geographic-coverage.md`). Build for Spain; do not hardcode these into core models, APIs, or product copy as if they were the whole platform.

Act as a **Lead Data Engineer and Web Scraping Specialist**. Prefer official national open-data APIs and feeds over brittle HTML scrapes. When scraping aggregators is required, be defensive: stable selectors, polite rate limits, clear provenance, and no secrets in the repo.

## Non-negotiables

1. **Scope**: Spain-wide product; Cantabria, País Vasco, and Asturias are the first configured seeds. Parameterize by INE province and municipality codes (and region when needed).
2. **No region lock-in**: config and filters may mention specific CCAA; shared code, schemas, and pipelines must not.
3. **Sources of truth**: prefer national endpoints listed below; treat regional portals as optional supplements. Do not invent alternate primary sources without documenting why.
4. **Provenance**: every ingested record should retain source system, fetch timestamp, and geographic key (province, municipality, census tract, neighborhood, or coordinates).
5. **Stack**: pnpm monorepo — Astro + Vue + MapLibre/deck.gl (`packages/web`), PLACSP scraper (`packages/scrapper`), Turso (`packages/database`), shared domain types (`packages/shared`). Extend this layout; do not invent a parallel architecture.
6. **Legal / ethics**: respect robots.txt, terms of use, and personal-data minimization. Prefer official indices over scraping personal listing pages when both exist.

## Metric playbooks

National sources first. PLACSP/DIRCE ingest is scheduled via GitHub Actions; prefer root `pnpm scrape:*` aliases when running locally.

### 1. Public Spending

| Source               | URL                                                                                                        | Role                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| PLACSP portal        | https://contrataciondelestado.es                                                                           | Official national procurement |
| PLACSP Atom (CODICE) | https://contrataciondelestado.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3.atom | National syndication feed     |

**Filters**: by province / municipality / organism and autonomous community (configured seeds: see `docs/geographic-coverage.md`).

**Extract**: tender title, awarded amount (€), awardee company, execution location, awarding date.

### 2. Business Power

| Source                 | URL                                                                                                                   | Role                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| INE DIRCE              | https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177031&menu=resultados&idp=1254735576550 | National enterprise directory stats                        |
| INE DIRCE table 4721   | https://www.ine.es/jaxiT3/files/t/csv_bdsc/4721.csv                                                                   | CSV by municipality + CNAE group (filter via `--province`) |
| Regional stats (pilot) | https://www.icane.es/data/directorio-empresas-asalariados-estrato                                                     | Optional regional supplement                               |
| Overpass               | https://overpass-api.de/api/interpreter                                                                               | OSM commercial nodes (POST); centroids are city config     |

**Extract (DIRCE)**: active businesses per municipality by economic sector group (table 4721).

**OSM tags**: `office`, `shop`, `amenity=bank`, `industrial`, `building=commercial`.

**Neighborhood centroids**: city-specific config (not core) — add per municipality when this metric is implemented.

### 3. Salary & Household Income

| Source               | URL                                                                                           | Role                  |
| -------------------- | --------------------------------------------------------------------------------------------- | --------------------- |
| ADRH home            | https://www.ine.es/componentes_inebase/ADRH_total_nacional.htm                                | Atlas docs (national) |
| datos.gob.es catalog | https://datos.gob.es/es/catalogo/ea0042823-atlas-de-distribucion-de-renta-de-los-hogares-adrh | Catalog entry         |
| ADRH API             | https://servicios.ine.es/wsevents/api/json/es/DATASET/ADRH                                    | JSON API              |

**Granularity**: sección censal filtered by municipality code (_pilot: Cantabria municipalities_).

**Extract**: `Renta neta media por persona` (€/year), `Renta neta media por hogar` (€/year).

### 4. Rent Costs

| Source              | URL                                                                                           | Role                                                    |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| MIVAU calculator    | https://www.mivau.gob.es/vivienda/calculadora-precio-alquiler                                 | UX entry                                                |
| State rent index    | https://www.mivau.gob.es/vivienda/alquiler/sistema-estatal-de-indices-de-alquiler-de-vivienda | Official €/m² by tract/postal code (national)           |
| Listing aggregators | Idealista / Fotocasa city listing URLs                                                        | Market listings (secondary); URL pattern is city config |

**Official extract**: declared tax-index rental prices per m² by census tract / postal code.

**Listing scrapes** (only if needed): price per m² + neighborhood; use browser automation or HTTP with realistic headers; rotate proxies only when operationally required; never commit proxy credentials. Pilot listing URLs are examples, not product constants.

## Implementation priorities for agents

1. Prefer national APIs / open-data downloads (INE, MIVAU, PLACSP) before regional portals or page scrapes.
2. Normalize geography early with generic keys: province → municipality → census tract → neighborhood → lat/lon.
3. Keep province and municipality as parameters or config; one ingestion path per _source type_, not per region.
4. Log failures per source without blocking the whole pipeline.
5. Do not expand scope beyond these four metrics unless the user asks.
6. When adding a second region, it should be mostly new geo config — not a fork of Cantabria-specific logic.

## Repo naming note

Package / folder may appear as `urban-transparency`; product name is **Urban Clarity** (see `packages/web/src/config/product.ts`). Use that name in user-facing copy. Do not brand the product as “Cantabria-only.”
