FROM php:8.2-cli-alpine3.17 as backend

RUN --mount=type=bind,from=mlocati/php-extension-installer:1.5,source=/usr/bin/install-php-extensions,target=/usr/local/bin/install-php-extensions \
     install-php-extensions opcache zip xsl dom exif intl pcntl bcmath sockets pdo_mysql igbinary && \
     apk del --no-cache ${PHPIZE_DEPS} ${BUILD_DEPENDS}

WORKDIR /app

ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer:2.3 /usr/bin/composer /usr/bin/composer

COPY ./composer.* .
RUN composer install --optimize-autoloader --no-dev

COPY --from=ghcr.io/roadrunner-server/roadrunner:2023.1.1 /usr/bin/rr /app

EXPOSE 8080/tcp

COPY ./ .

COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]