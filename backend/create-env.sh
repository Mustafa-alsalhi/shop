#!/bin/bash

# Delete any old file
rm -f .env

# Create clean file without encoding issues using Railway References
# Use envsubst to replace environment variables
export RAILWAY_PUBLIC_DOMAIN=${RAILWAY_PUBLIC_DOMAIN:-https://your-app-name.railway.app}
export MYSQLHOST=${MYSQLHOST:-railway}
export MYSQLPORT=${MYSQLPORT:-3306}
export MYSQLDATABASE=${MYSQLDATABASE:-railway}
export MYSQLUSER=${MYSQLUSER:-root}
export MYSQLPASSWORD=${MYSQLPASSWORD:-}

cat > .env << EOF
APP_NAME=E_Commerce_Store
APP_ENV=production
APP_KEY=base64:J7sWlYpYg0sXk9F2YlQvZzFqV0ZkZ0VqR2tqU2FqWkE=
APP_DEBUG=false
APP_URL=${RAILWAY_PUBLIC_DOMAIN}
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error
DB_CONNECTION=mysql
DB_HOST=${MYSQLHOST}
DB_PORT=${MYSQLPORT}
DB_DATABASE=${MYSQLDATABASE}
DB_USERNAME=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF

echo "Environment file created successfully!"
echo "=== DEBUG: Content of .env file ==="
cat .env
echo "=== DEBUG: End of .env file ==="

# Create a custom bootstrap to bypass ENV loading
cat > bootstrap/custom_env.php << 'EOF'
<?php

return [
    'name' => 'E_Commerce_Store',
    'env' => 'production',
    'debug' => false,
    'url' => 'https://your-app-name.railway.app',
    'timezone' => 'UTC',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'key' => 'base64:J7sWlYpYg0sXk9F2YlQvZzFqV0ZkZ0VqR2tqU2FqWkE=',
];
EOF

echo "Custom environment configuration created!"
