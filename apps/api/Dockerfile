# Build context is the repository root: docker build -f apps/api/Dockerfile .
FROM node:24-slim AS build
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile \
  && pnpm --filter @hearthkey/api build \
  && pnpm --filter @hearthkey/api deploy --legacy --prod /out \
  && cp -r apps/api/dist /out/dist

FROM node:24-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out /app
USER node
# Port and host are runtime configuration (HEARTHKEY_API_PORT); EXPOSE is documentation only.
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.HEARTHKEY_API_PORT+'/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
