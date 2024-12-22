{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "https://flakehub.com/f/oxalica/rust-overlay/*.tar.gz";
  };

  outputs = {
    nixpkgs,
    rust-overlay,
    ...
  }: let
    allSystems = [
      "x86_64-linux"
    ];

    forEachSystem = f:
      nixpkgs.lib.genAttrs allSystems (system:
        f {
          inherit system;
          pkgs = import nixpkgs {
            inherit system;
            overlays = [
              rust-overlay.overlays.default
            ];
          };
        });
  in {
    devShells = forEachSystem ({
      pkgs,
      system,
    }: {
      default = with pkgs;
        mkShell {
          shellHook = ''
            export  PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig";
          '';
          packages = with pkgs; [
            nodejs_22
            pnpm
            pkg-config
            openssl
            (rust-bin.stable.latest.default.override {
              extensions = [
                "rust-src"
                "rust-analyzer"
              ];
            })
          ];
        };
    });
  };
}
