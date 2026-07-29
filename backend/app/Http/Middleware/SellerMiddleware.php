<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!$user->isSeller()) {
            return response()->json(['message' => 'Unauthorized. Seller access required.'], 403);
        }

        // التأكد من أن البائع لديه ملف متجر نشط
        if (!$user->seller || !$user->seller->is_verified) {
            return response()->json(['message' => 'Seller account not verified or inactive'], 403);
        }

        return $next($request);
    }
}
