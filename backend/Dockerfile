FROM php:8.4-cli-alpine

# Set Composer permissions
ENV COMPOSER_ALLOW_SUPERUSER=1

# System dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    sqlite-dev \
    sqlite

# PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_sqlite \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files first
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader --ignore-platform-req=php+

# Copy the rest of the application
COPY . .

# Ensure storage, cache, and sqlite database exist with full write permissions
RUN mkdir -p database storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

# Generate optimized autoloader
RUN composer dump-autoload --optimize

EXPOSE 8080

CMD ["sh", "-c", "php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
