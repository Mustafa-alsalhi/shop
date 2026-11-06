<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com>
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// This file allows us to emulate Apache's "mod_rewrite" functionality from the
// built-in PHP web server. This provides a convenient way to test a Laravel
// application without having installed a "real" web server software here.
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    // Add CORS headers for static files requested from Flutter Web during dev
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: *');
    
    // PHP CLI server drops headers on `return false;`, so we must serve it directly.
    $filePath = __DIR__.'/public'.$uri;
    $mime = mime_content_type($filePath);
    if (!$mime) {
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimes = [
            'css' => 'text/css', 'js' => 'application/javascript', 
            'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 
            'gif' => 'image/gif', 'webp' => 'image/webp', 'svg' => 'image/svg+xml'
        ];
        $mime = $mimes[$ext] ?? 'application/octet-stream';
    }
    header('Content-Type: ' . $mime);
    readfile($filePath);
    exit;
}

require_once __DIR__.'/public/index.php';
