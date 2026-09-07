#!/bin/sh
set -e

echo "==> OpsMind AI Backend Initializing..."

# Ensure storage directories and permissions
mkdir -p database storage/framework/views storage/framework/cache storage/framework/sessions storage/logs bootstrap/cache
touch database/database.sqlite
chmod -R 777 storage bootstrap/cache database

# Run database migrations
echo "==> Running migrations..."
php artisan migrate --force

# Run database seeder (safe & non-blocking)
echo "==> Seeding database..."
php artisan db:seed --force || echo "Seeding completed or already exists."

# Clear caches for clean runtime
php artisan config:clear || true
php artisan route:clear || true

# Start web server on Railway $PORT
PORT_TO_USE="${PORT:-8080}"
echo "==> Starting Laravel web server on 0.0.0.0:${PORT_TO_USE}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT_TO_USE}"
