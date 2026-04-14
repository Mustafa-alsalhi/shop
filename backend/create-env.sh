#!/bin/bash

# Delete any old file
rm -f .env

# Create clean file without encoding issues
printf '%s\n' \
'APP_NAME=E_Commerce_Store' \
'APP_ENV=production' \
'APP_KEY=' \
'APP_DEBUG=false' \
'APP_URL=https://your-app-name.railway.app' \
'' \
'LOG_CHANNEL=stack' \
'LOG_DEPRECATIONS_CHANNEL=null' \
'LOG_LEVEL=error' \
'' \
'DB_CONNECTION=mysql' \
'DB_HOST=railway' \
'DB_PORT=3306' \
'DB_DATABASE=railway' \
'DB_USERNAME=root' \
'DB_PASSWORD=' \
'' \
'BROADCAST_DRIVER=log' \
'CACHE_DRIVER=redis' \
'FILESYSTEM_DRIVER=local' \
'QUEUE_CONNECTION=sync' \
'SESSION_DRIVER=redis' \
'SESSION_LIFETIME=120' \
'' \
'REDIS_HOST=railway' \
'REDIS_PASSWORD=' \
'REDIS_PORT=6379' \
> .env

echo "Environment file created successfully!"
echo "=== DEBUG: Content of .env file ==="
cat .env
echo "=== DEBUG: End of .env file ==="
