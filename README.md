<p align="center">
  <img src="public/favicon.svg" alt="Safi Logo" width="180">
</p>

# Safi

A minimalist, self-hosted text editor for markdown files with a clean, mobile-friendly interface and file-based storage. Vaults are Obsidian-compatible — register any folder on the server as a vault, right from the app.

## Features

- Minimalist, distraction-free interface
- Multiple vaults (Obsidian-style) — add, switch, and remove them from the dock
- Markdown file-based storage on the server
- Shortcuts for efficient workflow
- Focus mode for deep work
- File Explorer with basic operations (create, delete, rename)
- File search (per vault)
- Light and dark mode

## Installation

The easiest way to run Safi is using the pre-built Docker image from GitHub Container Registry.

Safi uses two host directories:

- **`vaults/`** — where you keep your vault folders. Nothing is auto-discovered: you register a vault from the app by browsing to its folder (mounted under `/app/vaults`). `.obsidian/` directories inside vaults are preserved untouched.
- **`config/`** — the vault list (`vaults.json`), preferences, and keybindings (shared across all vaults).

By default the container runs as uid/gid `1000:1000`, which matches the first regular user on most Linux desktops — so files in `./vaults` will be owned by you on the host and can be edited with any editor. If your host user has different ids (run `id` to check), set `PUID` and `PGID` accordingly.

### Docker

```bash
docker run -d \
  --name safi \
  -p 3000:3000 \
  -e PUID=$(id -u) -e PGID=$(id -g) \
  -v $(pwd)/vaults:/app/vaults \
  -v $(pwd)/config:/app/config \
  ghcr.io/ilyasturki/safi:latest
```

Visit `http://localhost:3000`, click **Add vault**, and browse to a folder under `/app/vaults` (e.g. create `./vaults/Personal/` on the host first) to register it.

### Docker Compose

```yaml
services:
    safi:
        image: ghcr.io/ilyasturki/safi:latest
        ports:
            - '3000:3000'
        environment:
            - PUID=1000
            - PGID=1000
        volumes:
            - ./vaults:/app/vaults
            - ./config:/app/config
        restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

### Upgrading from earlier versions

Older versions configured vaults through a path environment variable
(`NUXT_WORKSPACE_PATH`, later `NUXT_VAULTS_PATH`). Neither is read anymore —
vaults are now registered from the app and stored in `config/vaults.json`.

1. Keep mounting your vault folders under `/app/vaults` (or anywhere on the
   server) and bind your config dir: `-v $(pwd)/config:/app/config`.
2. Drop any `NUXT_WORKSPACE_PATH` / `NUXT_VAULTS_PATH` settings — they're ignored.
3. Open the app, click **Add vault**, and browse to each folder to register it.

### NixOS

Add Safi as an input to your NixOS flake:

```nix
{
  inputs.safi.url = "github:Yasso9/safi";

  outputs =
    { nixpkgs, safi, ... }:
    {
      nixosConfigurations.your-host = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          safi.nixosModules.default
          {
            services.safi = {
              enable = true;
              host = "0.0.0.0";
              port = 3000;
              vaultsPath = "/var/lib/safi/vaults";
              configPath = "/var/lib/safi/config";
            };
          }
        ];
      };
    };
}
```

### Building from Source

```bash
git clone https://github.com/Yasso9/safi.git
cd safi
bun install
bun run build
bun run start
```

Optionally create a `.env` from the template to set the config dir (where the
vault list, preferences, and keybindings live). It defaults to `~/.config/safi`:

```bash
cp .env.example .env
```

```env
NUXT_CONFIG_PATH=/path/to/your/safi-config
```

Then open the app and click **Add vault** to register a folder.

## Contributing

Contributions are welcome! Please follow the code style defined in `CLAUDE.md` and ensure all type checks pass:

```bash
bun run typecheck
bun run format
bun run lint
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.
