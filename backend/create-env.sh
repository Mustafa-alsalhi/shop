#!/bin/bash

# Delete old .env
rm -f .env

# Create .env file
cat > .env << EOF
APP_NAME=E_Commerce_Store
APP_ENV=production
APP_KEY=base64:J7sWlYpYg0sXk9F2YlQvZzFqV0ZkZ0VqR2tqU2FqWkE=
APP_DEBUG=false
APP_URL=${APP_URL}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

BROADCAST_DRIVER=log

CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1
EOF

echo "Environment file created successfully!"
echo "=== DEBUG: Content of .env file ==="
cat .env
echo "=== DEBUG: End of .env file ==="

php artisan optimize:clear || true
