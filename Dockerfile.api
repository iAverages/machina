FROM rust:1.85.0 AS backend

WORKDIR /machina

COPY ./Cargo.lock ./Cargo.lock
COPY ./Cargo.toml ./Cargo.toml

COPY ./video ./video
COPY ./query ./query
COPY ./.sqlx ./.sqlx

RUN --mount=type=cache,target=/app/target \
    --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    cargo build --release

FROM debian:bookworm-slim

WORKDIR /machina

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    xz-utils \ 
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz 

RUN tar -xJf ffmpeg-release-amd64-static.tar.xz  && \ 
  cp ffmpeg-*-amd64-static/ffmpeg /usr/bin/ && \
  rm -r ffmpeg-*-amd64-static ffmpeg-release-amd64-static.tar.xz

RUN mkdir -p /machina

# Don't run production as root
RUN addgroup --system --gid 1001 machina
RUN adduser --system --uid 1001 machina
USER machina

COPY --from=backend /machina/target/release/machina-video /machina/machina-video

EXPOSE 3001

CMD ["/machina/machina-video"]
