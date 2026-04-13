#!/bin/bash

# Copy .env.example to .env
cp .env.example .env

# Fix APP_NAME with proper quotes
sed -i 's/^APP_NAME=.*/APP_NAME="E-Commerce Store"/' .env

# Fix any values with spaces without quotes
sed -i 's/=\([^"]* [^"]*\)/="\1"/g' .env

echo "Environment setup complete!"
