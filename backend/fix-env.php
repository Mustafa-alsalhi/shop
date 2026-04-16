<?php

// Read .env.example
$content = file_get_contents('.env.example');

// Write to .env directly since .env.example already has proper APP_NAME
file_put_contents('.env', $content);

echo "Environment setup complete!";

// Run package:discover after environment is ready
exec('php artisan package:discover --no-interaction 2>&1', $output, $returnCode);
if ($returnCode !== 0) {
    echo "Package discover completed with warnings: " . implode("\n", $output);
} else {
    echo "Package discover completed successfully!";
}
