<p align="center">
  <img src="public/favicon.svg" alt="Safi Logo" width="180">
</p>

# Safi

A minimalist, self-hosted text editor for markdown files with a clean, mobile-friendly interface and file-based storage. Vaults are Obsidian-compatible — point Safi at a parent directory and every subfolder becomes a switchable vault.

## Features

- Minimalist, distraction-free interface
- Multiple vaults (Obsidian-style) — switchable from the dock
- Markdown file-based storage on the server
- Shortcuts for efficient workflow
- Focus mode for deep work
- File Explorer with basic operations (create, delete, rename)
- File search (per vault)
- Light and dark mode

## Installation

The easiest way to run Safi is using the pre-built Docker image from GitHub Container Registry.

Safi expects two host directories:

- **`vaults/`** — parent directory. Each top-level non-hidden subfolder is a vault. `.obsidian/` directories inside vaults are preserved untouched.
- **`config/`** — global preferences and keybindings (shared across all vaults).

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

Create at least one vault by making a subfolder, e.g. `./vaults/Personal/`, then visit `http://localhost:3000`.

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

### Upgrading from a single workspace

Earlier versions of Safi used a single `NUXT_WORKSPACE_PATH` pointing to one directory. The new layout requires a parent directory containing one subfolder per vault:

1. Rename your existing host directory so it becomes a child of a new parent: e.g. `mv ./workspace ./vaults/Personal`.
2. Replace `-v $(pwd)/workspace:/app/workspace` with `-v $(pwd)/vaults:/app/vaults`, and add a new bind for global config: `-v $(pwd)/config:/app/config`.
3. (Optional) Copy your old `./vaults/Personal/.safi/` to `./config/` to preserve preferences and keybindings — they now live globally instead of per-vault.

`NUXT_WORKSPACE_PATH` is no longer read; use `NUXT_VAULTS_PATH` and `NUXT_CONFIG_PATH`.

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

Create a `.env` from the template and point it at your vaults and config dirs:

```bash
cp .env.example .env
```

```env
NUXT_VAULTS_PATH=/path/to/your/vaults
NUXT_CONFIG_PATH=/path/to/your/safi-config
```

## Contributing

Contributions are welcome! Please follow the code style defined in `CLAUDE.md` and ensure all type checks pass:

```bash
bun run typecheck
bun run format
bun run lint
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.
