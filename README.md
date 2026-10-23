# Urban Clarity

Spatial intelligence platform for **Spain**. Four urban metrics on a 3D map so citizens, journalists, and researchers can see how money, business, income, and rent shape cities.

## Core metrics

| Metric                        | What it answers                                                   |
| ----------------------------- | ----------------------------------------------------------------- |
| **Public Spending**           | Where public money goes — contracts, awards, and procurement      |
| **Business Power**            | Where economic activity concentrates — firms and commercial nodes |
| **Salary & Household Income** | What households earn — census-tract income                        |
| **Rent Costs**                | What housing costs — official rent indices and market listings    |

## Geographic coverage

Target: all Spanish municipalities (INE municipal codes), filterable by province. Geography keys stay generic: province → municipality → census tract (sección censal) → neighborhood → coordinates.

CCAA → INE province codes, metric readiness, and seed aliases: [`docs/geographic-coverage.md`](./docs/geographic-coverage.md).

## Data sources

Prefer **national** sources that scale to any municipality or province. Regional portals and city-specific listing URLs are supplements for the pilot.

### 1. Public Spending

- [PLACSP](https://contrataciondelestado.es) — national public procurement; [Atom syndication (CODICE)](https://contrataciondelestado.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3.atom) (paginate via `rel="next"`). Pilot ingest filters by province (`39` Cantabria; `01`/`20`/`48` País Vasco; `33` Asturias via `pnpm scrape:placsp:cantabria` / `pnpm scrape:placsp:pais-vasco` / `pnpm scrape:placsp:asturias`). Fields: tender title, awarded amount (€), awardee, execution location, awarding date.

### 2. Business Power

- [INE DIRCE](https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177031&menu=resultados&idp=1254735576550) — active businesses by municipality and sector group. Ingest: table [4721 CSV](https://www.ine.es/jaxiT3/files/t/csv_bdsc/4721.csv) via `pnpm scrape:dirce:cantabria` / `pnpm scrape:dirce:pais-vasco` / `pnpm scrape:dirce:asturias`.
- Regional stats (pilot): [ICANE — directorio de empresas](https://www.icane.es/data/directorio-empresas-asalariados-estrato)
- OpenStreetMap Overpass (`https://overpass-api.de/api/interpreter`) — commercial nodes (`office`, `shop`, `amenity=bank`, `industrial`, `building=commercial`) around configurable neighborhood centroids

### 3. Salary & Household Income

- [INE ADRH](https://www.ine.es/componentes_inebase/ADRH_total_nacional.htm) — household income atlas. Catalog: [datos.gob.es](https://datos.gob.es/es/catalogo/ea0042823-atlas-de-distribucion-de-renta-de-los-hogares-adrh). API: `https://servicios.ine.es/wsevents/api/json/es/DATASET/ADRH`
- Granularity: sección censal, filtered by municipality code. Fields: renta neta media por persona / por hogar (€/year)

### 4. Rent Costs

- [Ministerio de Vivienda — índice estatal de alquiler](https://www.mivau.gob.es/vivienda/alquiler/sistema-estatal-de-indices-de-alquiler-de-vivienda) (calculator: [precio alquiler](https://www.mivau.gob.es/vivienda/calculadora-precio-alquiler)) — official €/m² by census tract / postal code (national)
- Market listings (pilot examples): Idealista / Fotocasa city listing pages — price/m² and neighborhood (respect ToS, rate limits, and legal constraints)

## Product goal

Give Spain a national, spatial view of public spending, business activity, household income, and rent — not a Cantabria-only product with region forks.

Ingest national (and optional regional) open data into one model keyed by province and municipality, then expose it as a 3D map and analytics layer. New regions should mostly mean new geo filters and configs; metric readiness lives in [`docs/geographic-coverage.md`](./docs/geographic-coverage.md).

## Contributing

Setup, package layout, commands, and coding rules: [`CONTRIBUTING.md`](./CONTRIBUTING.md).
