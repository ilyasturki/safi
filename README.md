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

The easiest way to run Safi is using the pre-built Docker image from GitHub Container Registry. You will need to ensure that if the workspace directory exists, it is writable by the container.

### Docker

```bash
docker run -d \
  --name safi \
  -p 3000:3000 \
  -v $(pwd)/workspace:/app/workspace \
  ghcr.io/yasso9/safi:latest
```

### Docker Compose

```yaml
services:
    safi:
        image: ghcr.io/yasso9/safi:latest
        ports:
            - '3000:3000'
        volumes:
            - ./workspace:/app/workspace
        restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
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
