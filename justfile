build: 
    cargo sqlx prepare
    just build_web
    just build_api

build_web:
    docker build -f ./apps/website/Dockerfile . --tag ctr.avrg.dev/machina/web:dev

build_api:
    docker build -f ./apps/api/Dockerfile . --tag ctr.avrg.dev/machina/api:dev

build_auth:
    docker build -f ./apps/auth/Dockerfile . --tag ctr.avrg.dev/machina/auth:dev

update_api_auth_client:
    -mkdir .machina
    # bun run ./apps/auth/dev/openapi-schema.ts > .machina/auth-api-client-schema.json 
    pnpm openapi-generator-cli generate \
    --skip-validate-spec \
    -i ./.machina/auth-api-client-schema.json \
    -g rust \
    -c ./openapitools-rust-options.json \
    -o ./packages/auth-api-client/
