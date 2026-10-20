## 0.0.1 (2026-10-20)

### 🚀 Features

- Enhance landing hero component with expandable search functionality, improve tooltip positioning in spending map, and refine layout for better responsiveness ([cf7ae00](https://github.com/MaxiGarcia13/urban-transparency/commit/cf7ae00))
- Add postal code and execution address fields to public contracts, enhance geocoding functionality, and update spending map tooltips ([bc6c968](https://github.com/MaxiGarcia13/urban-transparency/commit/bc6c968))
- Integrate municipal spending aggregation and search functionality, enhance landing components, and update spending map with new tooltip and data handling ([76b7a89](https://github.com/MaxiGarcia13/urban-transparency/commit/76b7a89))
- Enhance database and scrapper functionality with new public contracts migration, neighborhood fields, and municipality integration ([54382df](https://github.com/MaxiGarcia13/urban-transparency/commit/54382df))
- Implement landing page and hero components, integrate spending map, and configure TypeScript settings for improved development experience ([53561a4](https://github.com/MaxiGarcia13/urban-transparency/commit/53561a4))
- Implement spending map component with GeoJSON integration, choropleth color logic, and utility functions for formatting and data handling ([31c5685](https://github.com/MaxiGarcia13/urban-transparency/commit/31c5685))

### 🔄 Refactors

- Convert type aliases to interfaces for contract models, adjust tooltip state definition, and refine spending map layer imports ([bc905b5](https://github.com/MaxiGarcia13/urban-transparency/commit/bc905b5))
- Replace type aliases with interfaces for geocode and contract models, enhance tooltip state with known location, and improve spending map interaction handling ([7719c35](https://github.com/MaxiGarcia13/urban-transparency/commit/7719c35))
- Update spending map layers to use contract clusters, enhance tooltip state management, and introduce grouping functionality for contract points ([24183bd](https://github.com/MaxiGarcia13/urban-transparency/commit/24183bd))
- Remove GeoJSON module declaration and add CSS module declaration in env.d.ts for improved type handling ([0fb8319](https://github.com/MaxiGarcia13/urban-transparency/commit/0fb8319))

### 🧹 Chores

- Introduce shared package with PublicContract interface and aggregate spending functionality, update pnpm-lock.yaml, and integrate shared package into web package ([8ce0b9a](https://github.com/MaxiGarcia13/urban-transparency/commit/8ce0b9a))
- Add Santander municipality configuration, fake neighborhoods geojson, and public contracts data for enhanced mapping and demo purposes ([d23b60d](https://github.com/MaxiGarcia13/urban-transparency/commit/d23b60d))
- Add Deck.gl dependencies and development script to package.json for enhanced mapping capabilities ([322822a](https://github.com/MaxiGarcia13/urban-transparency/commit/322822a))
- Update AGENTS.md for improved clarity on public spending sources, enhance pnpm-lock.yaml with new dependencies, and add global styles and Vue app setup in web package ([300d4ad](https://github.com/MaxiGarcia13/urban-transparency/commit/300d4ad))
- Add web package with Astro configuration and update linting scripts to ignore web directory ([02b7ffe](https://github.com/MaxiGarcia13/urban-transparency/commit/02b7ffe))

### 🧱 Updated Dependencies

- Updated @urban-transparency/db to 0.0.1
- Updated @urban-transparency/shared to 0.0.1

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo