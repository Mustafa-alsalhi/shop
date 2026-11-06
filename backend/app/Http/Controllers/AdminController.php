<?php



namespace App\Http\Controllers;



use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use Illuminate\Support\Str;



class AdminController extends Controller
{

    public function __construct()
    {

        $this->middleware(['auth:sanctum', 'admin']);

    }



    public function dashboard()
    {
        try {
            $now = now();
            $today = clone $now;
            $today->startOfDay();
            $thisWeek = clone $now;
            $thisWeek->startOfWeek();
            $thisMonth = clone $now;
            $thisMonth->startOfMonth();
            $thisYear = clone $now;
            $thisYear->startOfYear();

            // Store wide stats
            $totalProducts = \App\Models\Product::count();
            $totalOrders = \App\Models\Order::count();
            $totalUsers = \App\Models\User::count();
            $totalCategories = \App\Models\Category::count();
            $totalSellers = \App\Models\Seller::where('status', 'active')->count();

            // إحصائيات منفصلة: المتاجر vs المطاعم
            $storesCount = \App\Models\Seller::where(function($q){ $q->where('type', 'store')->orWhereNull('type'); })->count();
            $restaurantsCount = \App\Models\Seller::where('type', 'restaurant')->count();
            
            $storeProductsCount = \App\Models\Product::whereHas('seller', function($q){
                $q->where('type', 'store')->orWhereNull('type');
            })->count();
            $restaurantMealsCount = \App\Models\Product::whereHas('seller', function($q){
                $q->where('type', 'restaurant');
            })->count();

            $restaurantOrdersCount = \App\Models\Order::whereHas('items.product.seller', function($q){
                $q->where('type', 'restaurant');
            })->count();
            $storeOrdersCount = $totalOrders - $restaurantOrdersCount;

            $restaurantRevenue = \App\Models\Order::whereHas('items.product.seller', function($q){
                $q->where('type', 'restaurant');
            })->sum('total_amount') ?? 0;
            $storeRevenue = (\App\Models\Order::sum('total_amount') ?? 0) - $restaurantRevenue;

            // Store Revenue stats
            $todayOrders = \App\Models\Order::where('created_at', '>=', $today)->count();
            $thisWeekOrders = \App\Models\Order::where('created_at', '>=', $thisWeek)->count();
            $thisMonthOrders = \App\Models\Order::where('created_at', '>=', $thisMonth)->count();
            $thisYearOrders = \App\Models\Order::where('created_at', '>=', $thisYear)->count();

            // Using total_amount for admin, representing the full cash flow of the store orders
            $todayRevenue = \App\Models\Order::where('created_at', '>=', $today)->sum('total_amount') ?? 0;
            $thisWeekRevenue = \App\Models\Order::where('created_at', '>=', $thisWeek)->sum('total_amount') ?? 0;
            $thisMonthRevenue = \App\Models\Order::where('created_at', '>=', $thisMonth)->sum('total_amount') ?? 0;
            $thisYearRevenue = \App\Models\Order::where('created_at', '>=', $thisYear)->sum('total_amount') ?? 0;
            $totalRevenue = \App\Models\Order::sum('total_amount') ?? 0;

            // Pending orders
            $pendingOrdersCount = \App\Models\Order::where('status', 'pending')->count();

            // Top selling products
            $topSellingProducts = [];
            try {
                $topSellingProducts = \App\Models\OrderItem::select(
                    'product_id',
                    \DB::raw('SUM(quantity) as total_sales'),
                    \DB::raw('SUM(quantity * price) as total_revenue')
                )
                    ->with(['product:id,name,seller_id', 'product.seller:id,store_name'])
                    ->whereHas('product')
                    ->groupBy('product_id')
                    ->orderBy('total_sales', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'name' => $item->product ? $item->product->name : 'منتج غير معروف',
                            'seller_name' => ($item->product && $item->product->seller) ? $item->product->seller->store_name : '-',
                            'sales' => $item->total_sales ?? 0,
                            'revenue' => $item->total_revenue ?? 0
                        ];
                    });
            } catch (\Exception $e) {
            }

