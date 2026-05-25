{
  description = "Safi";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      lib = nixpkgs.lib;
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      forAllSystems = lib.genAttrs systems;
      packageJson = builtins.fromJSON (builtins.readFile ./package.json);
      src = lib.cleanSourceWith {
        src = ./.;
        filter =
          path: _:
          !(lib.elem (baseNameOf path) [
            ".env"
            ".git"
            ".nuxt"
            ".output"
            "node_modules"
            "result"
            "workspace"
          ]);
      };
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          node_modules = pkgs.stdenvNoCC.mkDerivation {
            pname = "safi-node_modules";
            inherit src;
            version = packageJson.version;

            nativeBuildInputs = [
              pkgs.bun
              pkgs.writableTmpDirAsHomeHook
            ];

            dontConfigure = true;

            buildPhase = ''
              runHook preBuild
              export BUN_INSTALL_CACHE_DIR=$(mktemp -d)
              bun install --cpu="*" --os=linux --force --frozen-lockfile --ignore-scripts --no-progress
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              mkdir -p $out
              cp -R node_modules $out/
              runHook postInstall
            '';

            dontFixup = true;
            outputHash = "sha256-mNdw6iqujRvlh9fBUQ1BZthi3xAIMq7GyswJgpj6dSA=";
            outputHashAlgo = "sha256";
            outputHashMode = "recursive";
          };

          safi = pkgs.stdenvNoCC.mkDerivation {
            pname = "safi";
            inherit src;
            version = packageJson.version;

            nativeBuildInputs = [
              pkgs.bun
              pkgs.makeBinaryWrapper
              pkgs.nodejs-slim
              pkgs.writableTmpDirAsHomeHook
            ];

            configurePhase = ''
              runHook preConfigure
              cp -R ${node_modules}/node_modules .
              chmod -R u+w node_modules
              patchShebangs node_modules/.bin
              patchShebangs node_modules/@nuxt/cli/bin
              runHook postConfigure
            '';

            buildPhase = ''
              runHook preBuild
              export CI=1
              export NUXT_TELEMETRY_DISABLED=1
              bun run build
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall
              mkdir -p $out/bin $out/share/safi
              cp -R .output/* $out/share/safi/
              makeBinaryWrapper ${pkgs.bun}/bin/bun $out/bin/safi \
                --add-flags "$out/share/safi/server/index.mjs" \
                --set-default NODE_ENV production
              runHook postInstall
            '';

            meta.mainProgram = "safi";
          };
        in
        {
          default = safi;
          safi = safi;
        }
      );

      nixosModules.default =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          cfg = config.services.safi;
        in
        {
          options.services.safi = {
            enable = lib.mkEnableOption "Safi";
            package = lib.mkOption {
              type = lib.types.package;
              default = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
            };
            workspacePath = lib.mkOption {
              type = lib.types.str;
              default = "/var/lib/safi/workspace";
            };
            host = lib.mkOption {
              type = lib.types.str;
              default = "127.0.0.1";
            };
            port = lib.mkOption {
              type = lib.types.port;
              default = 3000;
            };
          };

          config = lib.mkIf cfg.enable {
            systemd.services.safi = {
              wantedBy = [ "multi-user.target" ];
              after = [ "network.target" ];
              environment = {
                HOST = cfg.host;
                PORT = toString cfg.port;
                NUXT_WORKSPACE_PATH = cfg.workspacePath;
              };
              serviceConfig = {
                ExecStartPre = "+${pkgs.writeShellScript "safi-init-workspace" ''
                  ${pkgs.coreutils}/bin/mkdir -p ${lib.escapeShellArg cfg.workspacePath}
                  ${pkgs.coreutils}/bin/chown safi:safi ${lib.escapeShellArg cfg.workspacePath}
                ''}";
                ExecStart = lib.getExe cfg.package;
                Restart = "on-failure";
                DynamicUser = true;
                StateDirectory = "safi";
                WorkingDirectory = "/var/lib/safi";
              };
            };
          };
        };
    };
}
