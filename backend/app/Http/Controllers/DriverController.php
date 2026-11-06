<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DriverController extends Controller
{
    public function getOrders(Request $request)
    {
        $status = $request->query('status', 'processing'); 
        // processing = ready for pickup/available for all drivers nearby
        // shipped = assigned to a specific driver

        $query = \App\Models\Order::with(['items.product.seller', 'user'])
                   ->where('status', $status);
                   
        // If driver assigned, limit to this driver
        if ($status == 'shipped') {
           $query->where('driver_id', $request->user()->id);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();
        
        $mapped = $orders->map(function ($order) {
            $restaurantLat = null;
            $restaurantLng = null;
            $restaurantName = 'متجر المنصة';
            $restaurantAddress = 'صنعاء';
            
            if ($order->items->first() && $order->items->first()->product && $order->items->first()->product->seller) {
                $seller = $order->items->first()->product->seller;
                $restaurantLat = $seller->latitude;
                $restaurantLng = $seller->longitude;
                $restaurantName = $seller->store_name ?? 'متجر البائع';
                $restaurantAddress = $seller->address ?? $seller->city;
            }

            $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : [];
            
            $rLat = $restaurantLat ?? 15.3500;
            $rLng = $restaurantLng ?? 44.2000;
            $cLat = $order->latitude ?? 15.3694;
            $cLng = $order->longitude ?? 44.1910;
            
            $dist = $this->calculateDistance($rLat, $rLng, $cLat, $cLng);
            
            $orderItems = $order->items->map(function($item) {
                return [
                   'name' => $item->product_name ?? ($item->product ? $item->product->name : 'منتج'),
                   'qty' => $item->quantity,
                   'image' => $item->image_url ?? ''
                ];
            });

            return [
               'id' => $order->order_number,
               'db_id' => $order->id,
               'restaurant' => $restaurantName,
               'restaurant_address' => $restaurantAddress,
               'restaurant_lat' => $restaurantLat ?? 15.3500, // Default slightly offset
               'restaurant_lng' => $restaurantLng ?? 44.2000,
               'customer_address' => ltrim(($shippingAddress['city'] ?? '') . ' - ' . ($shippingAddress['address'] ?? ''), ' - '),
               'customer_lat' => $order->latitude ?? 15.3694,
               'customer_lng' => $order->longitude ?? 44.1910,
               'customerInfo' => [
                   'name' => $shippingAddress['name'] ?? 'العميل',
                   'phone' => $shippingAddress['phone'] ?? '',
                   'address' => $shippingAddress['address'] ?? ''
               ],
               'distance' => round($dist, 1) . ' كم',
               'delivery_fee' => ($order->shipping ?? 15) * 0.8, // 80% to driver
               'time' => round($dist * 3) . ' دقيقة', // avg 3 mins per km
               'items' => $orderItems,
               'total_amount' => $order->total_amount,
               'payment_method' => $order->payment_method ?? 'cod',
               'payment_status' => $order->payment_status ?? 'pending',
               'status' => $order->status,
               'date' => $order->created_at->format('Y-m-d h:i A')
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $mapped
        ]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        return $earthRadius * $c;
    }

    public function getCompletedOrders(Request $request) {
        $orders = \App\Models\Order::with(['items.product.seller', 'user'])
                   ->where('status', 'delivered')
                   ->where('driver_id', $request->user()->id)
                   ->orderBy('created_at', 'desc')->get();
                   
        $mapped = $orders->map(function ($order) {
            $restaurantLat = null;
            $restaurantLng = null;
            $restaurantName = 'متجر المنصة';
            $restaurantAddress = 'صنعاء';
            
            if ($order->items->first() && $order->items->first()->product && $order->items->first()->product->seller) {
                $seller = $order->items->first()->product->seller;
                $restaurantLat = $seller->latitude;
                $restaurantLng = $seller->longitude;
                $restaurantName = $seller->store_name ?? 'متجر البائع';
                $restaurantAddress = $seller->address ?? $seller->city;
            }

            $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : [];
            
            $rLat = $restaurantLat ?? 15.3500;
            $rLng = $restaurantLng ?? 44.2000;
            $cLat = $order->latitude ?? 15.3694;
            $cLng = $order->longitude ?? 44.1910;
            
            $dist = $this->calculateDistance($rLat, $rLng, $cLat, $cLng);
            
            $orderItems = $order->items->map(function($item) {
                return [
                   'name' => $item->product_name ?? ($item->product ? $item->product->name : 'منتج'),
                   'qty' => $item->quantity,
                   'image' => $item->image_url ?? ''
                ];
            });

            return [
               'id' => $order->order_number,
               'db_id' => $order->id,
               'restaurant' => $restaurantName,
               'restaurant_address' => $restaurantAddress,
               'restaurant_lat' => $restaurantLat ?? 15.3500,
               'restaurant_lng' => $restaurantLng ?? 44.2000,
               'customer_address' => ltrim(($shippingAddress['city'] ?? '') . ' - ' . ($shippingAddress['address'] ?? ''), ' - '),
               'customer_lat' => $order->latitude ?? 15.3694,
               'customer_lng' => $order->longitude ?? 44.1910,
               'customerInfo' => [
                   'name' => $shippingAddress['name'] ?? 'العميل',
                   'phone' => $shippingAddress['phone'] ?? '',
                   'address' => $shippingAddress['address'] ?? ''
               ],
               'distance' => round($dist, 1) . ' كم',
               'delivery_fee' => ($order->shipping ?? 15) * 0.8,
               'time' => round($dist * 3) . ' دقيقة',
               'items' => $orderItems,
               'total_amount' => $order->total_amount,
               'payment_method' => $order->payment_method ?? 'cod',
               'payment_status' => $order->payment_status ?? 'pending',
               'status' => 'مكتمل',
               'date' => $order->created_at->format('Y-m-d h:i A')
            ];
        });
        
        return response()->json(['status' => 'success', 'data' => $mapped]);
    }

    public function updateOrderStatus(Request $request, $id) {
        $order = \App\Models\Order::where('order_number', $id)->orWhere('id', $id)->firstOrFail();
        
        if ($request->status == 'shipped') {
           $order->driver_id = $request->user()->id; // Assign driver
        }
        
        $order->status = $request->status; 
        // e.g. shipped (in transit), delivered
        $order->save();
        
        return response()->json(['status' => 'success']);
    }

    public function updateLocation(Request $request) {
        // Here we could update driver live location if driver table has lat/lng 
        // But for UI simulation we return 200 OK
        return response()->json(['status' => 'success']);
    }

    public function updateStatus(Request $request) {
        // Toggle online / offline
        return response()->json(['status' => 'success']);
    }

    /**
     * Display a listing of drivers.
     */
    public function index()
    {
        $drivers = User::with('driver')->where('role', 'driver')->get();
        return response()->json([
            'status' => 'success',
            'data' => $drivers
        ]);
    }

    /**
     * Store a newly created driver.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|max:20',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'vehicle_type' => 'nullable|in:motorcycle,car,van',
            'vehicle_plate_number' => 'nullable|string|max:50',
            'kuraimi_account' => 'nullable|string|max:100',
            'personal_photo_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'id_card_image_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        try {
            // 1. Create the user
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'role' => 'driver',
                'is_active' => true,
            ]);

            // 2. Handle files
            $personalPhotoPath = null;
            if ($request->hasFile('personal_photo_file')) {
                $file = $request->file('personal_photo_file');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/drivers'), $filename);
                $personalPhotoPath = url('images/drivers/' . $filename);
            }

            $idCardPath = null;
            if ($request->hasFile('id_card_image_file')) {
                // Save to private storage (storage/app/drivers)
                $idCardPath = $request->file('id_card_image_file')->store('drivers');
            }

            // 3. Create the driver profile
            $driver = Driver::create([
                'user_id' => $user->id,
                'personal_photo' => $personalPhotoPath,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                'vehicle_type' => $request->vehicle_type,
                'vehicle_plate_number' => $request->vehicle_plate_number,
                'id_card_image' => $idCardPath,
                'kuraimi_account' => $request->kuraimi_account,
                'is_verified' => true,
            ]);

            $user->load('driver');

            return response()->json([
                'status' => 'success',
                'message' => 'تمت إضافة المندوب بنجاح',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            Log::error('Driver creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ أثناء إضافة المندوب'
            ], 500);
        }
    }

    /**
     * Get the logged in driver profile settings
     */
    public function getProfile(Request $request)
    {
        return $this->getDriverProfile($request);
    }

    public function getDriverProfile(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'driver') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Auto-create driver profile if it doesn't exist (e.g. created manually in DB)
        if (!$user->driver) {
             \App\Models\Driver::create([
                 'user_id' => $user->id,
                 'vehicle_type' => 'motorcycle',
                 'is_verified' => true,
             ]);
             $user->refresh();
        }

        $user->load('driver');

        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Update driver profile settings
     */
    public function updateDriverProfile(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'driver') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'vehicle_type' => 'nullable|in:motorcycle,car,van',
            'vehicle_plate_number' => 'nullable|string|max:50',
            'kuraimi_account' => 'nullable|string|max:100',
            'personal_photo_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'id_card_image_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        try {
            // Update User
            if ($request->has('first_name')) $user->first_name = $request->first_name;
            if ($request->has('last_name')) $user->last_name = $request->last_name;
            if ($request->has('first_name') || $request->has('last_name')) {
                $user->name = $user->first_name . ' ' . $user->last_name;
            }
            if ($request->has('phone')) $user->phone = $request->phone;
            $user->save();

            // Update Driver
            $driver = $user->driver ?? new Driver(['user_id' => $user->id]);

            if ($request->has('emergency_contact_phone')) $driver->emergency_contact_phone = $request->emergency_contact_phone;
            if ($request->has('vehicle_type')) $driver->vehicle_type = $request->vehicle_type;
            if ($request->has('vehicle_plate_number')) $driver->vehicle_plate_number = $request->vehicle_plate_number;
            if ($request->has('kuraimi_account')) $driver->kuraimi_account = $request->kuraimi_account;

            if ($request->hasFile('personal_photo_file')) {
                $file = $request->file('personal_photo_file');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/drivers'), $filename);
                $driver->personal_photo = url('images/drivers/' . $filename);
            }

            if ($request->hasFile('id_card_image_file')) {
                $driver->id_card_image = $request->file('id_card_image_file')->store('drivers');
            }

            $driver->save();

            $user->load('driver');

            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديث الإعدادات بنجاح',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Driver update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ أثناء تحديث الإعدادات'
            ], 500);
        }
    }

    /**
     * Update driver (Admin)
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'vehicle_type' => 'nullable|in:motorcycle,car,van',
            'vehicle_plate_number' => 'nullable|string|max:50',
            'kuraimi_account' => 'nullable|string|max:100',
            'personal_photo_file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'id_card_image_file' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        try {
            if ($request->has('first_name')) $user->first_name = $request->first_name;
            if ($request->has('last_name')) $user->last_name = $request->last_name;
            if ($request->has('first_name') || $request->has('last_name')) {
                $user->name = $user->first_name . ' ' . $user->last_name;
            }
            if ($request->has('email')) $user->email = $request->email;
            if ($request->has('phone')) $user->phone = $request->phone;
            if ($request->filled('password')) $user->password = Hash::make($request->password);
            
            $user->save();

            $driver = $user->driver ?? new Driver(['user_id' => $user->id]);

            if ($request->has('emergency_contact_phone')) $driver->emergency_contact_phone = $request->emergency_contact_phone;
            if ($request->has('vehicle_type')) $driver->vehicle_type = $request->vehicle_type;
            if ($request->has('vehicle_plate_number')) $driver->vehicle_plate_number = $request->vehicle_plate_number;
            if ($request->has('kuraimi_account')) $driver->kuraimi_account = $request->kuraimi_account;

            if ($request->hasFile('personal_photo_file')) {
                $file = $request->file('personal_photo_file');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('images/drivers'), $filename);
                $driver->personal_photo = url('images/drivers/' . $filename);
            }

            if ($request->hasFile('id_card_image_file')) {
                $driver->id_card_image = $request->file('id_card_image_file')->store('drivers');
            }

            $driver->save();
            $user->load('driver');

            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديث بيانات المندوب بنجاح',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Driver update by admin failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ أثناء التحديث'
            ], 500);
        }
    }

    /**
     * Delete driver (Admin)
     */
    public function destroy($id)
    {
        try {
            $user = User::where('id', $id)->where('role', 'driver')->firstOrFail();
            $user->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'تم حذف المندوب بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'حدث خطأ أثناء الحذف'
            ], 500);
        }
    }

    /**
     * Show detailed statistics for a specific driver.
     */
    public function showStatistics($id)
    {
        $user = User::with('driver')->where('role', 'driver')->findOrFail($id);
        
        $orders = \App\Models\Order::where('driver_id', $id)->get();
        
        $completedOrders = $orders->where('status', 'delivered');
        $incompleteOrders = $orders->whereIn('status', ['pending', 'processing', 'shipped']);
        
        $now = \Carbon\Carbon::now();
        
        $todayOrders = $completedOrders->filter(function($order) use ($now) {
            return \Carbon\Carbon::parse($order->created_at)->isToday();
        });
        $weekOrders = $completedOrders->filter(function($order) use ($now) {
            return \Carbon\Carbon::parse($order->created_at)->isCurrentWeek();
        });
        $monthOrders = $completedOrders->filter(function($order) use ($now) {
            return \Carbon\Carbon::parse($order->created_at)->isCurrentMonth();
        });
        $yearOrders = $completedOrders->filter(function($order) use ($now) {
            return \Carbon\Carbon::parse($order->created_at)->isCurrentYear();
        });

        // Let's assume the driver naturally gets exactly the 'shipping' fee (delivery cost) of completed orders.
        // Wait, usually the store takes 20% of the delivery fee, so driver gets 80%.
        $totalShippingCost = $completedOrders->sum('shipping');
        $driverProfit = $totalShippingCost * 0.80; // 80%
        
        $profitToday = $todayOrders->sum('shipping') * 0.80;
        $profitWeek = $weekOrders->sum('shipping') * 0.80;
        $profitMonth = $monthOrders->sum('shipping') * 0.80;
        $profitYear = $yearOrders->sum('shipping') * 0.80;

        $latestOrders = \App\Models\Order::where('driver_id', $id)
            ->with(['user', 'items.product'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user ? $order->user->first_name . ' ' . $order->user->last_name : 'عميل غير محدد',
                    'status' => $order->status,
                    'shipping_fee' => $order->shipping ?? 15,
                    'driver_profit' => ($order->shipping ?? 15) * 0.80,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at->format('Y-m-d H:i')
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'driver' => $user,
                'total_orders' => $orders->count(),
                'completed_orders_count' => $completedOrders->count(),
                'incomplete_orders_count' => $incompleteOrders->count(),
                'profit_percentage' => '80%',
                'total_profit' => $driverProfit,
                'profit_today' => $profitToday,
                'profit_week' => $profitWeek,
                'profit_month' => $profitMonth,
                'profit_year' => $profitYear,
                'recent_orders' => $latestOrders
            ]
        ]);
    }
    
    /**
     * Show detailed statistics for the authenticated driver.
     */
    public function getStatistics(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'driver') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $this->showStatistics($user->id);
    }
}
