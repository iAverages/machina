FROM oven/bun:latest AS base
WORKDIR /app

FROM base as base_build
RUN bun install -g pnpm turbo

FROM base_build AS setup

COPY . .
 
RUN turbo prune @machina/auth --docker

FROM base_build AS installer

COPY --from=setup /app/out/json .

RUN pnpm install --prod

COPY --from=setup /app/out/full .


FROM base AS runner

WORKDIR /app/apps/auth

COPY --from=installer /app /app

RUN addgroup --system --gid 1001 machina
RUN adduser --system --uid 1001 machina
USER machina

CMD bun src/index.ts


