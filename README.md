# PtitChat - Nuxt + PocketBase starter

Base project structure for a SaaS-like cat gallery with:

- Public pages (latest cats + cat details)
- Admin area (login + management placeholders)
- PocketBase SDK integration composables
- shadcn-vue setup for auth pages
- Optional Nuxt server API endpoints for secure workflows

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Run dev server:

```bash
pnpm dev
```

## Available scripts

- `pnpm dev` - start Nuxt in development
- `pnpm build` - create production build
- `pnpm preview` - run production preview
- `pnpm generate` - generate static output
- `pnpm typecheck` - run Nuxt TypeScript checks
- `pnpm test` - run unit tests
- `pnpm test:unit` - run Vitest in watch mode
- `pnpm test:e2e` - run Playwright tests

## Current structure

```
.
|-- AGENTS.md
|-- app.vue
|-- assets/css/main.css
|-- components/
|   |-- AdminForm.vue
|   |-- CatCard.vue
|   |-- LoginForm.vue
|   |-- PhotoGallery.vue
|   |-- SignupForm.vue
|   `-- ui/
|       |-- Button.vue
|       |-- Card.vue
|       |-- CardContent.vue
|       |-- CardDescription.vue
|       |-- CardHeader.vue
|       |-- CardTitle.vue
|       |-- Input.vue
|       `-- Label.vue
|-- composables/
|   |-- useAuth.ts
|   `-- usePocketbase.ts
|-- layouts/default.vue
|-- middleware/auth.ts
|-- nuxt.config.ts
|-- pages/
|   |-- index.vue
|   |-- cats/[slug].vue
|   `-- admin/
|       |-- index.vue
|       |-- login.vue
|       |-- signup.vue
|       |-- cats.vue
|       `-- photos.vue
|-- server/api/admin/
|   |-- create-cat.post.ts
|   `-- upload-photo.post.ts
`-- types/models.ts
```

## Next implementation steps

1. Create PocketBase collections (`cats`, `photos`) and auth users.
2. Add access rules for public read and admin CRUD.
3. Wire `AdminForm.vue` submit handlers to real create/update endpoints.
4. Persist auth state between refreshes for admin routes.
5. Add tests for public fetches and admin login flow.
