# Builds nimbooks-mcp from this repository's source and runs it over stdio.
# Optional: pass your address as an argument, e.g.
#   docker run -i --rm nimbooks-mcp --address "NQ.. .... ...."
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY build.mjs tsconfig.json ./
COPY src ./src
RUN node build.mjs && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
ENTRYPOINT ["node", "dist/index.js"]
