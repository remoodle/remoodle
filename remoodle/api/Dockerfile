FROM node:20-alpine

RUN apk update \
    && apk upgrade \
    && apk add --no-cache git openssh \
    && apk add curl

RUN mkdir -p /home/app
WORKDIR /home/app

RUN corepack enable && corepack prepare pnpm@latest-8 --activate
RUN pnpm config set store-dir .pnpm-store

COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod
ADD . ./
RUN pnpm install -r --offline --prod

RUN export TZ="Etc/UTC" \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

ARG VERSION_TAG
ENV VERSION_TAG=$VERSION_TAG

ENTRYPOINT pnpm start