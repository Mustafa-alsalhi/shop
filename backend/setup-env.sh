#!/bin/bash

# Create .env file with proper APP_NAME
cp .env.example .env

# Fix APP_NAME using PHP (more reliable than sed)
php -r "
\$content = file_get_contents('.env');
\$content = preg_replace('/APP_NAME=.*/', 'APP_NAME=\"E_Commerce_Store\"', \$content);
file_put_contents('.env', \$content);
" --no-interaction

echo "Environment setup complete!"

# Run package:discover after environment setup
php artisan package:discover --no-interaction
