<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SellerOrderController extends Controller
{
    /**
     * Get seller's orders
     */
    public function index(Request $request)
    {
        Log::info('=== SELLER ORDER CONTROLLER - Getting Seller Orders ===');
        
        $seller = $request->user()->seller;
        $sellerId = $seller ? $seller->id : null;
        Log::info('Seller ID:', ['seller_id' => $sellerId]);
        
        if (!$sellerId) {
            Log::error('Seller profile not found for user:', ['user_id' => $request->user()->id]);
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        // Get seller's product IDs
        $sellerProductIds = \App\Models\Product::where('seller_id', $sellerId)->pluck('id');
        Log::info('Seller product IDs:', ['product_ids' => $sellerProductIds]);

        // Get order items that contain seller's products
        $orderIds = \App\Models\OrderItem::whereIn('product_id', $sellerProductIds)->pluck('order_id')->unique();
        Log::info('Order IDs with seller products:', ['order_ids' => $orderIds]);

        // Get orders
        $query = Order::with(['items.product', 'user', 'paymentRequests'])
            ->whereIn('id', $orderIds)
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(20);
            
        Log::info('Orders fetched:', ['count' => $orders->count()]);
        
        return response()->json($orders);
    }

    /**
     * Get seller's order details
     */
    public function show(Request $request, $id)
    {
        $seller = $request->user()->seller;
        $sellerId = $seller ? $seller->id : null;
        
        if (!$sellerId) {
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        $order = Order::with(['items.product', 'items.variant', 'user', 'paymentRequests'])
            ->whereHas('items', function ($query) use ($sellerId) {
                $query->whereHas('product', function ($productQuery) use ($sellerId) {
                    $productQuery->where('seller_id', $sellerId);
                });
            })
            ->findOrFail($id);
            
        return response()->json($order);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $seller = $request->user()->seller;
        $sellerId = $seller ? $seller->id : null;
        
        if (!$sellerId) {
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,accepted,preparing,ready,assigned_to_courier,picked_up,on_the_way'
        ]);

        $order = Order::whereHas('items', function ($query) use ($sellerId) {
            $query->whereHas('product', function ($productQuery) use ($sellerId) {
                $productQuery->where('seller_id', $sellerId);
            });
        })->findOrFail($id);

        // Check if seller is explicitly changing status from pending to processing or accepted
        $isNewlyApproved = ($order->status === 'pending' && in_array($request->status, ['processing', 'accepted']));

        $order->status = $request->status;
        $order->save();

        $statusArabicMap = [
            'pending' => 'قيد الانتظار',
            'accepted' => 'تم قبول الطلب',
            'preparing' => 'جاري تجهيز الوجبة',
            'ready' => 'الطلب جاهز للاستلام والتوصيل',
            'assigned_to_courier' => 'تم إسناد الطلب للمندوب',
            'picked_up' => 'استلم المندوب الطلب',
            'on_the_way' => 'الطلب في الطريق إليك',
            'processing' => 'قيد المعالجة والتجهيز',
            'shipped' => 'تم الشحن',
            'delivered' => 'تم التوصيل بنجاح',
            'cancelled' => 'تم إلغاء الطلب',
        ];
        $statusText = $statusArabicMap[$request->status] ?? $request->status;

        // إشعار للعميل بتحديث حالة الطلب
        \App\Models\Notification::create([
            'user_id' => $order->user_id,
            'type' => 'info',
            'title' => 'تحديث حالة الطلب',
            'message' => 'تم تحديث حالة طلبك رقم ' . $order->order_number . ' إلى: ' . $statusText,
            'link' => '/orders/' . $order->id,
            'read' => false,
        ]);

        if ($isNewlyApproved) {
            try {
                // Find all active admins (or just the first one)
                $admins = \App\Models\User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    if ($admin->email) {
                        \Illuminate\Support\Facades\Mail::to($admin->email)->send(new \App\Mail\AdminOrderApprovedMail($order, $seller));
                    }
                }
            } catch (\Exception $mailEx) {
                Log::error('Failed to send admin order approval notification: ' . $mailEx->getMessage());
            }
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);
    }

    /**
     * Get seller's statistics
     */
    public function getStatistics(Request $request)
    {
        $seller = $request->user()->seller;
        $sellerId = $seller ? $seller->id : null;
        
        if (!$sellerId) {
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        // Get total products
        $totalProducts = \App\Models\Product::where('seller_id', $sellerId)->count();

        // Base query for seller's order items
        $sellerOrderItems = \App\Models\OrderItem::whereHas('product', function($query) use ($sellerId) {
            $query->where('seller_id', $sellerId);
        });

        // Get total orders count (distinct orders containing this seller's products)
        $totalOrders = (clone $sellerOrderItems)->distinct('order_id')->count('order_id');
        
        // Active orders (pending, processing, shipped)
        $pendingOrders = (clone $sellerOrderItems)->whereHas('order', function($query) {
            $query->whereIn('status', ['pending', 'processing', 'shipped']);
        })->distinct('order_id')->count('order_id');

        // Total sales (Earnings) - SUM(price * quantity) of completed/delivered/shipped orders
        $soldItems = (clone $sellerOrderItems)->whereHas('order', function($query) {
            $query->whereIn('status', ['processing', 'shipped', 'delivered']);
        });

        $totalSales = (clone $soldItems)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));

        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();
        $thisYear = now()->startOfYear();

        $todaySales = (clone $soldItems)->where('created_at', '>=', $today)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));
        $thisWeekSales = (clone $soldItems)->where('created_at', '>=', $thisWeek)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));
        $thisMonthSales = (clone $soldItems)->where('created_at', '>=', $thisMonth)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));
        $thisYearSales = (clone $soldItems)->where('created_at', '>=', $thisYear)->sum(\Illuminate\Support\Facades\DB::raw('price * quantity'));

        // Get recent orders
        $recentOrderIds = (clone $sellerOrderItems)
            ->orderBy('created_at', 'desc')
            ->select('order_id')
            ->distinct()
            ->limit(5)
            ->pluck('order_id');

        $recentOrders = Order::with(['items' => function($q) use ($sellerId) {
                // Only load this seller's items for clarity in dashboard if needed
                $q->whereHas('product', function($pq) use ($sellerId) {
                    $pq->where('seller_id', $sellerId);
                })->with('product');
            }, 'user'])
            ->whereIn('id', $recentOrderIds)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'total_sales' => $totalSales ?: 0,
            'today_sales' => $todaySales ?: 0,
            'this_week_sales' => $thisWeekSales ?: 0,
            'this_month_sales' => $thisMonthSales ?: 0,
            'this_year_sales' => $thisYearSales ?: 0,
            'recent_orders' => $recentOrders
        ]);
    }

    /**
     * Get seller's payment requests
     */
    public function getPaymentRequests(Request $request)
    {
        $seller = $request->user()->seller;
        $sellerId = $seller ? $seller->id : null;
        
        if (!$sellerId) {
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        $paymentRequests = PaymentRequest::with(['order', 'order.items.product'])
            ->whereHas('order', function ($query) use ($sellerId) {
                $query->whereHas('items', function ($itemQuery) use ($sellerId) {
                    $itemQuery->whereHas('product', function ($productQuery) use ($sellerId) {
                        $productQuery->where('seller_id', $sellerId);
                    });
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($paymentRequests);
    }

    /**
     * Get seller settings
     */
    public function getSettings(Request $request)
    {
        $seller = $request->user()->seller;
        $user = $request->user();
        
        if (!$seller) {
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        // Combine seller and user data
        $combinedData = [
            // Store info from sellers table
            'store_name' => $seller->store_name,
            'store_description' => $seller->description,
            'store_logo' => $seller->avatar,
            'avatar' => $seller->avatar,
            'cover_image' => $seller->cover_image,
            'store_banner' => $seller->cover_image,
            'type' => $seller->type ?? 'store',
            'is_open' => (bool)$seller->is_open,
            'accepting_orders' => (bool)$seller->accepting_orders,
            'preparation_time' => $seller->preparation_time,
            'min_order_amount' => $seller->min_order_amount,
            'cuisine_type' => $seller->cuisine_type,
            'working_hours' => $seller->working_hours,
            
            // Contact info from users table
            'phone' => $user->phone,
            'email' => $user->email,
            'address' => $user->address,
            'city' => $user->city,
            'state' => $user->state,
            'country' => $user->country,
            'postal_code' => $user->postal_code,
            
            // Location info from sellers table
            'seller_address' => $seller->address,
            'seller_city' => $seller->city,
            'latitude' => $seller->latitude,
            'longitude' => $seller->longitude,
            
            // Financial & KYC info
            'business_type' => $seller->business_type,
            'kuraimi_account_name' => $seller->kuraimi_account_name,
            'kuraimi_account_number' => $seller->kuraimi_account_number,
            'other_networks_account' => $seller->other_networks_account,
            'commercial_register_image' => $seller->commercial_register_image,
            'id_card_image' => $seller->id_card_image,
            'signed_contract_image' => $seller->signed_contract_image,
        ];

        return response()->json([
            'data' => $combinedData
        ]);
    }

    /**
     * Update seller settings
     */
    public function updateSettings(Request $request)
    {
        Log::info('=== SELLER ORDER CONTROLLER - Updating Seller Settings ===');
        
        $seller = $request->user()->seller;
        $user = $request->user();
        
        if (!$seller) {
            Log::error('Seller profile not found for user:', ['user_id' => $user->id]);
            return response()->json([
                'message' => 'Seller profile not found'
            ], 400);
        }

        Log::info('Updating seller:', ['seller_id' => $seller->id]);
        Log::info('Request data:', ['data' => $request->all()]);

        $inputData = $request->all();
        if ($request->has('is_open')) {
            $inputData['is_open'] = $request->boolean('is_open');
        }
        if ($request->has('accepting_orders')) {
            $inputData['accepting_orders'] = $request->boolean('accepting_orders');
        }

        $validator = Validator::make($inputData, [
            'store_name' => 'nullable|string|max:255',
            'store_description' => 'nullable|string',
            'store_logo' => 'nullable|string',
            'store_logo_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'store_banner' => 'nullable|string',
            'store_banner_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'cover_image' => 'nullable|string',
            'cover_image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'is_open' => 'nullable',
            'accepting_orders' => 'nullable',
            'preparation_time' => 'nullable',
            'min_order_amount' => 'nullable|numeric|min:0',
            'cuisine_type' => 'nullable|string|max:100',
            'working_hours' => 'nullable',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'business_type' => 'nullable|string|max:50',
            'kuraimi_account_name' => 'nullable|string|max:255',
            'kuraimi_account_number' => 'nullable|string|max:100',
            'other_networks_account' => 'nullable|string|max:500',
            'commercial_register_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'id_card_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'signed_contract_file' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update seller table with store info
        $sellerData = [
            'store_name' => $request->store_name,
            'description' => $request->store_description,
        ];
        
        // Add location fields if present
        if ($request->has('address') || $request->has('seller_address')) {
            $sellerData['address'] = mb_substr($request->address ?? $request->seller_address, 0, 500, "UTF-8");
        }
        if ($request->has('city') || $request->has('seller_city')) {
            $sellerData['city'] = mb_substr($request->city ?? $request->seller_city, 0, 250, "UTF-8");
        }
        if ($request->has('latitude')) {
            $sellerData['latitude'] = $request->latitude;
        }
        if ($request->has('longitude')) {
            $sellerData['longitude'] = $request->longitude;
        }
        
        // Handle image upload (Logo / Avatar)
        if ($request->hasFile('store_logo_file') || $request->hasFile('avatar_file')) {
            $image = $request->file('store_logo_file') ?? $request->file('avatar_file');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(storage_path('app/public/images/sellers'), $imageName);
            @copy(storage_path('app/public/images/sellers/' . $imageName), public_path('storage/images/sellers/' . $imageName));
            @copy(storage_path('app/public/images/sellers/' . $imageName), public_path('images/sellers/' . $imageName));
            $sellerData['avatar'] = url('storage/images/sellers/' . $imageName);
            $sellerData['avatar_image'] = url('storage/images/sellers/' . $imageName);
            Log::info('Logo uploaded:', ['path' => $sellerData['avatar']]);
        } elseif ($request->filled('store_logo')) {
            $sellerData['avatar'] = $request->store_logo;
            $sellerData['avatar_image'] = $request->store_logo;
        }
        // Restaurant specific fields
        if ($request->has('is_open')) {
            $sellerData['is_open'] = $request->boolean('is_open');
        }
        if ($request->has('accepting_orders')) {
            $sellerData['accepting_orders'] = $request->boolean('accepting_orders');
        }
        if ($request->has('preparation_time')) {
            $sellerData['preparation_time'] = $request->preparation_time;
        }
        if ($request->has('min_order_amount')) {
            $sellerData['min_order_amount'] = $request->min_order_amount;
        }
        if ($request->has('cuisine_type')) {
            $sellerData['cuisine_type'] = $request->cuisine_type;
        }
        if ($request->has('working_hours')) {
            $sellerData['working_hours'] = $request->working_hours;
        }
        // Handle cover image upload (Cover / Banner)
        if ($request->hasFile('cover_image_file') || $request->hasFile('store_banner_file')) {
            $cover = $request->file('cover_image_file') ?? $request->file('store_banner_file');
            $coverName = time() . '_cover_' . uniqid() . '.' . $cover->getClientOriginalExtension();
            $cover->move(storage_path('app/public/images/sellers'), $coverName);
            @copy(storage_path('app/public/images/sellers/' . $coverName), public_path('storage/images/sellers/' . $coverName));
            @copy(storage_path('app/public/images/sellers/' . $coverName), public_path('images/sellers/' . $coverName));
            $sellerData['cover_image'] = url('storage/images/sellers/' . $coverName);
            Log::info('Restaurant cover image uploaded successfully:', ['url' => $sellerData['cover_image']]);
        } elseif ($request->filled('cover_image')) {
            $sellerData['cover_image'] = $request->cover_image;
        } elseif ($request->filled('store_banner')) {
            $sellerData['cover_image'] = $request->store_banner;
        }

        // KYC & Financial Info Updates
        // KYC & Financial Info Updates
        if ($request->has('kuraimi_account_name')) $sellerData['kuraimi_account_name'] = $request->kuraimi_account_name;
        if ($request->has('kuraimi_account_number')) $sellerData['kuraimi_account_number'] = $request->kuraimi_account_number;

        $uploadFile = function($file, $folder) {
            if (!$file) return null;
            $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(storage_path("app/public/{$folder}"), $fileName);
            return asset("storage/{$folder}/" . $fileName);
        };

        if ($request->hasFile('commercial_register_file')) {
            $sellerData['commercial_register_image'] = $uploadFile($request->file('commercial_register_file'), 'images/sellers/documents');
        }
        
        if ($request->hasFile('id_card_file')) {
            $sellerData['id_card_image'] = $uploadFile($request->file('id_card_file'), 'images/sellers/documents');
        }

        if ($request->hasFile('signed_contract_file')) {
            $sellerData['signed_contract_image'] = $uploadFile($request->file('signed_contract_file'), 'images/sellers/documents');
        }
        
        try {
            $seller->update($sellerData);
            Log::info('Seller table updated:', ['seller_id' => $seller->id]);

            // Update user table with contact info
            $userData = [
                'phone' => $request->phone,
                'email' => $request->email,
                'address' => $request->address ? mb_substr($request->address, 0, 500, "UTF-8") : null,
                'city' => $request->city ? mb_substr($request->city, 0, 250, "UTF-8") : null,
                'country' => $request->country,
                'postal_code' => $request->postal_code,
            ];
            
            Log::info('User data to update:', ['data' => $userData]);
            
            // Remove nulls to avoid SQL constraint violations on required fields like email
            $userData = array_filter($userData, function($val) { return $val !== null; });

            $user->update($userData);
            Log::info('User table updated:', ['user_id' => $user->id]);

            // Return combined data
            $seller->refresh();
            $user->refresh();

            return response()->json([
                'message' => 'Settings updated successfully',
                'data' => [
                    'seller' => $seller,
                    'user' => $user
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating settings: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ غير متوقع: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