            // Sellers Performance Table
            $sellersPerformance = [];
            try {
                // Fetch all active sellers and join with products and order_items
                $sellers = \App\Models\Seller::where('status', 'active')->get();
                foreach ($sellers as $seller) {
                    $sellerItems = \App\Models\OrderItem::whereHas('product', function ($q) use ($seller) {
                        $q->where('seller_id', $seller->id);
                    });

                    // Count DISTINCT orders that this seller fulfilled
                    $sellerCompletedOrdersQuery = (clone $sellerItems)->whereHas('order', function ($q) {
                        $q->where('status', 'delivered');
                    });

                    $sellerTotalOrders = (clone $sellerItems)->distinct('order_id')->count('order_id');
                    $sellerCompletedOrders = (clone $sellerCompletedOrdersQuery)->distinct('order_id')->count('order_id');

                    // Seller specific revenue (quantity * price of their items)
                    $sellerTotalSales = (clone $sellerItems)->sum(\DB::raw('price * quantity'));
                    $sellerTodaySales = (clone $sellerItems)->where('created_at', '>=', $today)->sum(\DB::raw('price * quantity'));
                    $sellerWeekSales = (clone $sellerItems)->where('created_at', '>=', $thisWeek)->sum(\DB::raw('price * quantity'));
                    $sellerMonthSales = (clone $sellerItems)->where('created_at', '>=', $thisMonth)->sum(\DB::raw('price * quantity'));

                    // Fetch the actual completed order lists for modal display
                    $completedOrderIds = (clone $sellerCompletedOrdersQuery)->distinct()->pluck('order_id');
                    $completedOrdersDetails = \App\Models\Order::with('user:id,name,first_name,last_name')
                        ->whereIn('id', $completedOrderIds)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($order) {
                            return [
                                'id' => $order->id,
                                'order_number' => $order->order_number ?? $order->id,
                                'customer_name' => $order->user ? ($order->user->first_name . ' ' . $order->user->last_name) : 'عميل غير معروف',
                                'total_amount' => $order->total_amount ?? 0,
                                'created_at' => $order->created_at ? $order->created_at->format('Y-m-d') : 'N/A'
                            ];
                        });

                    $sellersPerformance[] = [
                        'id' => $seller->id,
                        'store_name' => $seller->store_name,
                        'total_orders' => $sellerTotalOrders,
                        'completed_orders' => $sellerCompletedOrders,
                        'completed_orders_details' => $completedOrdersDetails,
                        'today_sales' => $sellerTodaySales ?: 0,
                        'week_sales' => $sellerWeekSales ?: 0,
                        'month_sales' => $sellerMonthSales ?: 0,
                        'total_sales' => $sellerTotalSales ?: 0,
                    ];
                }

