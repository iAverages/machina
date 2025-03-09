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

      rust = pkgs.rust-bin.stable.latest.default.override {
        extensions = ["rust-src" "rust-analyzer"];
        targets = ["x86_64-unknown-linux-gnu"];
      };
    in {
      devShells.default = with pkgs;
        mkShell {
          packages = [
            nodejs
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
