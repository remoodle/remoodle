FROM php:8.3-cli-alpine3.17 as backend

RUN --mount=type=bind,from=mlocati/php-extension-installer:2.4,source=/usr/bin/install-php-extensions,target=/usr/local/bin/install-php-extensions \
     install-php-extensions opcache zip xsl dom exif intl mbstring pcntl bcmath sockets pdo_mysql igbinary protobuf && \
     apk del --no-cache ${PHPIZE_DEPS} ${BUILD_DEPENDS}

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer:2.3 /usr/bin/composer /usr/bin/composer

COPY ./composer.* .
RUN composer install --optimize-autoloader --no-dev

COPY --from=ghcr.io/roadrunner-server/roadrunner:2024.1.0 /usr/bin/rr /app

COPY ./ .

ARG VERSION_TAG
ENV VERSION_TAG=$VERSION_TAG

COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]