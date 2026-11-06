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

use App\Http\Controllers\Api\NotificationController;

use App\Http\Controllers\Api\SellerCategoryController;

use App\Http\Controllers\Api\SellerOfferController;

use App\Http\Controllers\Api\SellerCouponController;

use App\Http\Controllers\Api\SellerMessageController;

use App\Http\Controllers\Api\SellerReportController;

use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RestaurantController;



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



    // Public routes (with maintenance check)
    Route::middleware(['maintenance'])->group(function () {
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/featured', [ProductController::class, 'featured']);
        Route::get('/products/bestsellers', [ProductController::class, 'bestSellers']);
        Route::get('/sellers/top', [ProductController::class, 'topSellers']);
        Route::get('/sellers/{id}', [ProductController::class, 'getSeller']);
        Route::get('/products/clothing', [ProductController::class, 'clothing']);
        Route::get('/products/sports', [ProductController::class, 'sports']);
        Route::get('/products/electronics', [ProductController::class, 'electronics']);
        Route::get('/products/{id}', [ProductController::class, 'show']);
        Route::get('/products/{id}/related', [ProductController::class, 'related']);
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/homepage', [CategoryController::class, 'getHomepageCategories']);
        Route::get('/restaurant-categories', [CategoryController::class, 'getRestaurantCategories']);
        Route::get('/banners', [BannerController::class, 'getActiveBanners']);

        // Restaurants routes (Public)
        Route::get('/restaurants', [RestaurantController::class, 'index']);
        Route::get('/restaurants/featured', [RestaurantController::class, 'featured']);
        Route::get('/restaurants/meals', [RestaurantController::class, 'popularMeals']);
        Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);

        // Dynamic Activities routes (Public)
        Route::get('/activities', [\App\Http\Controllers\Api\ActivityController::class, 'index']);
        Route::get('/activities/{slug}', [\App\Http\Controllers\Api\ActivityController::class, 'show']);
        Route::get('/activities/{slug}/places', [\App\Http\Controllers\Api\ActivityController::class, 'places']);
        Route::get('/activities/{slug}/categories', [\App\Http\Controllers\Api\ActivityController::class, 'categories']);
        Route::get('/activities/{slug}/popular-items', [\App\Http\Controllers\Api\ActivityController::class, 'popularItems']);
        Route::get('/activities/places/{id}', [\App\Http\Controllers\Api\ActivityController::class, 'placeDetail']);
    });



    // Offers routes (Public)
    Route::middleware(['maintenance'])->group(function () {
        Route::get('/offers', [OfferController::class, 'active']);
        Route::get('/offers/{id}', [OfferController::class, 'show']);
    });



    // Policies routes (Public)
    Route::middleware(['maintenance'])->group(function () {
        Route::get('/policies', [PolicyController::class, 'index']);
        Route::get('/policies/{type}', [PolicyController::class, 'show']);
    });



    // Auth routes
    Route::middleware(['maintenance'])->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/verify-register-otp', [AuthController::class, 'verifyRegisterOtp']);
        Route::post('/resend-register-otp', [AuthController::class, 'resendRegisterOtp']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/verify-login-otp', [AuthController::class, 'verifyLoginOtp']);
        Route::post('/resend-login-otp', [AuthController::class, 'resendLoginOtp']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::post('/seller/register', [AuthController::class, 'registerSeller']); // Optionally authenticated
    });



    // Protected routes

    Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {

        Route::get('/user', [AuthController::class, 'getCurrentUser']);
        // Profile routes

        Route::put('/user/profile', [AuthController::class, 'updateProfile']);

        

        // Cart routes

        Route::get('/cart', [CartController::class, 'index']);

        Route::post('/cart', [CartController::class, 'store']);

        Route::put('/cart/{id}', [CartController::class, 'update']);

        Route::delete('/cart/{id}', [CartController::class, 'destroy']);

        Route::delete('/cart', [CartController::class, 'clearCart']);

        // Review routes
        Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

        // Checkout route for dynamic delivery calculation
        Route::post('/checkout/calculate-delivery', [OrderController::class, 'calculateDelivery']);
        
        // Wishlist routes

        Route::get('/wishlist', [WishlistController::class, 'index']);

        Route::post('/wishlist', [WishlistController::class, 'store']);

        Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);

        Route::delete('/wishlist', [WishlistController::class, 'clear']);

        

        // Coupon validation routes (for users)

        Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);
        Route::post('/coupons/apply', [CouponController::class, 'validateCoupon']);

        Route::get('/coupons', [CouponController::class, 'userCoupons']);

        Route::get('/sellers/{sellerId}/coupons', [CouponController::class, 'sellerCoupons']);

        

        // Orders routes

        Route::get('/orders', [OrderController::class, 'index']);

        Route::post('/orders', [OrderController::class, 'store']);

        Route::get('/orders/{id}', [OrderController::class, 'show']);

        // Reviews route
        Route::post('/products/{id}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store']);


        // Payment requests routes (for users - use admin controller but without admin middleware)
        Route::post('/user/payment-requests', [\App\Http\Controllers\Admin\PaymentRequestController::class, 'store']);


        // Chat/Messages routes
        Route::get('/messages', [MessageController::class, 'index']);
        Route::get('/messages/{userId}', [MessageController::class, 'show']);
        Route::post('/messages', [MessageController::class, 'store']);
        Route::get('/messages/unread/count', [MessageController::class, 'unreadCount']);
        Route::post('/messages/{userId}/mark-read', [MessageController::class, 'markAsRead']);

        // Notifications routes
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('/notifications/unread', [\App\Http\Controllers\NotificationController::class, 'unread']);
        Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);
        Route::post('/notifications', [\App\Http\Controllers\NotificationController::class, 'store']);
        
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

        // Driver management routes (Admin)
        Route::get('/drivers', [\App\Http\Controllers\DriverController::class, 'index']);
        Route::post('/drivers', [\App\Http\Controllers\DriverController::class, 'store']);
        Route::get('/drivers/{id}/statistics', [\App\Http\Controllers\DriverController::class, 'showStatistics']);
        Route::post('/drivers/{id}', [\App\Http\Controllers\DriverController::class, 'update']);
        Route::delete('/drivers/{id}', [\App\Http\Controllers\DriverController::class, 'destroy']);
        Route::post('/orders/{id}/assign-driver', [AdminController::class, 'assignDriver']);
        Route::get('/orders/{id}/smart-drivers', [AdminController::class, 'getSmartDrivers']);

        // Notifications routes (Admin)
        Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'getNotifications']);
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{id}/mark-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);

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

        // Taxes management routes (Admin)
        Route::get('/taxes', [\App\Http\Controllers\Admin\TaxController::class, 'index']);
        Route::post('/taxes', [\App\Http\Controllers\Admin\TaxController::class, 'store']);
        Route::get('/taxes/{id}', [\App\Http\Controllers\Admin\TaxController::class, 'show']);
        Route::put('/taxes/{id}', [\App\Http\Controllers\Admin\TaxController::class, 'update']);
        Route::delete('/taxes/{id}', [\App\Http\Controllers\Admin\TaxController::class, 'destroy']);
        Route::get('/taxes/active', [\App\Http\Controllers\Admin\TaxController::class, 'active']);
        Route::get('/taxes/default', [\App\Http\Controllers\Admin\TaxController::class, 'default']);

        // Settings management routes (Admin)
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index']);
        Route::put('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update']);

        // Activities management routes (Admin)
        Route::get('/activities', [\App\Http\Controllers\Api\ActivityController::class, 'adminIndex']);
        Route::post('/activities', [\App\Http\Controllers\Api\ActivityController::class, 'store']);
        Route::get('/activities/{id}', [\App\Http\Controllers\Api\ActivityController::class, 'adminShow']);
        Route::put('/activities/{id}', [\App\Http\Controllers\Api\ActivityController::class, 'update']);
        Route::delete('/activities/{id}', [\App\Http\Controllers\Api\ActivityController::class, 'destroy']);
        Route::patch('/activities/{id}/toggle', [\App\Http\Controllers\Api\ActivityController::class, 'toggle']);

        // Backup management routes (Admin)
        Route::post('/backups/create', [\App\Http\Controllers\Admin\BackupController::class, 'createBackup']);
        Route::get('/backups', [\App\Http\Controllers\Admin\BackupController::class, 'listBackups']);
        Route::get('/backups/download/{filename}', [\App\Http\Controllers\Admin\BackupController::class, 'downloadBackup']);
        Route::delete('/backups/{filename}', [\App\Http\Controllers\Admin\BackupController::class, 'deleteBackup']);

    });



    // Public Contact Us routes

    Route::post('/contact-us', [\App\Http\Controllers\Admin\ContactUsController::class, 'store']);

    Route::get('/contact-us/statistics', [\App\Http\Controllers\Admin\ContactUsController::class, 'getStatistics']);

    // Public Settings routes
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'publicIndex']);

    // Seller routes (Protected with seller middleware)
    Route::middleware(['auth:sanctum', 'seller'])->prefix('seller')->group(function () {
        // Seller categories routes
        Route::get('/categories', [SellerCategoryController::class, 'index']);
        Route::post('/categories', [SellerCategoryController::class, 'store']);
        Route::get('/categories/{id}', [SellerCategoryController::class, 'show']);
        Route::put('/categories/{id}', [SellerCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [SellerCategoryController::class, 'destroy']);
        Route::put('/categories/order', [SellerCategoryController::class, 'updateOrder']);
        
        // Seller products routes
        Route::get('/products', [ProductController::class, 'sellerProducts']);
        Route::post('/products', [ProductController::class, 'sellerStoreProduct']);
        Route::get('/products/{id}', [ProductController::class, 'sellerGetProduct']);
        Route::put('/products/{id}', [ProductController::class, 'sellerUpdateProduct']);
        Route::delete('/products/{id}', [ProductController::class, 'sellerDeleteProduct']);
        
        // Seller orders routes
        Route::get('/orders', [\App\Http\Controllers\Api\SellerOrderController::class, 'index']);
        Route::get('/orders/{id}', [\App\Http\Controllers\Api\SellerOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [\App\Http\Controllers\Api\SellerOrderController::class, 'updateStatus']);
        Route::get('/statistics', [\App\Http\Controllers\Api\SellerOrderController::class, 'getStatistics']);
        Route::get('/payment-requests', [\App\Http\Controllers\Api\SellerOrderController::class, 'getPaymentRequests']);
        
        // Seller taxes routes
        Route::get('/taxes/active', [\App\Http\Controllers\Admin\TaxController::class, 'active']);
        
        // Notifications routes (Seller)
        Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'getNotifications']);
        Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{id}/mark-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
        
        // Seller settings routes
        Route::get('/settings', [\App\Http\Controllers\Api\SellerOrderController::class, 'getSettings']);
        Route::match(['post', 'put'], '/settings', [\App\Http\Controllers\Api\SellerOrderController::class, 'updateSettings']);
        
        // Seller offers routes
        Route::get('/offers', [SellerOfferController::class, 'index']);
        Route::post('/offers', [SellerOfferController::class, 'store']);
        Route::get('/offers/{id}', [SellerOfferController::class, 'show']);
        Route::put('/offers/{id}', [SellerOfferController::class, 'update']);
        Route::delete('/offers/{id}', [SellerOfferController::class, 'destroy']);
        
        // Seller coupons routes
        Route::get('/coupons', [SellerCouponController::class, 'index']);
        Route::post('/coupons', [SellerCouponController::class, 'store']);
        Route::get('/coupons/{id}', [SellerCouponController::class, 'show']);
        Route::put('/coupons/{id}', [SellerCouponController::class, 'update']);
        Route::delete('/coupons/{id}', [SellerCouponController::class, 'destroy']);
        Route::put('/coupons/{id}/toggle', [SellerCouponController::class, 'toggleStatus']);
        Route::get('/coupons/products', [SellerCouponController::class, 'getProducts']);
        Route::get('/coupons/categories', [SellerCouponController::class, 'getCategories']);
        
        // Test routes without authentication (for debugging)
        Route::get('/test/coupons/products', [SellerCouponController::class, 'getProducts']);
        Route::get('/test/coupons/categories', [SellerCouponController::class, 'getCategories']);
        
        // Seller chat routes
        Route::get('/messages', [SellerMessageController::class, 'index']);
        Route::get('/messages/{customerId}', [SellerMessageController::class, 'show']);
        Route::post('/messages', [SellerMessageController::class, 'store']);
        Route::get('/messages/unread/count', [SellerMessageController::class, 'unreadCount']);
        Route::post('/messages/{customerId}/mark-read', [SellerMessageController::class, 'markAsRead']);
        
        // Seller reports routes
        Route::get('/reports/kpis', [SellerReportController::class, 'getKPIs']);
        Route::get('/reports/sales-trends', [SellerReportController::class, 'getSalesTrends']);
        Route::get('/reports/top-products', [SellerReportController::class, 'getTopSellingProducts']);
        Route::get('/reports/low-stock', [SellerReportController::class, 'getLowStockAlerts']);
        Route::get('/reports/comprehensive', [SellerReportController::class, 'getComprehensiveReport']);
    });

    // Driver routes (Protected with driver middleware)
    Route::middleware(['auth:sanctum', 'driver'])->prefix('driver')->group(function () {
        Route::get('/orders', [DriverController::class, 'getOrders']);
        Route::get('/orders/completed', [DriverController::class, 'getCompletedOrders']);
        Route::get('/orders/{id}', [DriverController::class, 'getOrderDetails']);
        Route::patch('/orders/{id}/status', [DriverController::class, 'updateOrderStatus']);
        
        // Driver Profile and Status updates
        Route::get('/profile', [\App\Http\Controllers\DriverController::class, 'getProfile']);
        Route::put('/profile/status', [\App\Http\Controllers\DriverController::class, 'updateStatus']);
        Route::put('/profile/location', [\App\Http\Controllers\DriverController::class, 'updateLocation']);
        
        // Driver Settings and KYC
        Route::get('/settings', [\App\Http\Controllers\DriverController::class, 'getDriverProfile']);
        Route::post('/settings', [\App\Http\Controllers\DriverController::class, 'updateDriverProfile']);
        
        // Nearby Stores Map
        Route::get('/nearby-stores', [DriverController::class, 'getNearbyStores']);

        // Dashboard Statistics
        Route::get('/statistics', [DriverController::class, 'getStatistics']);
    });

