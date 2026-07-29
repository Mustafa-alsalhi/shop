<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;

class CheckMaintenance
{
    public function handle(Request $request, Closure $next)
    {
        $settings = Setting::first();
        
        if ($settings && $settings->maintenance_mode) {
            // Check if user is admin
            $user = $request->user();
            
            if ($settings->maintenance_admin_only) {
                // Only allow admins
                if (!$user || !$user->isAdmin()) {
                    return response()->json([
                        'message' => $settings->maintenance_message ?? 'الموقع في وضع الصيانة. يرجى العودة لاحقاً.'
                    ], 503);
                }
            } else {
                // Block everyone
                return response()->json([
                    'message' => $settings->maintenance_message ?? 'الموقع في وضع الصيانة. يرجى العودة لاحقاً.'
                ], 503);
            }
        }

        return $next($request);
    }
}
