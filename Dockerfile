# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --ignore-scripts

# Copy the entire project
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1 AS production
WORKDIR /app

# Create non-root user for security
RUN groupadd -r safi && useradd -r -g safi safi

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output /app

# Create workspace directory with proper permissions
RUN mkdir -p /app/workspace && chown -R safi:safi /app
# Switch to non-root user
USER safi

ENV NUXT_WORKSPACE_PATH=/app/workspace

# Start the application
EXPOSE 3000/tcp
CMD ["bun", "run", "/app/server/index.mjs"]
