# UrbanClarity 3D

Spatial intelligence platform for **Spain**. Maps four core urban metrics in 3D so citizens, journalists, and researchers can see how money, business, income, and rent shape cities.

**Current focus:** Santander (Cantabria) as the first municipality. The product and data model are national; Santander is a pilot, not the permanent geographic identity of the platform.

## Core metrics

| Metric                        | What it answers                                                   |
| ----------------------------- | ----------------------------------------------------------------- |
| **Public Spending**           | Where public money goes — contracts, awards, and procurement      |
| **Business Power**            | Where economic activity concentrates — firms and commercial nodes |
| **Salary & Household Income** | What households earn — census-tract income                        |
| **Rent Costs**                | What housing costs — official rent indices and market listings    |

## Geographic scope

- **Target:** all Spanish municipalities (INE municipal codes)
- **Pilot:** Santander (`39075`), with Cantabria regional supplements where useful
- Geography keys should stay generic: municipality → census tract (sección censal) → neighborhood → coordinates

## Data sources

Prefer **national** sources that scale to any municipality. Regional portals and city-specific listing URLs are supplements for the pilot.

### 1. Public Spending

- [PLACSP](https://contrataciondelestado.es) — national public procurement; [Atom syndication (CODICE)](https://contrataciondelestado.es/sindicacion/sindicacion_643/licitacionesPerfilesContratanteCompleto3.atom) (paginate via `rel="next"`). Filter by municipality / organism and autonomous community. Fields: tender title, awarded amount (€), awardee, execution location, awarding date.

### 2. Business Power

- [INE DIRCE](https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177031&menu=resultados&idp=1254735576550) — active businesses by municipality, size, and sector. API pattern: `https://servicios.ine.es/wsevents/api/json/es/DATASET/DIRCE/{municipalityCode}`
- Regional stats (pilot): [ICANE — directorio de empresas](https://www.icane.es/data/directorio-empresas-asalariados-estrato)
- OpenStreetMap Overpass (`https://overpass-api.de/api/interpreter`) — commercial nodes (`office`, `shop`, `amenity=bank`, `industrial`, `building=commercial`) around configurable neighborhood centroids

### 3. Salary & Household Income

- [INE ADRH](https://www.ine.es/componentes_inebase/ADRH_total_nacional.htm) — household income atlas. Catalog: [datos.gob.es](https://datos.gob.es/es/catalogo/ea0042823-atlas-de-distribucion-de-renta-de-los-hogares-adrh). API: `https://servicios.ine.es/wsevents/api/json/es/DATASET/ADRH`
- Granularity: sección censal, filtered by municipality code. Fields: renta neta media por persona / por hogar (€/year)

### 4. Rent Costs

- [Ministerio de Vivienda — índice estatal de alquiler](https://www.mivau.gob.es/vivienda/alquiler/sistema-estatal-de-indices-de-alquiler-de-vivienda) (calculator: [precio alquiler](https://www.mivau.gob.es/vivienda/calculadora-precio-alquiler)) — official €/m² by census tract / postal code (national)
- Market listings (pilot examples): Idealista / Fotocasa city listing pages — price/m² and neighborhood (respect ToS, rate limits, and legal constraints)

## Product goal

Ingest national (and optional regional) sources into a unified spatial model keyed by municipality, then expose them as a 3D map and analytics layer. New cities should mostly mean new geo filters and configs — not new product assumptions.

## Status

Early stage. Pilot: Santander. Stack and app architecture TBD.
