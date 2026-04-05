FROM php:8.1-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required by Laravel
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy the Laravel backend
COPY backend/ .

# Install Composer dependencies (no dev, optimised autoloader)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Copy .env.example to .env if no .env is present, then generate app key
RUN cp .env.example .env && php artisan key:generate --force

# Cache Laravel config and routes for production performance
RUN php artisan config:cache && php artisan route:cache

# Expose the port Laravel will serve on
EXPOSE 8080

# Start the Laravel development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
