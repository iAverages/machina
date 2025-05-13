{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    rust-overlay,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      overlays = [(import rust-overlay)];
      pkgs = import nixpkgs {
        inherit system overlays;
      };

      pnpm = pkgs.nodePackages.pnpm;

      # rust = pkgs.rust-bin.selectLatestNightlyWith (toolchain:
      #   toolchain.default.override {
      #     extensions = [
      #       "rust-src"
      #       "rust-analyzer"
      #     ];
      #     targets = ["arm-unknown-linux-gnueabihf"];
      #   });
      rust = pkgs.rust-bin.stable.latest.default.override {
        extensions = [
          "rust-src"
          "rust-analyzer"
        ];
        targets = ["arm-unknown-linux-gnueabihf"];
      };

      website-prod = pkgs.callPackage ./apps/web/nix/default.nix {
        env = {
          PUBLIC_VIDEO_GENERATION_URL = "https://s.kirsi.dev";
          PUBLIC_APP_URL = "https://s-video.kirsi.dev";
        };
      };

      website-dev = pkgs.callPackage ./apps/web/nix/default.nix {
        env = {
          PUBLIC_VIDEO_GENERATION_URL = "https://s-dev.kirsi.dev";
          PUBLIC_APP_URL = "https://s-video-dev.kirsi.dev";
        };
      };

      docker = app:
        pkgs.dockerTools.buildLayeredImage {
          name = app.name;
          contents = [app pkgs.nodejs_22 pkgs.cacert];
          config = {
            Cmd = ["node" "server/index.mjs"];
            Env = [
              "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
            ];
          };
        };
    in {
      packages = {
        default = website-dev;
        docker-prod = docker website-prod;
        docker-dev = docker website-dev;
      };

      devShells.default = with pkgs;
        mkShell {
          packages = [
            nodejs
            bun # dev scripts + auth server
            openjdk23 # open api client
            cargo-watch
            pnpm
            pkg-config
            openssl
            just
            mprocs
            rust
          ];

          shellHook = ''
            export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig";
            export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine";
            export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine";
            export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
            export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
            export PATH="$PWD/node_modules/.bin/:$PATH"
          '';
        };
    });
}
