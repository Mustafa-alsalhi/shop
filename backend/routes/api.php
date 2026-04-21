<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Api\CouponController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

    // Test endpoint for order creation
    Route::get('/test-order', function () {
        return response()->json([
            'message' => 'Order API is working!',
            'database' => 'Connected',
            'timestamp' => now()
        ]);
    });

    // Test endpoint for product images
    Route::get('/test-images', function () {
        $products = \App\Models\Product::take(5)->get(['id', 'name', 'image_url']);
        return response()->json([
            'message' => 'Product images test',
            'products' => $products
        ]);
    });

    // Test endpoint for order items with images
    Route::get('/test-order-items', function () {
        $orderItems = \App\Models\OrderItem::with('product')
            ->take(10)
            ->get(['id', 'product_id', 'product_name', 'quantity', 'price', 'image_url']);
        
        // Transform to ensure proper image URLs
        $orderItems->transform(function ($item) {
            if (!$item->image_url && $item->product) {
                $item->image_url = $item->product->image_url;
            }
            
            // Convert relative URLs to absolute
            if ($item->image_url && str_starts_with($item->image_url, '/')) {
                $item->image_url = url($item->image_url);
            }
            
            return $item;
        });
        
        return response()->json([
            'message' => 'Order items with images test',
            'order_items' => $orderItems
        ]);
    })->middleware('auth:sanctum');

    // Public routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/bestsellers', [ProductController::class, 'bestSellers']);
    Route::get('/products/clothing', [ProductController::class, 'clothing']);
    Route::get('/products/kids', [ProductController::class, 'kids']);
    Route::get('/products/electronics', [ProductController::class, 'electronics']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/{id}/related', [ProductController::class, 'related']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/banners', [BannerController::class, 'getActiveBanners']);

    // Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [AuthController::class, 'getCurrentUser']);
        
        // Profile routes
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        
        // Cart routes
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);
        
        // Wishlist routes
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);
        Route::delete('/wishlist', [WishlistController::class, 'clear']);
        
        // Coupon validation routes (for users)
        Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
        Route::get('/coupons', [CouponController::class, 'userCoupons']);
    });

    // Admin routes
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/products', [AdminController::class, 'products']);
        Route::post('/products', [AdminController::class, 'storeProduct']);
        Route::get('/products/{id}', [AdminController::class, 'getProduct']);
        Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::put('/orders/{id}', [AdminController::class, 'updateOrder']);
        Route::delete('/orders/{id}', [AdminController::class, 'deleteOrder']);
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::post('/categories', [AdminController::class, 'storeCategory']);
        Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);
        
        // Banner management routes
        Route::get('/banners', [BannerController::class, 'index']);
        Route::post('/banners', [BannerController::class, 'store']);
        Route::get('/banners/{id}', [BannerController::class, 'show']);
        Route::put('/banners/{id}', [BannerController::class, 'update']);
        Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
        Route::post('/banners/upload', [BannerController::class, 'uploadImage']);
        
        // Coupon management routes - temporarily disabled
        // Route::get('/coupons', [CouponController::class, 'index']);
        // Route::post('/coupons', [CouponController::class, 'store']);
        // Route::get('/coupons/{id}', [CouponController::class, 'show']);
        // Route::put('/coupons/{id}', [CouponController::class, 'update']);
        // Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);
        // Route::put('/coupons/{id}/toggle', [CouponController::class, 'toggleStatus']);
        // Route::get('/coupons/active', [CouponController::class, 'active']);
        // Route::get('/coupons/statistics', [CouponController::class, 'statistics']);
    });
