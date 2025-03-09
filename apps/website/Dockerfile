FROM node:22-alpine AS base

FROM base as builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest-8 --activate
RUN pnpm add -g turbo@^2

COPY . .

RUN turbo prune @machina/website --docker

FROM base AS installer
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY --from=prune /app/out/json/ .
RUN --mount=type=cache,target=/pnpm,id=pnpm-store \
    pnpm install --frozen-lockfile --prod

COPY --from=prune /app/out/full/ .
RUN --mount=type=cache,target=/pnpm,id=pnpm-store \
  pnpm install --frozen-lockfile

RUN turbo run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 machina
RUN adduser --system --uid 1001 machina

COPY --from=builder --chown=machina:machina /app/apps/website/.output ./

USER machina

CMD ["node", ".output/server/index.mjs"]