                // Sort by total sales descending
                usort($sellersPerformance, function ($a, $b) {
                    return $b['total_sales'] <=> $a['total_sales'];
                });
            } catch (\Exception $e) {
                \Log::error('Seller performance error: ' . $e->getMessage());
            }

            // Recent orders
            $recentOrders = [];
            try {
                $recentOrders = \App\Models\Order::with(['user:id,name,first_name,last_name'])
                    ->orderBy('created_at', 'desc')
                    ->limit(6)
                    ->get()
                    ->map(function ($order) {
                        return [
                            'id' => $order->id,
                            'order_number' => $order->order_number ?? $order->id,
                            'customer_name' => $order->user ? ($order->user->first_name . ' ' . $order->user->last_name) : 'عميل غير معروف',
                            'total' => $order->total_amount ?? 0,
                            'status' => $order->status ?? 'unknown',
                            'created_at' => $order->created_at ? $order->created_at->format('Y-m-d') : 'N/A'
                        ];
                    });
            } catch (\Exception $e) {
                \Log::error('Recent orders error: ' . $e->getMessage());
            }

            // Out of stock
            $outOfStockProducts = \App\Models\Product::with('category')
                ->where('stock', '<=', 0)->orWhereNull('stock')
                ->orderBy('name')
                ->limit(5)->get();

            return response()->json([
                'stats' => [
                    'total_products' => $totalProducts,
                    'total_orders' => $totalOrders,
                    'total_users' => $totalUsers,
                    'total_categories' => $totalCategories,
                    'total_sellers' => $totalSellers,
                    'stores' => [
                        'count' => $storesCount,
                        'products_count' => $storeProductsCount,
                        'orders_count' => $storeOrdersCount,
                        'revenue' => $storeRevenue,
                    ],
                    'restaurants' => [
                        'count' => $restaurantsCount,
                        'meals_count' => $restaurantMealsCount,
                        'orders_count' => $restaurantOrdersCount,
                        'revenue' => $restaurantRevenue,
                    ],

                    'total_revenue' => $totalRevenue,
                    'today_orders' => $todayOrders,
                    'today_revenue' => $todayRevenue,
                    'this_week_orders' => $thisWeekOrders,
                    'this_week_revenue' => $thisWeekRevenue,
                    'this_month_orders' => $thisMonthOrders,
                    'this_month_revenue' => $thisMonthRevenue,
                    'this_year_orders' => $thisYearOrders,
                    'this_year_revenue' => $thisYearRevenue,

                    'pending_orders' => $pendingOrdersCount,
                ],
                'top_selling_products' => $topSellingProducts,
                'recent_orders' => $recentOrders,
                'out_of_stock_products' => $outOfStockProducts,
                'sellers_performance' => $sellersPerformance
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard error occurred: ' . $e->getMessage());
            return response()->json([
                'message' => 'Dashboard error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function users()
    {

        $users = \App\Models\User::orderBy('created_at', 'desc')->paginate(10);

        return response()->json($users);

    }



    public function products(Request $request)
    {

        $query = \App\Models\Product::with('category');



        // Filter by category

        if ($request->has('category')) {

            $categoryId = $request->input('category');

            if (!empty($categoryId)) {

                $query->where('category_id', $categoryId);

            }

        }



        // Filter by status

        if ($request->has('status')) {

            $status = $request->input('status');

            switch ($status) {

                case 'active':

                    $query->where('is_active', true);

                    break;

                case 'inactive':

                    $query->where('is_active', false);

                    break;

                case 'draft':

                    $query->where('is_active', false);

                    break;

                case 'featured':

                    $query->where('is_featured', true);

                    break;

            }

        }



        // Search

        if ($request->has('search')) {

            $search = $request->input('search');

            $query->where(function ($q) use ($search) {

                $q->where('name', 'like', '%' . $search . '%')

                    ->orWhere('description', 'like', '%' . $search . '%');

            });

        }



        // Order by created_at desc by default

        $products = $query->orderBy('created_at', 'desc')->get();



        return response()->json($products);

    }



    public function storeProduct(Request $request)
    {

        try {

            // Handle variants before validation since it comes as JSON string

            $variants = null;

            if ($request->has('variants')) {

                if (is_string($request->variants)) {

                    $variants = json_decode($request->variants, true) ?: [];

                } elseif (is_array($request->variants)) {

                    $variants = $request->variants;

                }

            }



            $validated = $request->validate([

                'name' => 'required|string|max:255',

                'description' => 'nullable|string',

                'detailed_description' => 'nullable|string',

                'price' => 'required|numeric|min:0',

                'sale_price' => 'nullable|numeric|min:0',

                'currency' => 'required|string|max:3',

                'condition' => 'required|in:new,used,refurbished',

                'sale_start_date' => 'nullable|date',

                'sale_end_date' => 'nullable|date',

                'stock' => 'required|integer|min:0',

                'sku' => 'nullable|string|max:100',

                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => [
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->filled('category_id')) {
                            $hasChildren = \App\Models\Category::where('parent_id', $request->category_id)->exists();
                            if ($hasChildren && empty($value)) {
                                $fail('الفئة الفرعية مطلوبة لأن الفئة الرئيسية المختارة تحتوي على أقسام فرعية.');
                            }
                            if (!empty($value)) {
                                $validSub = \App\Models\Category::where('id', $value)->where('parent_id', $request->category_id)->exists();
                                if (!$validSub) {
                                    $fail('الفئة الفرعية المختارة غير صالحة أو لا تتبع الفئة الرئيسية.');
                                }
                            }
                        }
                    }
                ],

                'seller_id' => 'nullable|exists:sellers,id',

                'tax_id' => 'nullable|exists:taxes,id',

                'is_active' => 'sometimes|boolean',

                'is_featured' => 'sometimes|boolean',

                'image_url' => 'nullable|string',

                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

                'gallery_images' => 'nullable|array',

                'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'

            ]);



            // Add variants back to validated data
            $validated['variants'] = $variants;

            if ($request->filled('subcategory_id')) {
                $validated['category_id'] = $request->subcategory_id;
            }



            // Generate slug from name

            $validated['slug'] = Str::slug($validated['name']);



            // Handle seller data - save seller info with product

            if (!empty($validated['seller_id'])) {

                $seller = \App\Models\Seller::find($validated['seller_id']);

                if ($seller) {

                    $validated['seller_name'] = $seller->store_name;

                    $validated['seller_avatar'] = $seller->avatar;

                    $validated['seller_rating'] = $seller->rating;

                    $validated['seller_reviews_count'] = $seller->reviews_count;



                    \Log::info('Seller data attached to product:', [

                        'seller_id' => $seller->id,

                        'seller_name' => $seller->store_name,

                        'seller_avatar' => $seller->avatar

                    ]);

                }

            }



            // Handle main image upload

            if ($request->hasFile('image_file')) {

                $image = $request->file('image_file');

                $imageName = time() . '.' . $image->getClientOriginalExtension();

                $image->move(public_path('images/products'), $imageName);

                $validated['image_url'] = '/images/products/' . $imageName;

            } elseif (!empty($validated['image_url'])) {

                // Keep image_url if provided and it's a valid URL

                if (!filter_var($validated['image_url'], FILTER_VALIDATE_URL)) {

                    $validated['image_url'] = 'assets/images/default-product.png';

                }

            } else {
                $validated['image_url'] = 'assets/images/default-product.png';
            }



            // Handle gallery images upload - fix for Laravel file handling

            $galleryPaths = [];



            // Check for gallery_images files with different naming patterns

            $galleryFiles = [];



            // Try to get files as array first

            if ($request->hasFile('gallery_images')) {

                $galleryFiles = $request->file('gallery_images');

            } else {

                // Try to get individual files (gallery_images_0, gallery_images_1, etc.)

                for ($i = 0; $i < 10; $i++) {

                    $fileName = 'gallery_images_' . $i;

                    if ($request->hasFile($fileName)) {

                        $galleryFiles[] = $request->file($fileName);

                    }

                }

            }



            // Process all found gallery files

            if (!empty($galleryFiles)) {

                foreach ($galleryFiles as $index => $galleryImage) {

                    if ($galleryImage && $galleryImage->isValid()) {

                        $galleryName = time() . '_' . $index . '.' . $galleryImage->getClientOriginalExtension();

                        $galleryImage->move(public_path('images/products/gallery'), $galleryName);

                        $galleryPaths[] = '/images/products/gallery/' . $galleryName;

                    }

                }

                $validated['gallery_images'] = $galleryPaths;

            }



            // Remove only file fields from validated data (keep gallery_images paths)

            unset($validated['image_file']);



            \Log::info('Final validated data before creating product:', [

                'gallery_images' => $validated['gallery_images'] ?? 'not_set',

                'all_validated' => array_keys($validated)

            ]);



            if (empty($validated['sku'])) {
                $validated['sku'] = 'SKU-' . strtoupper(\Illuminate\Support\Str::random(8)) . '-' . time();
            }

            $product = \App\Models\Product::create($validated);



            \Log::info('Product created with gallery_images:', [

                'product_id' => $product->id,

                'gallery_images_from_db' => $product->gallery_images

            ]);



            return response()->json($product, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        }

    }



    public function updateProduct(Request $request, $id)
    {

        $product = \App\Models\Product::findOrFail($id);



        try {

            // Handle variants before validation since it comes as JSON string

            $variants = null;

            if ($request->has('variants')) {

                if (is_string($request->variants)) {

                    $variants = json_decode($request->variants, true) ?: [];

                } elseif (is_array($request->variants)) {

                    $variants = $request->variants;

                }

            }



            $validated = $request->validate([

                'name' => 'required|string|max:255',

                'description' => 'nullable|string',

                'detailed_description' => 'nullable|string',

                'price' => 'required|numeric|min:0',

                'sale_price' => 'nullable|numeric|min:0',

                'currency' => 'required|string|max:3',

                'condition' => 'required|in:new,used,refurbished',

                'sale_start_date' => 'nullable|date',

                'sale_end_date' => 'nullable|date',

                'stock' => 'required|integer|min:0',

                'sku' => 'nullable|string|max:100',

                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => [
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->filled('category_id')) {
                            $hasChildren = \App\Models\Category::where('parent_id', $request->category_id)->exists();
                            if ($hasChildren && empty($value)) {
                                $fail('الفئة الفرعية مطلوبة لأن الفئة الرئيسية المختارة تحتوي على أقسام فرعية.');
                            }
                            if (!empty($value)) {
                                $validSub = \App\Models\Category::where('id', $value)->where('parent_id', $request->category_id)->exists();
                                if (!$validSub) {
                                    $fail('الفئة الفرعية المختارة غير صالحة أو لا تتبع الفئة الرئيسية.');
                                }
                            }
                        }
                    }
                ],

                'seller_id' => 'nullable|exists:sellers,id',

                'tax_id' => 'nullable|exists:taxes,id',

                'is_active' => 'sometimes|boolean',

                'is_featured' => 'sometimes|boolean',

                'image_url' => 'nullable|string',

                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

                'gallery_images' => 'nullable|array',

                'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'

            ]);



            // Add variants back to validated data
            $validated['variants'] = $variants;

            if ($request->filled('subcategory_id')) {
                $validated['category_id'] = $request->subcategory_id;
            }



            // Convert empty tax_id to null

            if (isset($validated['tax_id']) && $validated['tax_id'] === '') {

                $validated['tax_id'] = null;

            }



            // Generate slug from name if name changed

            if ($validated['name'] !== $product->name) {

                $validated['slug'] = Str::slug($validated['name']);

            }



            // Handle seller data - update seller info with product

            if (isset($validated['seller_id'])) {

                if (!empty($validated['seller_id'])) {

                    $seller = \App\Models\Seller::find($validated['seller_id']);

                    if ($seller) {

                        $validated['seller_name'] = $seller->store_name;

                        $validated['seller_avatar'] = $seller->avatar;

                        $validated['seller_rating'] = $seller->rating;

                        $validated['seller_reviews_count'] = $seller->reviews_count;



                        \Log::info('Seller data updated for product:', [

                            'product_id' => $product->id,

                            'seller_id' => $seller->id,

                            'seller_name' => $seller->store_name

                        ]);

                    }

                } else {

                    // Clear seller data if seller_id is set to null/empty

                    $validated['seller_name'] = null;

                    $validated['seller_avatar'] = null;

                    $validated['seller_rating'] = null;

                    $validated['seller_reviews_count'] = null;

                }

            }



            // Handle main image upload

            if ($request->hasFile('image_file')) {

                $image = $request->file('image_file');

                $imageName = time() . '.' . $image->getClientOriginalExtension();

                $image->move(public_path('images/products'), $imageName);

                $validated['image_url'] = '/images/products/' . $imageName;

            } elseif (!empty($validated['image_url'])) {

                // Keep image_url if provided and it's a valid URL

                if (!filter_var($validated['image_url'], FILTER_VALIDATE_URL)) {

                    unset($validated['image_url']);

                }

            }



            // Handle gallery images upload - fix for Laravel file handling

            $galleryPaths = [];



            // Check for gallery_images files with different naming patterns

            $galleryFiles = [];



            // Try to get files as array first

            if ($request->hasFile('gallery_images')) {

                $galleryFiles = $request->file('gallery_images');

            } else {

                // Try to get individual files (gallery_images_0, gallery_images_1, etc.)

                for ($i = 0; $i < 10; $i++) {

                    $fileName = 'gallery_images_' . $i;

                    if ($request->hasFile($fileName)) {

                        $galleryFiles[] = $request->file($fileName);

                    }

                }

            }



            // Process all found gallery files

            if (!empty($galleryFiles)) {

                foreach ($galleryFiles as $index => $galleryImage) {

                    if ($galleryImage && $galleryImage->isValid()) {

                        $galleryName = time() . '_' . $index . '.' . $galleryImage->getClientOriginalExtension();

                        $galleryImage->move(public_path('images/products/gallery'), $galleryName);

                        $galleryPaths[] = '/images/products/gallery/' . $galleryName;

                    }

                }

                $validated['gallery_images'] = $galleryPaths;

            }



            // Remove only file fields from validated data (keep gallery_images paths)

            unset($validated['image_file']);



            \Log::info('Final validated data before updating product:', [

                'gallery_images' => $validated['gallery_images'] ?? 'not_set',

                'all_validated' => array_keys($validated),

                'tax_id' => $validated['tax_id'] ?? 'not_set',

                'tax_id_value' => isset($validated['tax_id']) ? ($validated['tax_id'] === null ? 'null' : $validated['tax_id']) : 'not_set'

            ]);



            $product->update($validated);



            \Log::info('Product updated with gallery_images:', [

                'product_id' => $product->id,

                'gallery_images_from_db' => $product->gallery_images

            ]);



            return response()->json($product);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        }

    }



    public function deleteProduct($id)
    {

        $product = \App\Models\Product::findOrFail($id);

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);

    }



    public function getProduct($id)
    {

        $product = \App\Models\Product::with('category', 'tax')->findOrFail($id);

        return response()->json($product);

    }



    public function orders()
    {
        $orders = \App\Models\Order::with(['user', 'driver', 'items.product.seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(100);
        return response()->json($orders);
    }

    public function getOrder($id)
    {
        try {
            $order = \App\Models\Order::with(['user', 'driver', 'items.product.seller'])->findOrFail($id);
            // Fetch payment requests for this order
            $paymentRequests = \App\Models\PaymentRequest::where('order_id', $order->id)->get();
            $orderArray = $order->toArray();
            $orderArray['payment_requests'] = $paymentRequests;

            return response()->json(['data' => $orderArray]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error fetching order: ' . $e->getMessage()], 500);
        }
    }



    public function categories()
    {
        $categories = \App\Models\Category::with('parent')->orderBy('name')->get();
        return response()->json($categories);
    }



    public function storeCategory(Request $request)
    {

        try {

            $validated = $request->validate([

                'name' => 'required|string|max:255|unique:categories,name',

                'type' => 'nullable|string|max:50',

                'description' => 'nullable|string',

                'detailed_description' => 'nullable|string',

                'image_url' => 'nullable|string',

                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

                'show_on_homepage' => 'sometimes|boolean',
                'sort_order' => 'sometimes|integer|min:0',
                'parent_id' => 'nullable|exists:categories,id'

            ]);

            $validated['type'] = $request->input('type', 'store');



            // Generate slug from name

            $validated['slug'] = Str::slug($validated['name']);



            // Handle image upload

            if ($request->hasFile('image_file')) {

                $image = $request->file('image_file');

                $imageName = time() . '.' . $image->getClientOriginalExtension();

                $image->move(storage_path('app/public/images/categories'), $imageName);

                $validated['image'] = $imageName; // Store just the filename

                $validated['image_url'] = '/images/categories/' . $imageName;

            }



            // Remove image_file from validated data

            unset($validated['image_file']);



            $category = \App\Models\Category::create($validated);

            return response()->json($category, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        }

    }



    public function updateCategory(Request $request, $id)
    {

        try {

            $category = \App\Models\Category::findOrFail($id);



            $validated = $request->validate([

                'name' => 'required|string|max:255|unique:categories,name,' . $id,

                'type' => 'nullable|string|max:50',

                'description' => 'nullable|string',

                'detailed_description' => 'nullable|string',

                'image_url' => 'nullable|string',

                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

                'show_on_homepage' => 'sometimes|boolean',
                'sort_order' => 'sometimes|integer|min:0',
                'parent_id' => 'nullable|exists:categories,id'

            ]);

            if ($request->has('type')) {
                $validated['type'] = $request->input('type');
            }



            // Generate slug from name if name changed

            if ($validated['name'] !== $category->name) {

                $validated['slug'] = Str::slug($validated['name']);

            }



            // Handle image upload

            if ($request->hasFile('image_file')) {

                $image = $request->file('image_file');

                $imageName = time() . '.' . $image->getClientOriginalExtension();

                $image->move(storage_path('app/public/images/categories'), $imageName);

                $validated['image'] = $imageName; // Store just the filename

                $validated['image_url'] = '/images/categories/' . $imageName;

            } elseif (!empty($validated['image_url'])) {

                // Keep image_url if provided and it's a valid URL

                if (!filter_var($validated['image_url'], FILTER_VALIDATE_URL)) {

                    unset($validated['image_url']);

                }

            }



            // Remove image_file from validated data

            unset($validated['image_file']);



            $category->update($validated);

            return response()->json($category);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        }

    }



    public function storeUser(Request $request)
    {

        try {

            $validated = $request->validate([

                'name' => 'required|string|max:255',

                'email' => 'required|email|unique:users,email',

                'password' => 'required|string|min:6',

                'phone' => 'nullable|string|max:20',

                'role' => 'required|string|max:50|in:user,admin,seller,driver'

            ]);



            // Create user with hashed password

            $user = \App\Models\User::create([

                'name' => $validated['name'],

                'email' => $validated['email'],

                'password' => bcrypt($validated['password']),

                'phone' => $validated['phone'] ?? null,

                'role' => $validated['role'],

                'email_verified_at' => null

            ]);



            return response()->json([

                'success' => true,

                'user' => $user,

                'message' => 'User created successfully'

            ], 201);



        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'success' => false,

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Database error: ' . $e->getMessage()

            ], 500);

        }

    }



    public function getUser($id)
    {

        $user = \App\Models\User::findOrFail($id);

        return response()->json($user);

    }



    public function updateUser(Request $request, $id)
    {

        try {

            $user = \App\Models\User::findOrFail($id);



            // Simple validation with proper length limits

            $validated = $request->validate([

                'name' => 'required|string|max:255',

                'email' => 'required|email|max:255',

                'phone' => 'nullable|string|max:20',

                'role' => 'required|string|max:50|in:user,admin,seller,driver'

            ]);



            // Ensure role is properly trimmed

            $validated['role'] = trim($validated['role']);



            // Direct update with explicit field assignment

            $user->name = $validated['name'];

            $user->email = $validated['email'];

            $user->phone = $validated['phone'] ?? $user->phone;

            $user->role = $validated['role'];

            $user->save();



            return response()->json([

                'success' => true,

                'user' => $user,

                'message' => 'User updated successfully'

            ]);



        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'success' => false,

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Database error: ' . $e->getMessage()

            ], 500);

        }

    }



    public function updateOrder(Request $request, $id)
    {

        try {

            $order = \App\Models\Order::findOrFail($id);



            $validated = $request->validate([

                'status' => 'required|in:pending,processing,shipped,delivered,cancelled'

            ]);



            $order->update($validated);

            return response()->json($order);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        }

    }



    public function deleteOrder($id)
    {

        $order = \App\Models\Order::findOrFail($id);

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);

    }



    // Seller Management Functions

    public function getSellers()
    {
        try {
            $sellers = \App\Models\Seller::with('user')->get()->map(function ($seller) {
                $productsCount = \App\Models\Product::where('seller_id', $seller->id)->count();
                $ordersCount = \App\Models\Order::whereHas('items.product', function ($q) use ($seller) {
                    $q->where('seller_id', $seller->id);
                })->count();

                $seller->products_count = $productsCount;
                $seller->orders_count = $ordersCount;
                $seller->type = $seller->type ?: 'store';
                return $seller;
            });

            return response()->json($sellers);
        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Error fetching sellers: ' . $e->getMessage()

            ], 500);

        }

    }



    public function getSeller($id)
    {

        try {

            $seller = \App\Models\Seller::findOrFail($id);

            // Get real product data for this seller
            $products = \App\Models\Product::where('seller_id', $seller->id)->get();

            // Calculate real metrics
            $totalSales = $products->sum('sold_count') ?? 0;

            // Use seller's existing rating and reviews_count from database
            $avgRating = $seller->rating ?? 0;
            $reviewsCount = $seller->reviews_count ?? 0;

            // Build seller data with real metrics
            $sellerData = [
                'id' => $seller->id,
                'store_name' => $seller->store_name,
                'description' => $seller->description,
                'avatar' => $seller->avatar,
                'is_verified' => $seller->is_verified,
                'status' => $seller->status,
                'rating' => round($avgRating, 1),
                'reviews_count' => $reviewsCount,
                'total_products' => $products->count(),
                'total_sales' => $totalSales,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,
            ];

            return response()->json([
                'data' => $sellerData,
                'message' => 'Seller fetched successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {

            return response()->json([

                'success' => false,

                'message' => 'Seller not found'

            ], 404);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Error fetching seller: ' . $e->getMessage()

            ], 500);

        }

    }



    public function createSeller(Request $request)
    {

        try {

            if ($request->has('is_open')) {
                $request->merge(['is_open' => $request->boolean('is_open')]);
            }
            if ($request->has('accepting_orders')) {
                $request->merge(['accepting_orders' => $request->boolean('accepting_orders')]);
            }

            $validated = $request->validate([

                'user_id' => 'required|exists:users,id',

                'store_name' => 'required|string|max:255',

                'description' => 'nullable|string',

                'avatar' => 'nullable|string',

                'avatar_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

                'id_card_image_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',

                'commercial_register_image_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',

                'signed_contract_image_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',

                'kuraimi_account_name' => 'nullable|string|max:255',

                'kuraimi_account_number' => 'nullable|string|max:255',

                'alt_network_name' => 'nullable|string|max:255',

                'alt_recipient_name' => 'nullable|string|max:255',

                'alt_recipient_phone' => 'nullable|string|max:255',

                'latitude' => 'nullable|numeric',

                'longitude' => 'nullable|numeric',

                'rating' => 'nullable|numeric|min:0|max:5',

                'reviews_count' => 'nullable|integer|min:0',

                'status' => 'nullable|in:active,inactive',
                'is_verified' => 'nullable|boolean',
                'type' => 'nullable|string|max:50',
                'cover_image' => 'nullable|string',
                'is_open' => 'nullable',
                'accepting_orders' => 'nullable',
                'preparation_time' => 'nullable|string',
                'min_order_amount' => 'nullable|numeric',
                'cuisine_type' => 'nullable|string',
                'working_hours' => 'nullable',

            ]);



            // Check if user already has a seller profile
            $existingSeller = \App\Models\Seller::where('user_id', $validated['user_id'])->first();
            if ($existingSeller) {
                return response()->json([
                    'message' => 'User already has a seller profile',
                    'seller' => $existingSeller
                ], 400);
            }

            // Get the user and update their role to seller
            $user = \App\Models\User::find($validated['user_id']);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $user->role = 'seller';
            $user->save();

            // Set default values for optional fields if not provided

            $validated['rating'] = $validated['rating'] ?? 0;

            $validated['reviews_count'] = $validated['reviews_count'] ?? 0;

            $validated['status'] = $validated['status'] ?? 'active';

            $validated['is_verified'] = $validated['is_verified'] ?? false;

            $validated['user_id'] = $user->id;



            // Convert is_verified to boolean if it comes as string

            if (isset($validated['is_verified']) && is_string($validated['is_verified'])) {

                $validated['is_verified'] = $validated['is_verified'] === '1' || $validated['is_verified'] === 'true';

            }



            // Handle image and document uploads

            $uploadFields = [

                'avatar_file' => ['folder' => 'sellers', 'field' => 'avatar'],

                'id_card_image_file' => ['folder' => 'sellers/documents', 'field' => 'id_card_image'],

                'commercial_register_image_file' => ['folder' => 'sellers/documents', 'field' => 'commercial_register_image'],

                'signed_contract_image_file' => ['folder' => 'sellers/documents', 'field' => 'signed_contract_image'],

            ];



            foreach ($uploadFields as $requestField => $config) {

                if ($request->hasFile($requestField)) {

                    $file = $request->file($requestField);

                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                    $file->move(storage_path('app/public/images/' . $config['folder']), $fileName);

                    $validated[$config['field']] = asset('storage/images/' . $config['folder'] . '/' . $fileName);

                }

                unset($validated[$requestField]);

            }



            unset($validated['avatar_image']);



            $seller = \App\Models\Seller::create($validated);



            // Return seller data without avatar_image to avoid JSON issues

            $sellerData = $seller->fresh()->toArray();

            unset($sellerData['avatar_image']);

            \Log::info('Final seller data being returned', [

                'seller_id' => $seller->id,

                'has_avatar' => !empty($seller->avatar),

                'data_keys' => array_keys($sellerData)

            ]);

            return response()->json($sellerData, 201);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Error creating seller: ' . $e->getMessage()

            ], 500);

        }

    }



    public function updateSeller(Request $request, $id)
    {

        try {

            \Log::info('updateSeller called', [

                'seller_id' => $id,

                'request_method' => $request->method(),

                'request_data' => $request->all(),

                'has_file' => $request->hasFile('avatar_file')

            ]);



            $seller = \App\Models\Seller::findOrFail($id);



            \Log::info('Seller found', [

                'seller_id' => $seller->id,

                'current_data' => $seller->toArray()

            ]);



            // Process FormData correctly - use input() instead of all()

            $validated = [];



            // Get all form fields using input() method

            $fields = [
                'store_name', 'description', 'avatar', 'rating', 'reviews_count', 
                'status', 'is_verified', 'latitude', 'longitude', 
                'kuraimi_account_name', 'kuraimi_account_number', 'alt_network_name', 
                'alt_recipient_name', 'alt_recipient_phone',
                'type', 'cover_image', 'is_open', 'accepting_orders', 
                'preparation_time', 'min_order_amount', 'cuisine_type', 'working_hours'
            ];



            foreach ($fields as $field) {

                if ($request->has($field)) {

                    $validated[$field] = $request->input($field);

                }

            }

            if ($request->has('is_open')) {
                $validated['is_open'] = $request->boolean('is_open');
            }
            if ($request->has('accepting_orders')) {
                $validated['accepting_orders'] = $request->boolean('accepting_orders');
            }
            if ($request->has('is_verified')) {
                $validated['is_verified'] = $request->boolean('is_verified');
            }



            \Log::info('Processing FormData with input():', [

                'validated_data' => $validated,

                'has_avatar_file' => $request->hasFile('avatar_file'),

                'request_method' => $request->method()

            ]);



            // Handle image and document uploads

            $uploadFields = [

                'avatar_file' => ['folder' => 'sellers', 'field' => 'avatar'],

                'id_card_image_file' => ['folder' => 'sellers/documents', 'field' => 'id_card_image'],

                'commercial_register_image_file' => ['folder' => 'sellers/documents', 'field' => 'commercial_register_image'],

                'signed_contract_image_file' => ['folder' => 'sellers/documents', 'field' => 'signed_contract_image'],

            ];



            foreach ($uploadFields as $requestField => $config) {

                if ($request->hasFile($requestField)) {

                    $file = $request->file($requestField);

                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                    $file->move(storage_path('app/public/images/' . $config['folder']), $fileName);

                    $validated[$config['field']] = asset('storage/images/' . $config['folder'] . '/' . $fileName);

                }

                unset($validated[$requestField]);

            }



            unset($validated['avatar_image']);



            \Log::info('About to update seller with data', [

                'validated_data' => $validated

            ]);



            // Log before update

            \Log::info('Before update - seller data:', [

                'seller_id' => $seller->id,

                'current_data' => $seller->toArray(),

                'validated_data' => $validated,

                'validated_keys' => array_keys($validated),

                'validated_values' => array_values($validated)

            ]);



            // Check if validated data is empty

            if (empty($validated)) {

                \Log::error('No validated data to update!', [

                    'seller_id' => $seller->id,

                    'request_all' => $request->all(),

                    'request_has_file' => $request->hasFile('avatar_file')

                ]);

                return response()->json(['error' => 'No valid data provided for update'], 422);

            }



            \Log::info('Attempting to update seller with:', [

                'seller_id' => $seller->id,

                'update_data' => $validated,

                'fillable_fields' => $seller->getFillable()

            ]);



            $result = $seller->update($validated);



            \Log::info('Update result:', [

                'result' => $result,

                'affected_rows' => $result ? 1 : 0,

                'seller_changed' => $seller->wasChanged(),

                'changed_attributes' => $seller->getChanges()

            ]);



            // Refresh and log after update

            $seller->refresh();

            \Log::info('Seller updated successfully', [

                'seller_id' => $seller->id,

                'updated_data' => $seller->toArray(),

                'database_check' => \DB::table('sellers')->where('id', $seller->id)->first()

            ]);



            // Return seller data without avatar_image to avoid JSON issues

            $sellerData = $seller->fresh()->toArray();

            unset($sellerData['avatar_image']);

            \Log::info('Final seller data being returned in updateSeller', [

                'seller_id' => $seller->id,

                'has_avatar' => !empty($seller->avatar),

                'data_keys' => array_keys($sellerData)

            ]);

            return response()->json($sellerData);

        } catch (\Illuminate\Validation\ValidationException $e) {

            return response()->json([

                'message' => 'Validation failed',

                'errors' => $e->errors()

            ], 422);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Error updating seller: ' . $e->getMessage()

            ], 500);

        }

    }



    public function deleteSeller($id)
    {

        try {

            $seller = \App\Models\Seller::findOrFail($id);

            $seller->delete();

            return response()->json(['message' => 'Seller deleted successfully']);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' => 'Error deleting seller: ' . $e->getMessage()

            ], 500);

        }

    }

    public function assignDriver(Request $request, $orderId)
    {
        try {
            $request->validate([
                'driver_id' => 'required|exists:users,id'
            ]);

            $order = \App\Models\Order::findOrFail($orderId);
            $driver = \App\Models\User::where('id', $request->driver_id)
                ->where('role', 'driver')
                ->firstOrFail();

            $order->driver_id = $driver->id;
            $order->driver_status = 'assigned';
            $order->save();

            try {
                if ($driver->email) {
                    \Illuminate\Support\Facades\Mail::to($driver->email)->send(new \App\Mail\DriverAssignedMail($order, $driver));
                }
            } catch (\Exception $mailEx) {
                \Illuminate\Support\Facades\Log::error('Failed to send driver assignment email: ' . $mailEx->getMessage());
                // Non-blocking error, so it proceeds returning success
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Driver assigned successfully',
                'data' => [
                    'order' => $order,
                    'driver' => $driver
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error assigning driver: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSmartDrivers(Request $request, $orderId)
    {
        try {
            $order = \App\Models\Order::with('items.product.seller')->findOrFail($orderId);

            // Try to find pickup location (Seller)
            $sellerLat = null;
            $sellerLng = null;
            if ($order->items && count($order->items) > 0 && isset($order->items[0]->product) && isset($order->items[0]->product->seller)) {
                $sellerLat = $order->items[0]->product->seller->latitude;
                $sellerLng = $order->items[0]->product->seller->longitude;
            }

            // Fallback to order location if no seller location is found
            $targetLat = $sellerLat ?? $order->latitude;
            $targetLng = $sellerLng ?? $order->longitude;

            $drivers = \App\Models\User::where('role', 'driver')
                ->where('is_active', true)
                ->withCount([
                    'driverOrders as active_orders_count' => function ($query) {
                        $query->whereIn('driver_status', ['assigned', 'picked_up_from_seller', 'out_for_delivery']);
                    }
                ])
                ->get();

            $drivers = $drivers->map(function ($driver) use ($targetLat, $targetLng) {
                $driver->distance_km = null;
                if ($targetLat && $targetLng && $driver->latitude && $driver->longitude) {
                    $driver->distance_km = \App\Services\DeliveryService::calculateFee(
                        $targetLat,
                        $targetLng,
                        $driver->latitude,
                        $driver->longitude
                    )['distance_km'];
                }

                // Categorize
                if ($driver->is_online && $driver->active_orders_count == 0) {
                    $driver->smart_status = 'available';
                } elseif ($driver->is_online && $driver->active_orders_count > 0) {
                    $driver->smart_status = 'busy';
                } else {
                    $driver->smart_status = 'offline';
                }

                return $driver;
            });

            // Sort: available first, then busy, then offline, and by distance
            $drivers = $drivers->sortBy(function ($driver) {
                $statusScore = $driver->smart_status === 'available' ? 1 : ($driver->smart_status === 'busy' ? 2 : 3);
                $dist = $driver->distance_km ?? 999999;
                return sprintf('%d_%08d', $statusScore, $dist * 1000);
            })->values();

            return response()->json([
                'status' => 'success',
                'data' => $drivers
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching smart drivers: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch smart drivers'
            ], 500);
        }
    }
}

