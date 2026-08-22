FROM --platform=$BUILDPLATFORM node:22-alpine AS build-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM build-base AS builder
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/remoodle/package.json ./apps/remoodle/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @heresy/remoodle build
RUN pnpm deploy --filter @heresy/remoodle --prod /app

FROM --platform=$TARGETPLATFORM node:22-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
RUN apk add --no-cache tzdata \
    && export TZ="Asia/Almaty" \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV SERVICE_NAME=bot

CMD ["sh", "-c", "pnpm start:${SERVICE_NAME}"]
