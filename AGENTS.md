# Agent guide — UrbanClarity

This repository builds **UrbanClarity**: a spatial intelligence platform for **Spain** covering four metrics — Public Spending, Business Power, Salary & Household Income, and Rent Costs.

**Pilot municipality:** Santander (INE `39075`, Cantabria). Build for Spain; use Santander only as the first configured city. Do not hardcode Santander (or Cantabria) into core models, APIs, or product copy as if they were the whole platform.

Act as a **Lead Data Engineer and Web Scraping Specialist**. Prefer official national open-data APIs and feeds over brittle HTML scrapes. When scraping aggregators is required, be defensive: stable selectors, polite rate limits, clear provenance, and no secrets in the repo.

## Non-negotiables

1. **Scope**: Spain-wide product; Santander is the pilot seed. Parameterize by INE municipality code (and region when needed).
2. **No city lock-in**: config and filters may mention Santander; shared code, schemas, and pipelines must not.
3. **Sources of truth**: prefer national endpoints listed below; treat regional portals as optional supplements. Do not invent alternate primary sources without documenting why.
4. **Provenance**: every ingested record should retain source system, fetch timestamp, and geographic key (municipality, census tract, neighborhood, or coordinates).
5. **Stack**: not fixed yet — do not invent a full architecture unless asked; keep scrapers/ingestion modular and source-oriented.
6. **Legal / ethics**: respect robots.txt, terms of use, and personal-data minimization. Prefer official indices over scraping personal listing pages when both exist.

## Metric playbooks

National sources first. Pilot filters shown in italics where relevant.

### 1. Public Spending

| Source               | URL                                                                                                        | Role                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- |
| PLACSP portal        | https://contrataciondelestado.es                                                                           | Official national procurement |
| PLACSP Atom (CODICE) | https://contrataciondelestado.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3.atom | National syndication feed     |

**Filters**: by municipality / organism and autonomous community (_pilot: Ayuntamiento de Santander / Cantabria_).

**Extract**: tender title, awarded amount (€), awardee company, execution location, awarding date.

### 2. Business Power

| Source                 | URL                                                                                                                   | Role                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| INE DIRCE              | https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177031&menu=resultados&idp=1254735576550 | National enterprise directory stats                    |
| INE DIRCE API          | `https://servicios.ine.es/wsevents/api/json/es/DATASET/DIRCE/{municipalityCode}`                                      | JSON by municipality (_pilot: `39075`_)                |
| Regional stats (pilot) | https://www.icane.es/data/directorio-empresas-asalariados-estrato                                                     | Optional regional supplement                           |
| Overpass               | https://overpass-api.de/api/interpreter                                                                               | OSM commercial nodes (POST); centroids are city config |

**Extract (DIRCE)**: active businesses per municipality by size and economic sector.

**OSM tags**: `office`, `shop`, `amenity=bank`, `industrial`, `building=commercial`.

**Neighborhood centroids**: city-specific config (not core). Pilot example — Santander:

- Santander Centro — 43.4623, -3.8099
- El Sardinero — 43.4711, -3.7847
- General Dávila — 43.4680, -3.8150
- Alisal / Cazoña — 43.4580, -3.8400
- Peñacastillo — 43.4470, -3.8550

### 3. Salary & Household Income

| Source               | URL                                                                                           | Role                  |
| -------------------- | --------------------------------------------------------------------------------------------- | --------------------- |
| ADRH home            | https://www.ine.es/componentes_inebase/ADRH_total_nacional.htm                                | Atlas docs (national) |
| datos.gob.es catalog | https://datos.gob.es/es/catalogo/ea0042823-atlas-de-distribucion-de-renta-de-los-hogares-adrh | Catalog entry         |
| ADRH API             | https://servicios.ine.es/wsevents/api/json/es/DATASET/ADRH                                    | JSON API              |

**Granularity**: sección censal filtered by municipality code (_pilot: `39075`_).

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
2. Normalize geography early with generic keys: municipality → census tract → neighborhood → lat/lon.
3. Keep municipality (and region) as parameters or config; one ingestion path per _source type_, not per city.
4. Log failures per source without blocking the whole pipeline.
5. Do not expand scope beyond these four metrics unless the user asks.
6. When adding a second city, it should be mostly new geo config — not a fork of Santander-specific logic.

## Repo naming note

Package / folder may appear as `urban-transparency`; product name is **UrbanClarity**. Use UrbanClarity in user-facing copy (see `packages/web/src/config/product.ts`). Do not brand the product as “Santander-only.”
