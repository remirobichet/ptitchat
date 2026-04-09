FROM node:22.20.0-bookworm-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --config.include.optional=true

FROM node:22.20.0-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG COMMIT_SHA
ARG NUXT_PUBLIC_APP_VERSION
ENV COMMIT_SHA=$COMMIT_SHA
ENV NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

FROM node:22.20.0-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
