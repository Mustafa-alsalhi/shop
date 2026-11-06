<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'quick_connect' => [
        'url' => env('QUICK_CONNECT_API_URL', 'https://aalcgjgocszngpcqzjih.supabase.co/functions/v1/public-api'),
        'key' => env('QUICK_CONNECT_API_KEY', 'qc_live_d66bc38904eeeb17eb0a6e27097c7ff1588657b235ad76e7'),
        'channel' => env('QUICK_CONNECT_CHANNEL', 'whatsapp'),
    ],

];
