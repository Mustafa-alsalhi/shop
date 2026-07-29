<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;

class MaintenanceMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Allow settings and contact-us routes even during maintenance
        if ($request->is('settings') || $request->is('contact-us') || $request->is('api/settings') || $request->is('api/admin/settings')) {
            return $next($request);
        }
        
        // Get settings from database
        $settings = Setting::first();
        
        // Check if maintenance mode is enabled
        if ($settings && $settings->maintenance_mode) {
            // Check if user is admin
            if ($settings->maintenance_admin_only) {
                $user = $request->user();
                if (!$user || !$user->is_admin) {
                    // Return maintenance response
                    return response()->json([
                        'message' => $settings->maintenance_message ?? 'الموقع في وضع الصيانة. يرجى العودة لاحقاً.',
                        'maintenance_mode' => true
                    ], 503);
                }
            } else {
                // Maintenance mode is enabled for everyone
                return response()->json([
                    'message' => $settings->maintenance_message ?? 'الموقع في وضع الصيانة. يرجى العودة لاحقاً.',
                    'maintenance_mode' => true
                ], 503);
            }
        }
        
        return $next($request);
    }
}
