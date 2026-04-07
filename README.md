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

## Local subdomain setup (WSL / Windows)

The public cat page is resolved from the request hostname (`<cat-slug>.<base-domain>`).

Example:

- `mochi.ptitchat.test:3030` -> public page for cat slug `mochi`
- `ptitchat.test:3030` -> admin entry (`/admin/login`)

### 1) Configure env

In `.env`:

```bash
NUXT_PUBLIC_BASE_DOMAIN=ptitchat.test
```

### 2) Start Nuxt on all interfaces

```bash
pnpm dev --host 0.0.0.0 --port 3030
```

### 3) Add host entries

`hosts` files do not support wildcards, so add one line per cat slug you want to test.

If your browser runs on **Windows**, edit:

- `C:\Windows\System32\drivers\etc\hosts`

If your browser runs inside **WSL/Linux**, edit:

- `/etc/hosts`

Add entries like:

```txt
127.0.0.1 ptitchat.test
127.0.0.1 mochi.ptitchat.test
```

### 4) Test URLs

- Admin: `http://ptitchat.test:3030/admin/login`
- Public cat: `http://mochi.ptitchat.test:3030`

### Notes

- Cat subdomain uses the cat `slug` field (DNS-safe), not raw name.
- If DNS seems cached on Windows after editing `hosts`, run:

```powershell
ipconfig /flushdns
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

## Rendering mode

- The app runs with `ssr: false` and is fully client-rendered.
- Public cat pages are resolved in the browser from the current hostname.
- This reduces SSR-related deployment issues, but public pages no longer have server-rendered HTML.

## Coolify notes

- Set `NUXT_PUBLIC_BASE_DOMAIN` to your parent domain, for example `ptitchat.com`.
- Route both the root domain and cat subdomains to the same application.
- For Coolify + Traefik, that typically means:
- `https://ptitchat.com`
- `https://*.ptitchat.com`
- wildcard SSL if you want HTTPS on cat subdomains

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
`-- types/models.ts
```

## Next implementation steps

1. Create PocketBase collections (`cats`, `photos`) and auth users.
2. Add access rules for public read and admin CRUD.
3. Wire `AdminForm.vue` submit handlers to real create/update endpoints.
4. Persist auth state between refreshes for admin routes.
5. Add tests for public fetches and admin login flow.
