{
  description = "Safi";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;
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
            inherit (packageJson) version;

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
            inherit (packageJson) version;

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
          inherit safi;
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
              inherit (self.packages.${pkgs.stdenv.hostPlatform.system}) default;
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
            user = lib.mkOption {
              type = lib.types.str;
              default = "safi";
              description = ''
                User to run safi as. Defaults to a dedicated system user.
                Set to your own user if you want workspace files owned by you
                so they can be edited with other tools (e.g. nvim, vscode).
              '';
            };
            group = lib.mkOption {
              type = lib.types.str;
              default = "safi";
            };
          };

          config = lib.mkIf cfg.enable {
            users.users = lib.mkIf (cfg.user == "safi") {
              safi = {
                isSystemUser = true;
                inherit (cfg) group;
                home = "/var/lib/safi";
              };
            };
            users.groups = lib.mkIf (cfg.group == "safi") {
              safi = { };
            };

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
                  # No `-p`: if a parent directory is missing, fail loudly rather
                  # than silently creating root-owned ancestors that the service
                  # user can't write to later.
                  ${pkgs.coreutils}/bin/mkdir ${lib.escapeShellArg cfg.workspacePath} 2>/dev/null || true
                  ${pkgs.coreutils}/bin/chown ${cfg.user}:${cfg.group} ${lib.escapeShellArg cfg.workspacePath}
                ''}";
                ExecStart = lib.getExe cfg.package;
                Restart = "on-failure";
                User = cfg.user;
                Group = cfg.group;
                StateDirectory = "safi";
                WorkingDirectory = "/var/lib/safi";
              };
            };
          };
        };
    };
}
