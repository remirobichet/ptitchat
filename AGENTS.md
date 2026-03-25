# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

- Stack: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS + PocketBase SDK.
- Package manager: `pnpm` (`packageManager: pnpm@9.15.3`).
- UI: mix of custom components and shadcn-vue style primitives under `components/ui/`.
- API layer: Nuxt server routes in `server/api/**`.
- Auth: PocketBase auth state bridged through composables and route middleware.

## Source Layout

- `pages/`: Nuxt route pages (`index.vue`, `cats/[slug].vue`, `admin/*`).
- `components/`: feature components + reusable UI components.
- `components/ui/`: typed, presentational primitives (`Button`, `Input`, `Card`, etc.).
- `composables/`: app-level logic (`usePocketbase`, `useAuth`).
- `server/api/`: server endpoints (`*.post.ts` style route files).
- `middleware/`: route guards (`auth.ts`).
- `types/`: shared TS record types.
- `lib/utils.ts`: utility helpers (class merging via `cn`).
- `assets/css/main.css`: Tailwind layers + design tokens.

## Setup Commands

- Install deps: `pnpm install`
- Prepare env: `cp .env.example .env`
- Dev server: `pnpm dev` (runs Nuxt on port `3030`)

## Build / Lint / Typecheck / Test

- Build production app: `pnpm build`
- Preview production build: `pnpm preview`
- Generate static output: `pnpm generate`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Unit tests (CI mode): `pnpm test`
- Unit tests (watch): `pnpm test:unit`
- E2E tests: `pnpm test:e2e`

## Running A Single Test

No first-party test files are currently committed, but use these commands once tests exist.

- Run one Vitest file (CI mode):
  - `pnpm test -- path/to/file.test.ts`
- Run one Vitest file (watch mode):
  - `pnpm test:unit -- path/to/file.test.ts`
- Run tests matching a name:
  - `pnpm test -- -t "should render cat card"`
- Run one Playwright spec file:
  - `pnpm test:e2e -- tests/admin-login.spec.ts`
- Run one Playwright test by title:
  - `pnpm test:e2e -- --grep "admin login"`

## Conventions: TypeScript & Vue

- Use `<script setup lang="ts">` for Vue SFC scripts.
- Prefer Nuxt composable auto-imports (`ref`, `computed`, `useAsyncData`, etc.) over manual imports.
- Type component props with `defineProps<...>()`; use `withDefaults(...)` when defaults are needed.
- Type emits with `defineEmits<...>()` and named payload fields.
- Use explicit return/value typing where domain clarity matters (records, payloads, auth user shape).
- Prefer `type` aliases for object-shaped data (`CatRecord`, `PhotoRecord`, etc.).
- Keep shared domain types in `types/models.ts` (or adjacent `types/` modules if expanded).
- For unions and optional values, model realistic nullability (`string | null`, `foo?: string`).

## Conventions: Imports & Modules

- Use `~/` alias for project-root imports (`~/types/models`, `~/lib/utils`).
- Keep type-only imports explicit (`import type { CatRecord } ...`).
- Group imports in this order when practical:
  1. external packages
  2. internal aliases (`~/...`)
  3. relative imports
- Avoid deep relative paths when a `~/` alias is available.
- Do not introduce CommonJS patterns; this project is ESM (`"type": "module"`).

## Conventions: Naming

- Vue components: PascalCase filenames (`LoginForm.vue`, `CatCard.vue`).
- Composables: `useXxx.ts` naming (`useAuth.ts`, `usePocketbase.ts`).
- Middleware: short, route-purpose names (`auth.ts`).
- Route files: Nuxt conventions (`[slug].vue`, `*.post.ts`).
- Local refs/state: camelCase and intention-revealing (`isCreating`, `createError`, `formKey`).
- Async handlers: verb-led names (`onSubmit`, `onCreateCat`, `logout`).

## Conventions: Formatting & Style

- Use Prettier defaults via `pnpm format:check`; do not rely on manual formatting.
- Keep functions small and focused; extract helpers for reusable logic.
- Prefer early returns for guard conditions and invalid-state exits.
- Keep templates readable: multiline attributes when long; concise one-liners when short.
- Keep CSS utility composition in components, and theme tokens in `assets/css/main.css`.
- Reuse `cn(...)` helper for conditional class merging in UI primitives.

## Conventions: Data Fetching & State

- Use `useAsyncData` for page-level async data and cache keys.
- Choose stable async keys (`"public-cats"`, `"admin-photos"`, dynamic key functions when needed).
- Keep PocketBase access centralized through `usePocketbase()`.
- Keep auth state centralized through `useAuth()` and middleware checks.
- Refresh collections after successful create/update actions (`await refresh()`).

## Conventions: Error Handling

- In server handlers, validate input early and throw `createError(...)` with clear status/message.
- In client forms/pages, catch unknown errors and normalize to user-safe strings.
- Use `try/catch/finally` for async form submissions to ensure loading flags always reset.
- Prefer explicit user-facing error refs (`errorMessage`, `createError`) over silent failures.
- Keep messages actionable and concise.

## Conventions: API & Security

- Never hardcode secrets in source.
- Use Nuxt runtime config for secret/public separation (`runtimeConfig` in `nuxt.config.ts`).
- Public PocketBase URL belongs in `NUXT_PUBLIC_POCKETBASE_URL`.
- Preserve auth cookie sync logic in `usePocketbase.ts` for browser/server consistency.
- Apply auth middleware on admin routes (`definePageMeta({ middleware: ["auth"] })`).

## UI / Tailwind Notes

- Tailwind config uses CSS variables and `tailwindcss-animate` plugin.
- Prefer existing tokens (`--background`, `--foreground`, etc.) over hardcoded colors.
- Use existing utility components in `components/ui/` before introducing new primitives.
- Maintain accessibility basics: labels for inputs, semantic buttons, alt text for images.

## Agent Workflow Expectations

- Before finalizing, run the narrowest relevant checks first (targeted test, then broader suites).
- Minimum for code changes touching TS/Vue logic: `pnpm typecheck` and `pnpm lint`.
- For formatting-sensitive changes, also run: `pnpm format:check`.
- For behavior changes, run nearest test scope (single test if available), then `pnpm test` if needed.
- Document any skipped checks and why.
