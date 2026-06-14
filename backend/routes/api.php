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

use App\Http\Controllers\Api\MessageController;

use App\Http\Controllers\Api\OfferController;

use App\Http\Controllers\Api\PolicyController;

use App\Http\Controllers\NotificationController;



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

    Route::get('/sellers/top', [ProductController::class, 'topSellers']);
    Route::get('/sellers/{id}', [ProductController::class, 'getSeller']);

    Route::get('/products/clothing', [ProductController::class, 'clothing']);

    Route::get('/products/kids', [ProductController::class, 'kids']);

    Route::get('/products/electronics', [ProductController::class, 'electronics']);

    Route::get('/products/{id}', [ProductController::class, 'show']);

    Route::get('/products/{id}/related', [ProductController::class, 'related']);

    Route::get('/categories', [CategoryController::class, 'index']);

    Route::get('/banners', [BannerController::class, 'getActiveBanners']);



    // Offers routes (Public)
    Route::get('/offers', [OfferController::class, 'active']);
    Route::get('/offers/{id}', [OfferController::class, 'show']);



    // Policies routes (Public)
    Route::get('/policies', [PolicyController::class, 'index']);
    Route::get('/policies/{type}', [PolicyController::class, 'show']);



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

        Route::delete('/cart', [CartController::class, 'clearCart']);

        

        // Wishlist routes

        Route::get('/wishlist', [WishlistController::class, 'index']);

        Route::post('/wishlist', [WishlistController::class, 'store']);

        Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);

        Route::delete('/wishlist', [WishlistController::class, 'clear']);

        

        // Coupon validation routes (for users)

        Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

        Route::get('/coupons', [CouponController::class, 'userCoupons']);

        

        // Orders routes

        Route::get('/orders', [OrderController::class, 'index']);

        Route::post('/orders', [OrderController::class, 'store']);

        Route::get('/orders/{id}', [OrderController::class, 'show']);


        // Chat/Messages routes
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/{userId}', [MessageController::class, 'show']);
        Route::post('/messages', [MessageController::class, 'store']);
        Route::get('/messages/unread/count', [MessageController::class, 'unreadCount']);
        Route::post('/messages/{userId}/mark-read', [MessageController::class, 'markAsRead']);

        // Notifications routes
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/unread', [NotificationController::class, 'unread']);
        Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
        Route::post('/notifications', [NotificationController::class, 'store']);
        
        // Test route for message creation
        Route::get('/test-message', function () {
            $user = \App\Models\User::first();
            if (!$user) {
                return response()->json(['error' => 'No user found'], 404);
            }
            
            $message = \App\Models\Message::create([
                'sender_id' => $user->id,
                'receiver_id' => $user->id,
                'message' => 'Test message from backend',
                'is_read' => false,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'total_messages' => \App\Models\Message::count()
            ]);
        });

    });



    // Public routes for checkout

    Route::get('/shipping-companies/active', [App\Http\Controllers\Admin\ShippingCompanyController::class, 'getActive']);

    Route::get('/payment-methods/active', [App\Http\Controllers\Admin\PaymentMethodController::class, 'getActive']);



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

        Route::get('/orders/{id}', [AdminController::class, 'getOrder']);

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

        

        // Coupon management routes

        Route::get('/coupons', [CouponController::class, 'index']);

        Route::post('/coupons', [CouponController::class, 'store']);

        Route::get('/coupons/{id}', [CouponController::class, 'show']);

        Route::put('/coupons/{id}', [CouponController::class, 'update']);

        Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);

        Route::put('/coupons/{id}/toggle', [CouponController::class, 'toggleStatus']);

        Route::get('/coupons/active', [CouponController::class, 'active']);

        Route::get('/coupons/statistics', [CouponController::class, 'statistics']);

        

        // Shipping Companies management routes

        Route::get('/shipping-companies', [\App\Http\Controllers\Admin\ShippingCompanyController::class, 'index']);

        Route::post('/shipping-companies', [\App\Http\Controllers\Admin\ShippingCompanyController::class, 'store']);

        Route::get('/shipping-companies/{id}', [\App\Http\Controllers\Admin\ShippingCompanyController::class, 'show']);

        Route::put('/shipping-companies/{id}', [\App\Http\Controllers\Admin\ShippingCompanyController::class, 'update']);

        Route::delete('/shipping-companies/{id}', [\App\Http\Controllers\Admin\ShippingCompanyController::class, 'destroy']);

        

        // Payment Methods management routes

        Route::get('/payment-methods', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'index']);

        Route::post('/payment-methods', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'store']);

        Route::get('/payment-methods/{id}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'show']);

        Route::put('/payment-methods/{id}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'update']);

        Route::delete('/payment-methods/{id}', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'destroy']);

        Route::post('/payment-methods/upload-icon', [\App\Http\Controllers\Admin\PaymentMethodController::class, 'uploadIcon']);

        

        // Payment Requests management routes

        Route::get('/payment-requests', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'index']);

        Route::post('/payment-requests', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'store']);

        Route::get('/payment-requests/{id}', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'show']);

        Route::put('/payment-requests/{id}', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'update']);

        Route::delete('/payment-requests/{id}', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'destroy']);

        Route::get('/payment-requests/status/{status}', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'getByStatus']);

        Route::get('/payment-requests/statistics', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'getStatistics']);

        

        // About Us routes

        Route::get('/about-us', [\App\Http\Controllers\Admin\AboutUsController::class, 'index']);

        Route::post('/about-us', [\App\Http\Controllers\Admin\AboutUsController::class, 'store']);

        Route::get('/about-us/{id}', [\App\Http\Controllers\Admin\AboutUsController::class, 'show']);

        Route::put('/about-us/{id}', [\App\Http\Controllers\Admin\AboutUsController::class, 'update']);

        Route::delete('/about-us/{id}', [\App\Http\Controllers\Admin\AboutUsController::class, 'destroy']);

        

        // Contact Us routes

        Route::get('/contact-us', [\App\Http\Controllers\Admin\ContactUsController::class, 'index']);

        Route::post('/contact-us', [\App\Http\Controllers\Admin\ContactUsController::class, 'store']);

        Route::get('/contact-us/{id}', [\App\Http\Controllers\Admin\ContactUsController::class, 'show']);

        Route::put('/contact-us/{id}', [\App\Http\Controllers\Admin\ContactUsController::class, 'update']);

        Route::delete('/contact-us/{id}', [\App\Http\Controllers\Admin\ContactUsController::class, 'destroy']);

        Route::get('/contact-us/statistics', [\App\Http\Controllers\Admin\ContactUsController::class, 'getStatistics']);

        Route::get('/contact-us/status/{status}', [\App\Http\Controllers\Admin\ContactUsController::class, 'getByStatus']);

        Route::put('/contact-us/{id}/mark-read', [\App\Http\Controllers\Admin\ContactUsController::class, 'markAsRead']);

        Route::put('/contact-us/{id}/mark-replied', [\App\Http\Controllers\Admin\ContactUsController::class, 'markAsReplied']);

        Route::put('/contact-us/{id}/mark-closed', [\App\Http\Controllers\Admin\ContactUsController::class, 'markAsClosed']);

        // Seller management routes
        Route::get('/sellers', [AdminController::class, 'getSellers']);
        Route::post('/sellers', [AdminController::class, 'createSeller']);
        Route::get('/sellers/{id}', [AdminController::class, 'getSeller']);
        Route::put('/sellers/{id}', [AdminController::class, 'updateSeller']);
        Route::delete('/sellers/{id}', [AdminController::class, 'deleteSeller']);


        // Offers management routes (Admin)
        Route::get('/offers', [OfferController::class, 'index']);
        Route::post('/offers', [OfferController::class, 'store']);
        Route::get('/offers/{id}', [OfferController::class, 'show']);
        Route::put('/offers/{id}', [OfferController::class, 'update']);
        Route::delete('/offers/{id}', [OfferController::class, 'destroy']);
        Route::post('/offers/{offerId}/products', [OfferController::class, 'addProduct']);
        Route::delete('/offers/{offerId}/products/{productId}', [OfferController::class, 'removeProduct']);
        Route::put('/offers/{offerId}/products/{productId}/price', [OfferController::class, 'updateProductPrice']);


        // Policies management routes (Admin)
        Route::get('/policies', [PolicyController::class, 'index']);
        Route::post('/policies', [PolicyController::class, 'store']);
        Route::get('/policies/{id}', [PolicyController::class, 'show']);
        Route::put('/policies/{id}', [PolicyController::class, 'update']);
        Route::delete('/policies/{id}', [PolicyController::class, 'destroy']);

    });



    // Public Contact Us routes

    Route::post('/contact-us', [\App\Http\Controllers\Admin\ContactUsController::class, 'store']);

    Route::get('/contact-us/statistics', [\App\Http\Controllers\Admin\ContactUsController::class, 'getStatistics']);

