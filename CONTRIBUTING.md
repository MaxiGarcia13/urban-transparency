# Contributing to Urban Clarity

Thanks for contributing. This guide covers repo layout, everyday commands, and the coding rules we expect in PRs.

Product context and data sources: [`README.md`](./README.md). Geographic coverage (INE codes): [`docs/geographic-coverage.md`](./docs/geographic-coverage.md). Agent / ingest playbooks: [`AGENTS.md`](./AGENTS.md).

## Prerequisites

- **Node** `24.22.1` (see root `package.json` `engines`)
- **pnpm** `12.14.0` (repo `packageManager`)
- Root `.env` for DB-backed scripts: `TURSO_URL`, `TURSO_AUTH_TOKEN` (never commit secrets)

```bash
pnpm install
```

## Project structure

pnpm monorepo. Packages live under `packages/`.

```
packages/
  web/         # Astro + Vue + MapLibre / deck.gl map app
  scrapper/    # PLACSP + DIRCE ingest CLIs
  database/    # Turso client, migrations, query services
  shared/      # Shared domain types and helpers
```

### Package layers

Use only the folders you need; do not invent parallel layers.

```
packages/<name>/
  domain/       # business logic and types (no HTTP, DOM, or UI)
  components/   # UI building blocks (apps)
  scripts/      # CLI / runnable entrypoints
  services/     # API and external I/O (return domain types)
  utils/        # generic helpers with no product meaning
```

- Put cross-package types and logic in `packages/shared`. Do not duplicate them.
- Do not put city-specific or app-only code in `shared`.
- `shared` must not depend on `web`, `scrapper`, or `database`.

### Product scope

- Spain-wide product; Cantabria, País Vasco, and Asturias are configured seeds — not the product identity.
- Parameterize by INE province / municipality codes. Prefer national sources (PLACSP, INE, MIVAU).
- Prefer one ingestion path per source type, not per region. New regions ≈ new geo config.
- User-facing brand: **Urban Clarity** (see `packages/web/src/config/product.ts`). Repo folder may say `urban-transparency`.

## Commands

Run from the monorepo root unless noted.

### App

| Goal             | Command         |
| ---------------- | --------------- |
| Dev server       | `pnpm dev`      |
| Production build | `pnpm build`    |
| Preview build    | `pnpm preview`  |
| Lint             | `pnpm lint`     |
| Lint + autofix   | `pnpm lint:fix` |
| Clean install    | `pnpm phoenix`  |

### Database

```bash
pnpm --filter=@urban-transparency/database migrate
```

### Scrapers (ingest)

Prefer root aliases. Regions: `cantabria` · `pais-vasco` · `asturias`.

| Goal                           | Command                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------- |
| PLACSP incremental (~10 pages) | `pnpm scrape:placsp:<region>`                                                |
| PLACSP backfill (~50 pages)    | `pnpm --filter=@urban-transparency/scrapper scrape:placsp:<region>:backfill` |
| DIRCE (INE table 4721)         | `pnpm scrape:dirce:<region>`                                                 |

Keep PLACSP `--delay-ms` polite (aliases use `1500`). Do not hammer sources on failure.

Ad-hoc flags: read `packages/scrapper/scripts/scrape-placsp.ts` / `scrape-dirce.ts` and pass args after `--`.

### Region boundaries (web)

| Goal                        | Command                               |
| --------------------------- | ------------------------------------- |
| Fetch seed boundary GeoJSON | `pnpm fetch:region-boundary:<region>` |

### Release

| Goal                           | Command            |
| ------------------------------ | ------------------ |
| Version (conventional commits) | `pnpm release`     |
| Dry run                        | `pnpm release:dry` |

## Coding rules

### Naming

- Files / folders: `kebab-case`
- Functions / locals: `camelCase`
- Global constants: `UPPER_SNAKE_CASE`
- Prefer clear intent over abbreviations (`data`, `temp`, `handle`, `fn`)

### Language

- **English** for code, comments, logs, errors, and API payloads
- **Spanish** only for user-visible UI copy
- Map failures to Spanish in the UI layer; do not pipe English technical messages to users

### Types

- Prefer existing domain types (`shared` or package `domain`) as the source of truth
- Extend with `& { … }` or narrow with `Pick` / `Omit` — do not copy fields into sibling interfaces
- UI props and layer payloads should reference domain types

### Modules and comments

- Keep components and functions small and single-purpose; split large files
- No JSDoc / `/** … */` blocks that restate signatures
- Short `//` only for non-obvious constraints, trade-offs, or surprising choices

### UI (Vue / CSS)

- Even Tailwind spacing steps only: `2`, `4`, `6`, `8`, …
- Default radius: `rounded-xl` (`rounded-full` for pills/avatars; joined controls may drop one side)

### Data / ethics

- Retain provenance on ingest: source system, fetch timestamp, geographic key
- Respect robots.txt, terms of use, and personal-data minimization
- Never commit secrets or proxy credentials

## Pull requests

1. Keep changes focused; match existing patterns in the package you touch.
2. Run `pnpm lint` (and exercise the path you changed: `pnpm dev`, scrape alias, etc.).
3. Do not hardcode seed regions into shared schemas, pipelines, or product copy.
4. Prefer national APIs / open data before regional portals or brittle HTML scrapes.

Questions about metrics or sources: start with `README.md`, `docs/geographic-coverage.md`, and `AGENTS.md`.
