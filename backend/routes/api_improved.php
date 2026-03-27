<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the api middleware group. Make something great!
|
*/

// Add CORS headers to all API responses
Route::options('{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-XSRF-Token, Accept, Origin')
        ->header('Access-Control-Max-Age', '86400');
})->where('any', '.*');

// Public API routes
Route::group(['middleware' => ['api']], function () {
    
    // Products
    Route::get('/products', [App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('/products/featured', [App\Http\Controllers\Api\ProductController::class, 'featured']);
    Route::get('/products/{id}', [App\Http\Controllers\Api\ProductController::class, 'show']);
    Route::get('/products/category/{category}', [App\Http\Controllers\Api\ProductController::class, 'byCategory']);
    
    // Categories
    Route::get('/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::get('/categories/{id}', [App\Http\Controllers\Api\CategoryController::class, 'show']);
    
    // Authentication
    Route::post('/register', [App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);
    
    // Protected routes (require authentication)
    Route::middleware('auth:api')->group(function () {
        
        // User profile
        Route::get('/user/profile', [App\Http\Controllers\Api\UserController::class, 'profile']);
        Route::put('/user/profile', [App\Http\Controllers\Api\UserController::class, 'update']);
        
        // Cart
        Route::get('/cart', [App\Http\Controllers\Api\CartController::class, 'index']);
        Route::post('/cart/add', [App\Http\Controllers\Api\CartController::class, 'add']);
        Route::put('/cart/update', [App\Http\Controllers\Api\CartController::class, 'update']);
        Route::delete('/cart/remove', [App\Http\Controllers\Api\CartController::class, 'remove']);
        Route::delete('/cart/clear', [App\Http\Controllers\Api\CartController::class, 'clear']);
        
        // Wishlist
        Route::get('/wishlist', [App\Http\Controllers\Api\WishlistController::class, 'index']);
        Route::post('/wishlist/add', [App\Http\Controllers\Api\WishlistController::class, 'add']);
        Route::delete('/wishlist/remove', [App\Http\Controllers\Api\WishlistController::class, 'remove']);
        
        // Orders
        Route::get('/orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::post('/orders', [App\Http\Controllers\Api\OrderController::class, 'store']);
        Route::get('/orders/{id}', [App\Http\Controllers\Api\OrderController::class, 'show']);
        
        // Reviews
        Route::post('/products/{id}/reviews', [App\Http\Controllers\Api\ReviewController::class, 'store']);
        Route::put('/reviews/{id}', [App\Http\Controllers\Api\ReviewController::class, 'update']);
        Route::delete('/reviews/{id}', [App\Http\Controllers\Api\ReviewController::class, 'destroy']);
    });
    
    // Admin routes (require admin role)
    Route::middleware(['auth:api', 'admin'])->prefix('/admin')->group(function () {
        
        // Dashboard
        Route::get('/dashboard', [App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
        
        // Products management
        Route::get('/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'index']);
        Route::post('/products', [App\Http\Controllers\Api\Admin\ProductController::class, 'store']);
        Route::put('/products/{id}', [App\Http\Controllers\Api\Admin\ProductController::class, 'update']);
        Route::delete('/products/{id}', [App\Http\Controllers\Api\Admin\ProductController::class, 'destroy']);
        
        // Categories management
        Route::get('/categories', [App\Http\Controllers\Api\Admin\CategoryController::class, 'index']);
        Route::post('/categories', [App\Http\Controllers\Api\Admin\CategoryController::class, 'store']);
        Route::put('/categories/{id}', [App\Http\Controllers\Api\Admin\CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy']);
        
        // Orders management
        Route::get('/orders', [App\Http\Controllers\Api\Admin\OrderController::class, 'index']);
        Route::get('/orders/{id}', [App\Http\Controllers\Api\Admin\OrderController::class, 'show']);
        Route::put('/orders/{id}/status', [App\Http\Controllers\Api\Admin\OrderController::class, 'updateStatus']);
        
        // Users management
        Route::get('/users', [App\Http\Controllers\Api\Admin\UserController::class, 'index']);
        Route::get('/users/{id}', [App\Http\Controllers\Api\Admin\UserController::class, 'show']);
        Route::put('/users/{id}', [App\Http\Controllers\Api\Admin\UserController::class, 'update']);
        Route::delete('/users/{id}', [App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
    });
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
        'environment' => app()->environment(),
    ])->header('Access-Control-Allow-Origin', '*');
});

// Test endpoint for CORS
Route::get('/test-cors', function () {
    return response()->json([
        'message' => 'CORS test successful!',
        'timestamp' => now()->toISOString(),
        'origin' => request()->header('Origin'),
        'method' => request()->method(),
    ])->header('Access-Control-Allow-Origin', '*');
});
