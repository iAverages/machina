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

generate_api_client:
    mkdir -p .machina
    curl http://localhost:3001/openapi.json -o ./.machina/schema.json
    pnpm openapi-generator-cli generate -i ./.machina/schema.json -g typescript-fetch -o ./apps/web/src/api/client
