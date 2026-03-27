<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class SecurityMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Apply security headers
        $this->applySecurityHeaders($request);
        
        // Rate limiting
        if (!$this->checkRateLimit($request)) {
            return response()->json([
                'error' => 'Too many requests',
                'message' => 'Please try again later.'
            ], 429);
        }
        
        // CSRF protection
        if ($this->isStateChangingRequest($request) && !$this->validateCsrfToken($request)) {
            return response()->json([
                'error' => 'CSRF token mismatch',
                'message' => 'Security validation failed.'
            ], 419);
        }
        
        // Input sanitization and validation
        $this->sanitizeAndValidateInputs($request);
        
        // Security monitoring
        $this->monitorSuspiciousActivity($request);
        
        return $next($request);
    }
    
    /**
     * Apply security headers to response
     */
    private function applySecurityHeaders(Request $request)
    {
        $response = response();
        
        // Content Security Policy
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://unpkg.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
            "img-src 'self' data: blob: http://127.0.0.1:8000 https://127.0.0.1:8000",
            "connect-src 'self' http://127.0.0.1:8000 https://127.0.0.1:8000 ws://127.0.0.1:8000 wss://127.0.0.1:8000",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'"
        ];
        
        $response->header('Content-Security-Policy', implode('; ', $csp));
        $response->header('X-Content-Type-Options', 'nosniff');
        $response->header('X-Frame-Options', 'DENY');
        $response->header('X-XSS-Protection', '1; mode=block');
        $response->header('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions Policy
        $permissions = [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()'
        ];
        
        $response->header('Permissions-Policy', implode(', ', $permissions));
        
        // HSTS (only for HTTPS)
        if ($request->secure()) {
            $response->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
    }
    
    /**
     * Check rate limiting
     */
    private function checkRateLimit(Request $request): bool
    {
        $key = 'api_requests:' . $request->ip();
        
        return RateLimiter::attempt($key, 100, function () {
            // Allow request
        }, 900); // 15 minutes window
    }
    
    /**
     * Check if request is state-changing
     */
    private function isStateChangingRequest(Request $request): bool
    {
        return in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE']);
    }
    
    /**
     * Validate CSRF token
     */
    private function validateCsrfToken(Request $request): bool
    {
        // Skip CSRF for API requests with proper authentication
        if ($request->expectsJson() && $request->bearerToken()) {
            return true;
        }
        
        return $request->hasHeader('X-CSRF-Token') || 
               $request->has('_token') || 
               $request->session()->token() === $request->input('_token');
    }
    
    /**
     * Sanitize and validate inputs
     */
    private function sanitizeAndValidateInputs(Request $request)
    {
        $allInputs = $request->all();
        
        foreach ($allInputs as $key => $value) {
            if (is_string($value)) {
                // Detect XSS attempts
                if ($this->detectXSS($value)) {
                    Log::warning('XSS attempt detected', [
                        'ip' => $request->ip(),
                        'input' => $key,
                        'value' => $value
                    ]);
                    
                    // Sanitize the input
                    $sanitized = $this->sanitizeInput($value);
                    $request->merge([$key => $sanitized]);
                }
                
                // Detect SQL injection attempts
                if ($this->detectSQLInjection($value)) {
                    Log::warning('SQL injection attempt detected', [
                        'ip' => $request->ip(),
                        'input' => $key,
                        'value' => $value
                    ]);
                    
                    // Sanitize the input
                    $sanitized = $this->sanitizeInput($value);
                    $request->merge([$key => $sanitized]);
                }
            }
        }
    }
    
    /**
     * Detect XSS patterns
     */
    private function detectXSS(string $input): bool
    {
        $xssPatterns = [
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/<iframe/i',
            '/<object/i',
            '/<embed/i',
            '/<link/i',
            '/<meta/i',
            '/<style/i',
            '/expression\s*\(/i'
        ];
        
        foreach ($xssPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Detect SQL injection patterns
     */
    private function detectSQLInjection(string $input): bool
    {
        $sqlPatterns = [
            '/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/i',
            '/(--|#|\/\*|\*\/)/',
            '/\b(OR|AND)\b\s*\d+\s*=\s*\d+/i',
            '/\b(OR|AND)\b\s*\'\w*\'\s*=\s*\'\w*\'/i',
            '/\b(OR|AND)\b\s*\w+\s*=\s*\w+/i',
            '/\'\s*(OR|AND)\s*\d+\s*=\s*\d+/i',
            '/\'\s*(OR|AND)\s*\'\w*\'\s*=\s*\'\w*\'/i'
        ];
        
        foreach ($sqlPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Sanitize input
     */
    private function sanitizeInput(string $input): string
    {
        // Remove HTML tags
        $sanitized = strip_tags($input);
        
        // Remove JavaScript protocols
        $sanitized = preg_replace('/javascript:/i', '', $sanitized);
        
        // Remove event handlers
        $sanitized = preg_replace('/on\w+\s*=/i', '', $sanitized);
        
        // Escape special characters
        $sanitized = htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
        
        return trim($sanitized);
    }
    
    /**
     * Monitor suspicious activity
     */
    private function monitorSuspiciousActivity(Request $request)
    {
        $suspiciousPatterns = [
            'admin',
            'administrator',
            'root',
            'test',
            'demo',
            'password',
            'passwd',
            'secret',
            'key',
            'token',
            'auth',
            'login',
            'wp-admin',
            'wp-login',
            'phpmyadmin',
            'sqlmap',
            'nikto',
            'nmap',
            'burp',
            'metasploit'
        ];
        
        $userAgent = $request->userAgent();
        $uri = $request->getRequestUri();
        $inputString = json_encode($request->all());
        
        // Check for suspicious patterns in various places
        foreach ($suspiciousPatterns as $pattern) {
            if (stripos($userAgent, $pattern) !== false ||
                stripos($uri, $pattern) !== false ||
                stripos($inputString, $pattern) !== false) {
                
                Log::warning('Suspicious activity detected', [
                    'ip' => $request->ip(),
                    'user_agent' => $userAgent,
                    'uri' => $uri,
                    'pattern' => $pattern,
                    'timestamp' => now()
                ]);
                
                // Block obvious malicious requests
                if (in_array($pattern, ['sqlmap', 'nikto', 'nmap', 'burp', 'metasploit'])) {
                    abort(403, 'Access denied');
                }
            }
        }
        
        // Check for unusual request patterns
        $this->checkUnusualPatterns($request);
    }
    
    /**
     * Check for unusual request patterns
     */
    private function checkUnusualPatterns(Request $request)
    {
        $ip = $request->ip();
        $uri = $request->getRequestUri();
        
        // Check for too many parameters
        if (count($request->all()) > 50) {
            Log::warning('Too many parameters in request', [
                'ip' => $ip,
                'uri' => $uri,
                'param_count' => count($request->all())
            ]);
        }
        
        // Check for very long parameter values
        foreach ($request->all() as $key => $value) {
            if (is_string($value) && strlen($value) > 10000) {
                Log::warning('Very long parameter value detected', [
                    'ip' => $ip,
                    'uri' => $uri,
                    'parameter' => $key,
                    'length' => strlen($value)
                ]);
            }
        }
        
        // Check for suspicious file upload attempts
        if ($request->hasFile('file') || $request->hasFile('image')) {
            $this->checkFileUpload($request);
        }
    }
    
    /**
     * Check file upload security
     */
    private function checkFileUpload(Request $request)
    {
        $files = $request->files->all();
        
        foreach ($files as $key => $file) {
            if ($file && $file->isValid()) {
                $originalName = $file->getClientOriginalName();
                $mimeType = $file->getMimeType();
                
                // Check for dangerous file extensions
                $dangerousExtensions = [
                    'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'php8',
                    'exe', 'bat', 'cmd', 'com', 'scr', 'pif',
                    'js', 'jse', 'vbs', 'vbe', 'wsf', 'wsh',
                    'sh', 'bash', 'ps1', 'py', 'pl', 'rb',
                    'sql', 'mdb', 'accdb'
                ];
                
                $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
                
                if (in_array($extension, $dangerousExtensions)) {
                    Log::warning('Dangerous file upload attempt', [
                        'ip' => $request->ip(),
                        'filename' => $originalName,
                        'mime_type' => $mimeType,
                        'extension' => $extension
                    ]);
                    
                    // Reject the file
                    abort(422, 'File type not allowed');
                }
                
                // Check for suspicious MIME types
                $dangerousMimeTypes = [
                    'application/x-php',
                    'application/x-executable',
                    'application/x-bat',
                    'application/x-sh',
                    'text/x-php',
                    'text/x-script'
                ];
                
                if (in_array($mimeType, $dangerousMimeTypes)) {
                    Log::warning('Dangerous MIME type detected', [
                        'ip' => $request->ip(),
                        'filename' => $originalName,
                        'mime_type' => $mimeType
                    ]);
                    
                    abort(422, 'File type not allowed');
                }
            }
        }
    }
}
