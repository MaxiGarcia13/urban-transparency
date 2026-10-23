# Geographic coverage

**Source of truth** for Spanish CCAA → INE province codes and metric readiness. Do not duplicate this table in `README.md`, skills, or other docs — link here instead.

Target: all Spanish municipalities (INE municipal codes), filterable by province. Geography keys stay generic: province → municipality → census tract (sección censal) → neighborhood → coordinates.

Status: ✅ ready · 🚧 in progress · ❌ not started

| Region               | Provinces (INE)                                      | Public Spending | Business Power | Salary & Household Income |
| -------------------- | ---------------------------------------------------- | --------------- | -------------- | ------------------------- |
| Andalucía            | `04`, `11`, `14`, `18`, `21`, `23`, `29`, `41`       | ❌              | ❌             | ❌                        |
| Aragón               | `22`, `44`, `50`                                     | ❌              | ❌             | ❌                        |
| Asturias             | `33`                                                 | ✅              | ✅             | ❌                        |
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
| País Vasco           | `01`, `20`, `48`                                     | ✅              | ✅             | ❌                        |
| La Rioja             | `26`                                                 | ❌              | ❌             | ❌                        |
| Ceuta                | `51`                                                 | ❌              | ❌             | ❌                        |
| Melilla              | `52`                                                 | ❌              | ❌             | ❌                        |

## Configured seeds

Scrape / boundary aliases (not the product identity):

| Alias        | Region     | Provinces (INE)  |
| ------------ | ---------- | ---------------- |
| `cantabria`  | Cantabria  | `39`             |
| `pais-vasco` | País Vasco | `01`, `20`, `48` |
| `asturias`   | Asturias   | `33`             |

## Municipalities

Municipality list: `packages/shared/cities/data/spain.json` (`id` starts with the 2-digit province code). In code: `listMunicipalitiesByProvinceCodes` from `@urban-transparency/shared`.

Province codes are always **2-digit**, zero-padded (`01`, not `1`).
