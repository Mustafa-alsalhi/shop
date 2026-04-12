#!/bin/bash

# Create .env file with proper APP_NAME
cp .env.example .env

# Fix APP_NAME with proper quotes
sed -i 's/APP_NAME=E_Commerce_Store/APP_NAME="E_Commerce_Store"/g' .env

echo "Environment setup complete!"
