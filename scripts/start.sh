#!/bin/sh
# Container entrypoint for apps/web and apps/admin.
#   1. Apply pending database migrations. Both services run this; Prisma takes
#      a database lock, so it's safe if they start at the same time.
#   2. Admin only: seed starter data when SEED_ON_DEPLOY=true (first deploy).
#   3. Start the Next.js server on $PORT (Railway sets it).
set -e
APP="$1"

pnpm db:deploy

if [ "$APP" = "admin" ] && [ "$SEED_ON_DEPLOY" = "true" ]; then
  pnpm db:seed
fi

exec pnpm --filter "@supplement/$APP" start
