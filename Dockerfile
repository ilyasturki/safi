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

# gosu is used by the entrypoint to drop privileges from root to the safi user
# after fixing workspace ownership at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security. The uid/gid are placeholders — the
# entrypoint adjusts them at runtime to match PUID/PGID so bind-mounted
# host directories work without manual chown.
RUN groupadd -r safi && useradd -r -g safi safi

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output /app

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# /app/vaults is a convenient mount point to browse to and register vaults from
# the app; /app/config stores the vault list, preferences, and keybindings.
RUN mkdir -p /app/vaults /app/config

ENV NUXT_CONFIG_PATH=/app/config
ENV PUID=1000
ENV PGID=1000

EXPOSE 3000/tcp
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "run", "/app/server/index.mjs"]
