<?php

// Read .env.example
$content = file_get_contents('.env.example');

// Fix APP_NAME
$content = preg_replace('/APP_NAME=.*/', 'APP_NAME="E_Commerce_Store"', $content);

// Write to .env
file_put_contents('.env', $content);

echo "Environment setup complete!";
