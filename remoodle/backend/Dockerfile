FROM node:20-slim AS base

RUN mkdir -p /home/app
WORKDIR /home/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest-8 --activate
RUN pnpm config set store-dir .pnpm-store

COPY pnpm-lock.yaml ./
RUN pnpm fetch
ADD . ./
RUN pnpm install -r

RUN export TZ="Etc/UTC" \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

EXPOSE 9000

CMD [ "cd", "remoodle/backend", "&&", "pnpm", "start" ]