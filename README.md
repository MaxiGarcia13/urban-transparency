# UrbanClarity

Spatial intelligence platform for **Spain**. Maps four core urban metrics in 3D so citizens, journalists, and researchers can see how money, business, income, and rent shape cities.

The product and data model are national. Region rows below track coverage; Cantabria, País Vasco, and Asturias are the first configured seeds — not the permanent geographic identity of the platform.

## Core metrics

| Metric                        | What it answers                                                   |
| ----------------------------- | ----------------------------------------------------------------- |
| **Public Spending**           | Where public money goes — contracts, awards, and procurement      |
| **Business Power**            | Where economic activity concentrates — firms and commercial nodes |
| **Salary & Household Income** | What households earn — census-tract income                        |
| **Rent Costs**                | What housing costs — official rent indices and market listings    |

## Geographic coverage

Target: all Spanish municipalities (INE municipal codes), filterable by province. Geography keys stay generic: province → municipality → census tract (sección censal) → neighborhood → coordinates.

Status: ✅ ready · 🚧 in progress · ❌ not started

| Region               | Provinces (INE)                                      | Public Spending | Business Power | Salary & Household Income |
| -------------------- | ---------------------------------------------------- | --------------- | -------------- | ------------------------- |
| Andalucía            | `04`, `11`, `14`, `18`, `21`, `23`, `29`, `41`       | ❌              | ❌             | ❌                        |
| Aragón               | `22`, `44`, `50`                                     | ❌              | ❌             | ❌                        |
| Asturias             | `33`                                                 | ✅              | 🚧             | ❌                        |
| Illes Balears        | `07`                                                 | ❌              | ❌             | ❌                        |
| Canarias             | `35`, `38`                                           | ❌              | ❌             | ❌                        |
| Cantabria            | `39`                                                 | ✅              | ✅             | ❌                        |
| Castilla-La Mancha   | `02`, `13`, `16`, `19`, `45`                         | ❌              | ❌             | ❌                        |
| Castilla y León      | `05`, `09`, `24`, `34`, `37`, `40`, `42`, `47`, `49` | ❌              | ❌             | ❌                        |
| Catalunya            | `08`, `17`, `25`, `43`                               | ❌              | ❌             | ❌                        |
| Comunitat Valenciana | `03`, `12`, `46`                                     | ❌              | ❌             | ❌                        |
| Extremadura          | `06`, `10`                                           | ❌              | ❌             | ❌                        |
| Galicia              | `15`, `27`, `32`, `36`                               | ❌              | ❌             | ❌                        |
| Madrid               | `28`                                                 | ❌              | ❌             | ❌                        |
| Murcia               | `30`                                                 | ❌              | ❌             | ❌                        |
| Navarra              | `31`                                                 | ❌              | ❌             | ❌                        |
| País Vasco           | `01`, `20`, `48`                                     | ✅              | 🚧             | ❌                        |
| La Rioja             | `26`                                                 | ❌              | ❌             | ❌                        |
| Ceuta                | `51`                                                 | ❌              | ❌             | ❌                        |
| Melilla              | `52`                                                 | ❌              | ❌             | ❌                        |

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

Ingest national (and optional regional) sources into a unified spatial model keyed by province and municipality, then expose them as a 3D map and analytics layer. New regions should mostly mean new geo filters and configs — not new product assumptions.
