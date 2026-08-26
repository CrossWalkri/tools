# Reliable build for the evidence-integrity MCP HTTP server.
# Uses a standard Node image so pnpm installs to a PATH location and just works,
# avoiding the nixpacks/corepack PATH and version issues.
FROM node:22-slim
WORKDIR /app

# Remove any corepack shims, then install pnpm directly (goes to /usr/local/bin, on PATH).
RUN corepack disable 2>/dev/null || true
RUN npm install -g pnpm@10

# Install and build the workspace, then bundle the server.
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm build && pnpm bundle

# Railway provides PORT; the server reads it and serves /health and /mcp.
EXPOSE 3000
CMD ["node", "server-http.mjs"]
