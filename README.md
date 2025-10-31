# Safi

A minimalist, distraction-free text editor for markdown files. Built with Nuxt 4, Vue 3, and CodeMirror 6, Safi provides a clean, mobile-friendly interface focused on your content.

## Features

- Minimalist, distraction-free interface
- Mobile-first design with touch-friendly interactions
- File-based storage with markdown support
- Syntax highlighting and markdown editing features
- Keyboard shortcuts for efficient workflow
- Dark mode support
- Direct file system access for portability

## Quick Start with Docker

The easiest way to run Safi is using Docker:

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd safi
```

2. Create a directory for your markdown files:
```bash
mkdir workspace
```

3. Start the application:
```bash
docker-compose up -d
```

4. Open your browser and navigate to `http://localhost:3000`

Your markdown files will be stored in the `./workspace` directory.

### Using Docker Run

```bash
# Build the image
docker build -t safi .

# Run the container
docker run -d \
  --name safi \
  -p 3000:3000 \
  -v $(pwd)/workspace:/app/workspace \
  safi
```

### Customizing the Workspace Path

Edit `docker-compose.yml` and change the volume mount:

```yaml
volumes:
  - /your/custom/path:/app/workspace
```

Or for `docker run`:

```bash
docker run -d \
  --name safi \
  -p 3000:3000 \
  -v /your/custom/path:/app/workspace \
  -e NUXT_WORKSPACE_PATH=/app/workspace \
  safi
```

## Development Setup

### Requirements

- [Bun](https://bun.sh/) 1.0 or higher
- Node.js 18+ (for compatibility)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd safi
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure your workspace path in `.env`:
```env
NUXT_WORKSPACE_PATH=/path/to/your/markdown/files
```

5. Start the development server:
```bash
bun run dev
```

6. Open your browser and navigate to `http://localhost:3000`

### Available Commands

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run preview      # Preview production build
bun run start        # Start production server
bun run typecheck    # Run TypeScript type checking
bun run format       # Format code with Prettier
bun run lint         # Lint code with ESLint
```

## Configuration

### Environment Variables

- `NUXT_WORKSPACE_PATH` (required): Absolute path to the directory containing your markdown files. All file operations are restricted to this directory and its subdirectories for security.

### Example Configuration

```env
# Development
NUXT_WORKSPACE_PATH=/home/user/documents/notes

# Docker (default)
NUXT_WORKSPACE_PATH=/app/workspace
```

## Tech Stack

- **Meta-Framework**: Nuxt 4 (SPA mode with Nitro backend)
- **Framework**: Vue 3 with Composition API
- **Editor**: CodeMirror 6
- **Styling**: TailwindCSS v4
- **Runtime**: Bun
- **Language**: TypeScript

## Project Structure

```
safi/
├── app/                    # Main application directory
│   ├── pages/             # File-based routing
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   ├── lib/editor/        # CodeMirror 6 integration
│   └── assets/css/        # Global styles
├── server/                # Nitro server (backend API)
│   ├── api/              # API endpoints
│   └── utils/            # Server utilities
├── shared/               # Shared types between client/server
└── public/               # Static assets
```

## Security

Safi implements several security measures:

- All file operations are restricted to the configured workspace directory
- Path traversal attempts are blocked
- Only `.md` files are accessible through the API
- Hidden files (starting with `.`) are excluded
- Non-root user in Docker containers

## Contributing

Contributions are welcome! Please follow the code style defined in `CLAUDE.md` and ensure all type checks pass:

```bash
bun run typecheck
bun run format
bun run lint
```

## License

[Add your license here]

## Acknowledgments

Built with:
- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [CodeMirror 6](https://codemirror.net/)
- [TailwindCSS](https://tailwindcss.com/)
- [Bun](https://bun.sh/)
