<?php

// Read .env.example
$content = file_get_contents('.env.example');

// Write to .env directly since .env.example already has proper APP_NAME
file_put_contents('.env', $content);

echo "Environment setup complete!";
