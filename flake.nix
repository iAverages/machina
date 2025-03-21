{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "https://flakehub.com/f/oxalica/rust-overlay/*.tar.gz";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    rust-overlay,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [rust-overlay.overlays.default];
      };

      pnpm = pkgs.nodePackages.pnpm;

      rust = pkgs.rust-bin.nightly.latest.default.override {
        extensions = ["rust-src" "rust-analyzer"];
        targets = ["x86_64-unknown-linux-gnu"];
      };

      website = pkgs.stdenv.mkDerivation (finalAttrs:
        with pkgs; {
          pname = "website";
          version = "1.0.0";

          src = ./.;

          nativeBuildInputs = [
            nodejs_22
            pnpm.configHook
          ];

          # TODO: work out how to correctly use this, do i have to set every page /web uses? (cringe)
          # pnpmWorkspaces = ["@machina/web"];
          pnpmDeps = pnpm.fetchDeps {
            inherit (finalAttrs) pname version src;
            hash = "sha256-k5lKWhFL2iip9fI+qf83HnJSfNj4P/5NNaIOessc3YU=";
          };

          # TODO: figure out a way to override these for deployed dev vs prod
          env = {
            PUBLIC_VIDEO_GENERATION_URL = "http://localhost:3001";
            PUBLIC_APP_URL = "http://localhost:3000";
          };

          buildPhase = ''
            pnpm build -- --filter=@machina/web
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out
            cp -r ./apps/web/.output/* $out

            runHook postInstall
          '';
        });
    in {
      packages = with pkgs; {
        default = website;
        docker = dockerTools.buildLayeredImage {
          name = website.name;
          contents = [website nodejs_22];

          # This ensures symlinks to directories are preserved in the image
          config = {Cmd = ["node" "server/index.mjs"];};
        };
      };

      devShells.default = with pkgs;
        mkShell {
          packages = [
            nodejs
            bun # dev scripts
            pnpm
            pkg-config
            openssl
            just
            mprocs
            rust
          ];

          shellHook = ''
            export  PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig";
            export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine";
            export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine";
            export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
            export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
          '';
        };
    });
}
