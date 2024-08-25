FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

RUN corepack enable
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@remoodle/backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch

COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
 pnpm install --filter=@acme/docs... -r --workspace-root --frozen-lockfile \
 --unsafe-perm \
 # ↑ Docker runs pnpm as root and then pnpm won't run package scripts unless we pass this arg
 | grep -v "cross-device link not permitted\|Falling back to copying packages from store"
 # ↑ Unfortunately using Docker's 'cache' mount type causes Docker to place the pnpm content-addressable store
 # on a different virtual drive, which prohibits pnpm from symlinking its content to its virtual store
 # (in node_modules/.pnpm), and that causes pnpm to fall back on copying the files.
 # And that's fine!, except pnpm emits many warnings of this, so here we filter those out.

# RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm dlx turbo run build --filter=@remoodle/backend

FROM base AS dev
COPY --from=builder /app/ ./
WORKDIR /app/apps/backend

FROM builder AS pruned
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
 pnpm --filter=@remoodle/backend --prod deploy pruned --config.ignore-scripts=true

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=pruned /app/pruned/ ./

EXPOSE 9000

CMD ["node", "./dist/app.js"]
