build: 
    cargo sqlx prepare
    just build_web
    just build_api

build_web:
    docker build -f ./apps/website/Dockerfile . --tag ctr.avrg.dev/machina/web:dev

build_api:
    docker build -f ./apps/api/Dockerfile . --tag ctr.avrg.dev/machina/api:dev
