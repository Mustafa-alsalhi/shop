<?php

// Read .env.example
$content = file_get_contents('.env.example');

// Fix APP_NAME - remove any existing APP_NAME and add new one
$lines = explode("\n", $content);
$newLines = [];

foreach ($lines as $line) {
    if (strpos($line, 'APP_NAME=') === 0) {
        // Skip existing APP_NAME line
        continue;
    }
    $newLines[] = $line;
}

// Add new APP_NAME at the beginning
array_unshift($newLines, 'APP_NAME="E_Commerce_Store"');

// Write to .env
file_put_contents('.env', implode("\n", $newLines));

echo "Environment setup complete!";
