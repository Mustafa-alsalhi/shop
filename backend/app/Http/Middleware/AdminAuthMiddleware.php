<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AdminAuthMiddleware
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
        // Check if user is authenticated
        if (!Auth::check()) {
            Log::warning('Unauthorized access attempt to admin panel', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'path' => $request->path()
            ]);
            
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication required'
            ], 401);
        }
        
        // Check if user has admin role
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            Log::warning('Non-admin user attempted to access admin panel', [
                'ip' => $request->ip(),
                'user_id' => $user->id ?? 'unknown',
                'user_email' => $user->email ?? 'unknown',
                'user_role' => $user->role ?? 'unknown',
                'path' => $request->path()
            ]);
            
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Admin access required'
            ], 403);
        }
        
        // Check if admin account is active
        if (!$user->is_active) {
            Log::warning('Inactive admin attempted to access admin panel', [
                'ip' => $request->ip(),
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);
            
            return response()->json([
                'error' => 'Account Disabled',
                'message' => 'Your admin account has been disabled'
            ], 403);
        }
        
        // Session security checks
        $this->validateSession($request, $user);
        
        // Rate limiting for admin actions
        if (!$this->checkAdminRateLimit($request, $user)) {
            return response()->json([
                'error' => 'Rate Limit Exceeded',
                'message' => 'Too many admin actions. Please try again later.'
            ], 429);
        }
        
        // Log admin access
        $this->logAdminAccess($request, $user);
        
        return $next($request);
    }
    
    /**
     * Validate session security
     */
    private function validateSession(Request $request, $user)
    {
        $session = $request->session();
        
        // Check session age
        $sessionAge = Carbon::now()->diffInMinutes($session->get('admin_login_time', now()));
        if ($sessionAge > 480) { // 8 hours
            Auth::logout();
            $session->flush();
            
            Log::info('Admin session expired', [
                'user_id' => $user->id,
                'session_age' => $sessionAge,
                'ip' => $request->ip()
            ]);
            
            throw new \Illuminate\Session\TokenMismatchException('Session expired');
        }
        
        // Check IP consistency
        $loginIp = $session->get('admin_login_ip', $request->ip());
        if ($loginIp !== $request->ip()) {
            Log::warning('Admin IP address changed', [
                'user_id' => $user->id,
                'original_ip' => $loginIp,
                'current_ip' => $request->ip()
            ]);
            
            // Optional: Force re-authentication on IP change
            // Auth::logout();
            // $session->flush();
            // throw new \Illuminate\Session\TokenMismatchException('Security violation');
        }
        
        // Check User-Agent consistency
        $loginUserAgent = $session->get('admin_login_user_agent', $request->userAgent());
        if ($loginUserAgent !== $request->userAgent()) {
            Log::warning('Admin User-Agent changed', [
                'user_id' => $user->id,
                'original_ua' => substr($loginUserAgent, 0, 100),
                'current_ua' => substr($request->userAgent(), 0, 100)
            ]);
        }
        
        // Update session activity
        $session->put('admin_last_activity', now());
    }
    
    /**
     * Check admin rate limiting
     */
    private function checkAdminRateLimit(Request $request, $user): bool
    {
        $key = 'admin_actions:' . $user->id . ':' . $request->ip();
        $maxActions = 200; // 200 actions per 15 minutes for admin
        $windowMinutes = 15;
        
        $current = $request->session()->get($key, 0);
        $lastReset = $request->session()->get($key . '_reset', now());
        
        // Reset counter if window expired
        if (now()->diffInMinutes($lastReset) >= $windowMinutes) {
            $current = 0;
            $request->session()->put($key . '_reset', now());
        }
        
        if ($current >= $maxActions) {
            return false;
        }
        
        $request->session()->put($key, $current + 1);
        return true;
    }
    
    /**
     * Log admin access for audit trail
     */
    private function logAdminAccess(Request $request, $user)
    {
        $logData = [
            'admin_id' => $user->id,
            'admin_email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'method' => $request->method(),
            'path' => $request->path(),
            'timestamp' => now()
        ];
        
        // Log sensitive admin actions
        $sensitiveActions = ['delete', 'destroy', 'update', 'create', 'store'];
        $method = strtolower($request->method());
        
        if (in_array($method, $sensitiveActions)) {
            $logData['action'] = $method;
            $logData['input_data'] = $this->sanitizeLogData($request->all());
            
            Log::info('Admin sensitive action performed', $logData);
        } else {
            Log::debug('Admin access', $logData);
        }
        
        // Store in audit trail table if exists
        try {
            if (class_exists('\App\Models\AdminAudit')) {
                \App\Models\AdminAudit::create([
                    'admin_id' => $user->id,
                    'action' => $method,
                    'path' => $request->path(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'details' => json_encode($this->sanitizeLogData($request->all())),
                    'created_at' => now()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to store admin audit', [
                'error' => $e->getMessage(),
                'admin_id' => $user->id
            ]);
        }
    }
    
    /**
     * Sanitize data for logging
     */
    private function sanitizeLogData(array $data): array
    {
        $sensitiveKeys = [
            'password', 'password_confirmation', 'current_password',
            'api_key', 'secret', 'token', 'csrf_token',
            'credit_card', 'ssn', 'social_security',
            'bank_account', 'routing_number'
        ];
        
        return collect($data)->map(function ($value, $key) use ($sensitiveKeys) {
            if (is_string($key) && in_array(strtolower($key), $sensitiveKeys)) {
                return '[REDACTED]';
            }
            
            if (is_array($value)) {
                return $this->sanitizeLogData($value);
            }
            
            if (is_string($value) && strlen($value) > 500) {
                return substr($value, 0, 500) . '...[TRUNCATED]';
            }
            
            return $value;
        })->toArray();
    }
}
