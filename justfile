build: 
    just build_web
    just build_api

build_web:
    docker build -f Dockerfile.web .  --tag ctr.avrg.dev/machina/web:latest && docker push ctr.avrg.dev/machina/web

build_api:
    docker build -f Dockerfile.api .  --tag ctr.avrg.dev/machina/api:latest && docker push ctr.avrg.dev/machina/api
