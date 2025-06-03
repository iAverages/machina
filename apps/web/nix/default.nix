{
  pkgs,
  env,
  ...
}: let
  root = ./../../../.;
  rootFiles = [
    "patches"
    "apps"
    "packages"
    "turbo.json"
    "package.json"
    "pnpm-workspace.yaml"
    "pnpm-lock.yaml"
    "tsconfig.json"
  ];
in
  pkgs.stdenv.mkDerivation (finalAttrs:
    with pkgs; {
      inherit env;
      pname = "website";
      version = "1.0.0";

      src = lib.fileset.toSource {
        inherit root;
        fileset = lib.pipe rootFiles [
          (map (path: root + "/${path}"))
          lib.fileset.unions
          (lib.fileset.intersection (lib.fileset.fromSource (lib.sources.cleanSource root)))
        ];
      };

      nativeBuildInputs = [
        nodejs_22
        pnpm.configHook
      ];

      # TODO: work out how to correctly use this, do i have to set every page /web uses? (cringe)
      # pnpmWorkspaces = ["@machina/web"];

      # TODO: move this to own derivation to reduce installs
      pnpmDeps = pnpm.fetchDeps {
        inherit (finalAttrs) pname version src;
        hash = "sha256-oimVM/VKjqAgSAVwZ+eLzjH7erAw3Vqs9BmanwyUwM8=";
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
    })
