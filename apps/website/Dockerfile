FROM node:22-alpine AS base

FROM base AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest-8 --activate
RUN pnpm add -g turbo@^2

FROM builder AS prune

COPY . .

RUN turbo prune @machina/website --docker

FROM builder AS installer
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY --from=prune /app/out/json/ .
RUN --mount=type=cache,target=/pnpm,id=pnpm-store \
    pnpm install --frozen-lockfile 

COPY --from=prune /app/out/full/ .

ARG PUBLIC_VIDEO_GENERATION_URL
ARG PUBLIC_APP_URL

RUN turbo run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 machina
RUN adduser --system --uid 1001 machina

COPY --from=installer --chown=machina:machina /app/apps/website/.output ./

USER machina

CMD ["node", "server/index.mjs"]
