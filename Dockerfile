# Product vision, requirements, architecture direction and delivery leadership: Andrews Mensah.
FROM node:24-bookworm-slim
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node server ./server
COPY --chown=node:node dist ./dist
COPY --chown=node:node scripts/backup.mjs scripts/vendor.mjs ./scripts/
RUN npm run vendor
RUN mkdir -p data && chown node:node data
USER node
ENV HOST=0.0.0.0 PORT=4173 APP_MODE=synthetic DB_PATH=/app/data/clarity.sqlite
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:4173/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/start.mjs"]
