# Build from the REPOSITORY ROOT (the monorepo is needed for shared packages):
#   docker build -f apps/web/Dockerfile .
# On Railway: leave Root Directory empty and set RAILWAY_DOCKERFILE_PATH=apps/web/Dockerfile
FROM node:22-slim

# OpenSSL is required by the Prisma query engine.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10.28.0

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN pnpm install --frozen-lockfile

# Inlined into the browser bundle at build time (optional).
ARG NEXT_PUBLIC_APP_NAME
RUN pnpm turbo run build --filter=@supplement/web

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "scripts/start.sh", "web"]
