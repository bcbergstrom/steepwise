FROM oven/bun:1.4.5 AS dependencies
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG VITE_SPRING_AUTH=false
RUN --mount=type=secret,id=frontend_env,target=/app/.env \
    NITRO_PRESET=node-server npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5173
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 5173
CMD ["node", ".output/server/index.mjs"]
