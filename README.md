<p align="center">
  <img src="public/favicon.svg" alt="Safi Logo" width="180">
</p>

# Safi

A minimalist, self-hosted text editor for markdown files with a clean, mobile-friendly interface and file-based storage.

## Features

- Minimalist, distraction-free interface
- Markdown file-based storage in the server
- Shortcuts for efficient workflow
- Focus mode for deep work
- File Explorer with basic operations (create, delete, rename)
- File Search
- Light and Dark mode support

## Installation

The easiest way to run Safi is using the pre-built Docker image from GitHub Container Registry.

By default the container runs as uid/gid `1000:1000`, which matches the first regular user on most Linux desktops — so files in `./workspace` will be owned by you on the host and can be edited with any editor. If your host user has different ids (run `id` to check), set `PUID` and `PGID` accordingly.

### Docker

```bash
docker run -d \
  --name safi \
  -p 3000:3000 \
  -e PUID=$(id -u) -e PGID=$(id -g) \
  -v $(pwd)/workspace:/app/workspace \
  ghcr.io/ilyasturki/safi:latest
```

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
            - ./workspace:/app/workspace
        restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

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
              workspacePath = "/var/lib/safi/workspace";
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

If you want to change workspace path, create a `.env` file:

```bash
cp .env.example .env
```

And configure your workspace path in `.env`:

```env
NUXT_WORKSPACE_PATH=/path/to/your/markdown/files
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
