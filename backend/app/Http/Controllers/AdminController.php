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
            // Get basic counts
            $totalProducts = \App\Models\Product::count();
            $totalOrders = \App\Models\Order::count();
            $totalUsers = \App\Models\User::count();
            $totalCategories = \App\Models\Category::count();
            
            // Get today's stats (using correct column names)
            $todayOrders = \App\Models\Order::whereDate('created_at', now()->toDateString())->count();
            $todayRevenue = \App\Models\Order::whereDate('created_at', now()->toDateString())->sum('total_amount') ?? 0;
            
            // Get this month's stats (using correct column names)
            $thisMonthOrders = \App\Models\Order::whereMonth('created_at', now()->month)->count();
            $thisMonthRevenue = \App\Models\Order::whereMonth('created_at', now()->month)->sum('total_amount') ?? 0;
            
            // Get this year's stats (using correct column names)
            $thisYearOrders = \App\Models\Order::whereYear('created_at', now()->year)->count();
            $thisYearRevenue = \App\Models\Order::whereYear('created_at', now()->year)->sum('total_amount') ?? 0;
            
            // Get total revenue (using correct column name)
            $totalRevenue = \App\Models\Order::sum('total_amount') ?? 0;
            
            // Get top selling products (using OrderItem model with error handling)
            $topSellingProducts = [];
            try {
                $topSellingProducts = \App\Models\OrderItem::select('product_id', 
                            \DB::raw('SUM(quantity) as total_sales'), 
                            \DB::raw('SUM(quantity * price) as total_revenue'))
                    ->with('product')
                    ->groupBy('product_id')
                    ->orderBy('total_sales', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'name' => $item->product->name ?? 'Unknown Product',
                            'sales' => $item->total_sales ?? 0,
                            'revenue' => $item->total_revenue ?? 0
                        ];
                    });
            } catch (\Exception $e) {
                \Log::error('Top selling products error: ' . $e->getMessage());
                $topSellingProducts = [];
            }
            
            // Get recent orders (with error handling)
            $recentOrders = [];
            try {
                $recentOrders = \App\Models\Order::with('user')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($order) {
                        return [
                            'id' => $order->id,
                            'customer_name' => $order->user->name ?? 'Unknown Customer',
                            'total' => $order->total_amount ?? 0,
                            'status' => $order->status ?? 'unknown',
                            'created_at' => $order->created_at->format('Y-m-d H:i')
                        ];
                    });
            } catch (\Exception $e) {
                \Log::error('Recent orders error: ' . $e->getMessage());
                $recentOrders = [];
            }
            
            // Log the data for debugging
            \Log::info('Dashboard data:', [
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'total_users' => $totalUsers,
                'total_categories' => $totalCategories,
                'today_orders' => $todayOrders,
                'today_revenue' => $todayRevenue,
                'this_month_orders' => $thisMonthOrders,
                'this_month_revenue' => $thisMonthRevenue,
                'this_year_orders' => $thisYearOrders,
                'this_year_revenue' => $thisYearRevenue,
                'total_revenue' => $totalRevenue,
                'top_selling_products_count' => $topSellingProducts->count(),
                'recent_orders_count' => $recentOrders->count()
            ]);
            
            return response()->json([
                'stats' => [
                    'total_products' => $totalProducts,
                    'total_orders' => $totalOrders,
                    'total_users' => $totalUsers,
                    'total_categories' => $totalCategories,
                    'total_revenue' => $totalRevenue,
                    'today_orders' => $todayOrders,
                    'today_revenue' => $todayRevenue,
                    'this_month_orders' => $thisMonthOrders,
                    'this_month_revenue' => $thisMonthRevenue,
                    'this_year_orders' => $thisYearOrders,
                    'this_year_revenue' => $thisYearRevenue,
                ],
                'top_selling_products' => $topSellingProducts,
                'recent_orders' => $recentOrders
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Dashboard error: ' . $e->getMessage());
            \Log::error('Dashboard error trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Dashboard error occurred',
                'error' => $e->getMessage(),
                'stats' => [
                    'total_products' => 0,
                    'total_orders' => 0,
                    'total_users' => 0,
                    'total_categories' => 0,
                    'total_revenue' => 0,
                    'today_orders' => 0,
                    'today_revenue' => 0,
                    'this_month_orders' => 0,
                    'this_month_revenue' => 0,
                    'this_year_orders' => 0,
                    'this_year_revenue' => 0,
                ],
                'top_selling_products' => [],
                'recent_orders' => []
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
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'currency' => 'required|string|max:3',
                'condition' => 'required|in:new,used,refurbished',
                'sale_start_date' => 'nullable|date',
                'sale_end_date' => 'nullable|date',
                'stock' => 'required|integer|min:0',
                'sku' => 'nullable|string|max:100',
                'category_id' => 'required|exists:categories,id',
                'is_active' => 'sometimes|boolean',
                'is_featured' => 'sometimes|boolean',
                'image_url' => 'nullable|string',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'gallery_images' => 'nullable|array',
                'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            // Add variants back to validated data
            $validated['variants'] = $variants;

            // Generate slug from name
            $validated['slug'] = Str::slug($validated['name']);

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

            \Log::info('Final validated data before creating product:', [
                'gallery_images' => $validated['gallery_images'] ?? 'not_set',
                'all_validated' => array_keys($validated)
            ]);

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
                'price' => 'required|numeric|min:0',
                'sale_price' => 'nullable|numeric|min:0',
                'currency' => 'required|string|max:3',
                'condition' => 'required|in:new,used,refurbished',
                'sale_start_date' => 'nullable|date',
                'sale_end_date' => 'nullable|date',
                'stock' => 'required|integer|min:0',
                'sku' => 'nullable|string|max:100',
                'category_id' => 'required|exists:categories,id',
                'is_active' => 'sometimes|boolean',
                'is_featured' => 'sometimes|boolean',
                'image_url' => 'nullable|string',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'gallery_images' => 'nullable|array',
                'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

            // Add variants back to validated data
            $validated['variants'] = $variants;

            // Generate slug from name if name changed
            if ($validated['name'] !== $product->name) {
                $validated['slug'] = Str::slug($validated['name']);
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
                'all_validated' => array_keys($validated)
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
        $product = \App\Models\Product::with('category')->findOrFail($id);
        return response()->json($product);
    }

    public function orders()
    {
        $orders = \App\Models\Order::with('user')->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($orders);
    }

    public function categories()
    {
        $categories = \App\Models\Category::orderBy('name')->get();
        return response()->json($categories);
    }

    public function storeCategory(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'description' => 'nullable|string',
                'image_url' => 'nullable|string',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

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
                'description' => 'nullable|string',
                'image_url' => 'nullable|string',
                'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048'
            ]);

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
                'role' => 'required|string|max:50|in:user,admin'
            ]);

            // Create user with hashed password
            $user = \App\Models\User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
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
                'role' => 'required|string|max:50|in:user,admin'
            ]);

            // Ensure role is properly trimmed
            $validated['role'] = trim($validated['role']);
            
            // Direct update with explicit field assignment
            $user->name = $validated['name'];
            $user->email = $validated['email'];
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
}
