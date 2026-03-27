<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', '/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://asala2026.infinityfreeapp.com',
        'https://asala2026.infinityfreeapp.com:443',
        'https://www.asala2026.infinityfreeapp.com',
    ],

    'allowed_origins_patterns' => [
        // Allow all subdomains of infinityfreeapp.com
        'https://*.infinityfreeapp.com',
        // Allow all localhost ports for development
        'http://localhost:*',
        'https://localhost:*',
    ],

    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'X-CSRF-Token',
        'X-XSRF-TOKEN',
    ],

    'exposed_headers' => [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'X-Total-Count',
        'X-Page-Count',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => false,

    /*
    |--------------------------------------------------------------------------
    | Custom CORS Headers
    |--------------------------------------------------------------------------
    |
    | Additional headers to add to CORS responses
    |
    */

    'custom_headers' => [
        'Access-Control-Allow-Credentials' => 'false',
        'Access-Control-Max-Age' => '86400',
        'Vary' => 'Origin',
    ],

];
