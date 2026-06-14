<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated via Sanctum
        if (!Auth::guard('sanctum')->check()) {
            return response()->json(['message' => 'Unauthorized. Please login first.'], 401);
        }

        // Check if user has admin role
        $user = Auth::guard('sanctum')->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin access required.'], 403);
        }

        return $next($request);
    }
}
