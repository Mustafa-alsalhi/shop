<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DriverController extends Controller
{
    /**
     * Get all available drivers (for admin)
     */
    public function getDrivers(Request $request)
    {
        try {
            $drivers = User::where('role', 'driver')
                ->where('is_active', true)
                ->select('id', 'name', 'phone', 'email', 'is_active')
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $drivers
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching drivers:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch drivers'
            ], 500);
        }
    }

    /**
     * Get driver's assigned orders
     */
    public function getOrders(Request $request)
    {
        try {
            $driverId = $request->user()->id;
            
            $query = Order::with(['items.product.seller', 'user']);
            
            if ($request->query('status') === 'pending') {
                // Return UNASSIGNED pending orders OR orders specifically assigned to this driver by admin (waiting for acceptance)
                $query->where(function($q) use ($driverId) {
                    $q->where(function($qNull) {
                        $qNull->whereNull('driver_id')
                              ->where('status', 'pending');
                    })
                    ->orWhere(function($qAssigned) use ($driverId) {
                        $qAssigned->where('driver_id', $driverId)
                                  ->where(function($qStatus) {
                                      $qStatus->whereNull('driver_status')
                                              ->orWhere('driver_status', 'pending');
                                  });
                    });
                });
            } else {
                // Return drivers assigned orders
                $query->where('driver_id', $driverId)
                      ->whereIn('driver_status', ['assigned', 'picked_up_from_seller', 'out_for_delivery']);
            }
            
            $orders = $query->orderBy('created_at', 'desc')->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching driver orders:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch orders'
            ], 500);
        }
    }

    /**
     * Get driver's completed orders
     */
    public function getCompletedOrders(Request $request)
    {
        try {
            $driverId = $request->user()->id;
            
            $orders = Order::with(['items.product.seller', 'user'])
                ->where('driver_id', $driverId)
                ->where('driver_status', 'delivered')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
                
            return response()->json($orders);
        } catch (\Exception $e) {
            Log::error('Error fetching completed orders:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch completed orders'
            ], 500);
        }
    }

    /**
     * Update driver status for an order
     */
    public function updateOrderStatus(Request $request, $orderId)
    {
        try {
            $driverId = $request->user()->id;
            
            $request->validate([
                'driver_status' => 'required|in:assigned,picked_up_from_seller,out_for_delivery,delivered,rejected'
            ]);
            
            $order = Order::findOrFail($orderId);
            
            // If claiming a pending order, assign it to this driver
            if ($order->status === 'pending' && $order->driver_id === null) {
                $order->driver_id = $driverId;
                $order->driver_status = 'assigned'; // Auto-upgrade to assigned
            } elseif ($order->driver_id !== $driverId) {
                // Otherwise only the assigned driver can update it
                return response()->json([
                    'status' => 'error',
                    'message' => 'Order is not assigned to you'
                ], 403);
            }
                
            $order->driver_status = $request->driver_status;
            
            // Check if this is a restaurant order
            $isRestaurant = false;
            if ($order->seller && $order->seller->type === 'restaurant') {
                $isRestaurant = true;
            } else {
                $firstItem = $order->items->first();
                if ($firstItem && $firstItem->product && $firstItem->product->seller && $firstItem->product->seller->type === 'restaurant') {
                    $isRestaurant = true;
                }
            }

            // Sync with global order status so Seller, Admin and Customer see changes live
            if ($request->driver_status === 'assigned') {
                $order->status = $isRestaurant ? 'assigned_to_courier' : 'processing';
            } elseif ($request->driver_status === 'picked_up_from_seller') {
                $order->status = $isRestaurant ? 'picked_up' : 'shipped';
            } elseif ($request->driver_status === 'out_for_delivery') {
                $order->status = $isRestaurant ? 'on_the_way' : 'shipped';
            } elseif ($request->driver_status === 'delivered') {
                $order->status = 'delivered';
            }
            
            $order->save();

            $statusTextMap = [
                'assigned' => $isRestaurant ? 'تم إسناد الطلب للمندوب' : 'تم تعيين مندوب التوصيل',
                'picked_up_from_seller' => $isRestaurant ? 'استلم المندوب الوجبة من المطعم' : 'تم استلام الشحنة من المتجر',
                'out_for_delivery' => $isRestaurant ? 'الطلب في الطريق إليك مع المندوب 🛵' : 'الشحنة في طريقها للتوصيل 🚚',
                'delivered' => 'تم تسليم الطلب بنجاح ✅',
                'rejected' => 'تم رفض استلام الطلب من قِبل المندوب',
            ];
            $friendlyStatus = $statusTextMap[$request->driver_status] ?? $request->driver_status;

            // إشعار للعميل بتحديث حالة الطلب
            \App\Models\Notification::create([
                'user_id' => $order->user_id,
                'type' => 'info',
                'title' => 'تحديث حالة توصيل الطلب',
                'message' => 'تم تحديث حالة طلبك رقم ' . $order->order_number . ' إلى: ' . $friendlyStatus,
                'link' => '/orders/' . $order->id,
                'read' => false,
            ]);

            // Intercept rejected status to notify Admin
            if ($request->driver_status === 'rejected') {
                $driver = $request->user();
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    try {
                        \Illuminate\Support\Facades\Mail::raw("قام المندوب {$driver->name} برفض طلب التوصيل رقم #{$order->order_number}.\n\nيرجى الدخول للوحة التحكم لتعيين مندوب آخر.", function($message) use ($admin, $order) {
                            $message->to($admin->email)
                                    ->subject("رفض طلب التوصيل - {$order->order_number}");
                        });
                    } catch (\Exception $mailEx) {
                        Log::error('Failed to notify admin of driver rejection: ' . $mailEx->getMessage());
                    }
                }
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Order status updated successfully',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating order status:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update order status'
            ], 500);
        }
    }

    /**
     * Get order details for driver
     */
    public function getOrderDetails(Request $request, $orderId)
    {
        try {
            $driverId = $request->user()->id;
            
            $order = Order::with(['items.product.seller', 'user'])
                ->where('id', $orderId)
                ->where('driver_id', $driverId)
                ->firstOrFail();
                
            return response()->json([
                'status' => 'success',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching order details:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch order details'
            ], 500);
        }
    }

    /**
     * Get Driver Profile
     */
    public function getProfile(Request $request)
    {
        $driver = tap($request->user())->makeVisible(['latitude', 'longitude', 'is_online', 'work_zone']);
        $driver->load('driver');
        return response()->json([
            'status' => 'success',
            'data' => $driver
        ]);
    }

    /**
     * Update Driver Online Status and Work Zone
     */
    public function updateStatus(Request $request)
    {
        $request->validate([
            'is_online' => 'sometimes|boolean',
            'work_zone' => 'sometimes|nullable|string|max:255',
        ]);

        $driver = $request->user();
        if ($request->has('is_online')) {
            $driver->is_online = $request->boolean('is_online');
        }
        if ($request->has('work_zone')) {
            $driver->work_zone = $request->work_zone;
        }
        $driver->save();

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث حالة المندوب',
            'data' => $driver
        ]);
    }

    /**
     * Update Driver Location
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $driver = $request->user();
        $driver->latitude = $request->latitude;
        $driver->longitude = $request->longitude;
        $driver->save();
        
        \Illuminate\Support\Facades\Cache::put('driver_loc_'.$driver->id, [
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'updated_at' => now()->toDateTimeString()
        ], 3600);

        return response()->json([
            'status' => 'success',
            'data' => [
                'latitude' => $driver->latitude,
                'longitude' => $driver->longitude
            ]
        ]);
    }

    /**
     * Get nearby stores for the driver map
     */
    public function getNearbyStores(Request $request)
    {
        $driver = $request->user();
        
        $sellers = \App\Models\Seller::where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();
            
        // Map distance and only include sellers within a certain range if needed, or just all active sellers with coords
        $sellers = $sellers->map(function ($seller) use ($driver) {
            $distance = null;
            if ($driver->latitude && $driver->longitude) {
                // Return straight-line Haversine distance
                $res = \App\Services\DeliveryService::calculateFee(
                    $driver->latitude, $driver->longitude,
                    $seller->latitude, $seller->longitude
                );
                $distance = $res['distance_km'];
            }
            
            return [
                'id' => $seller->id,
                'store_name' => $seller->store_name,
                'address' => $seller->address,
                'city' => $seller->city,
                'latitude' => $seller->latitude,
                'longitude' => $seller->longitude,
                'distance_km' => $distance,
                'avatar' => $seller->avatar_image ? url('storage/' . $seller->avatar_image) : null
            ];
        });
        
        // Sort by distance
        $sellers = $sellers->sortBy('distance_km')->values();

        return response()->json([
            'status' => 'success',
            'data' => $sellers,
            'driver_location' => [
                'latitude' => $driver->latitude,
                'longitude' => $driver->longitude
            ]
        ]);
    }

    /**
     * Get Driver Comprehensive Statistics
     */
    public function getStatistics(Request $request)
    {
        try {
            $driverId = $request->user()->id;
            
            // Total Active Orders
            $activeOrders = Order::where('driver_id', $driverId)
                ->whereIn('driver_status', ['assigned', 'picked_up_from_seller', 'out_for_delivery'])
                ->count();
                
            // All Completed Orders
            $completedOrders = Order::where('driver_id', $driverId)
                ->where('driver_status', 'delivered');

            // Quick totals
            $totalCompleted = (clone $completedOrders)->count();
            
            // Sales/Earnings (Assuming driver gets delivery_fee, or some portion. We'll sum delivery_fee).
            // Sum only completed orders
            $today = \Carbon\Carbon::today();
            $thisMonth = clone $today; $thisMonth->startOfMonth();
            $thisYear = clone $today; $thisYear->startOfYear();

            $earningsToday = (clone $completedOrders)->where('updated_at', '>=', $today)->sum('shipping');
            $earningsMonth = (clone $completedOrders)->where('updated_at', '>=', $thisMonth)->sum('shipping');
            $earningsYear  = (clone $completedOrders)->where('updated_at', '>=', $thisYear)->sum('shipping');
            $totalEarnings = (clone $completedOrders)->sum('shipping');
            
            // Uncompleted orders to show in Dashboard table
            $recentActiveOrders = Order::with(['items.product.seller', 'user'])
                ->where('driver_id', $driverId)
                ->whereIn('driver_status', ['assigned', 'picked_up_from_seller', 'out_for_delivery', 'delivered', 'rejected'])
                ->orderBy('updated_at', 'desc')
                ->take(6)
                ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => [
                    'active_orders_count' => $activeOrders,
                    'completed_orders_count' => $totalCompleted,
                    'earnings_today' => $earningsToday ?: 0,
                    'earnings_month' => $earningsMonth ?: 0,
                    'earnings_year' => $earningsYear ?: 0,
                    'earnings_total' => $totalEarnings ?: 0,
                    'recent_active_orders' => $recentActiveOrders
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching driver stats:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Get Driver Location (For Customer/Seller)
     */
    public function getLocation($driverId)
    {
        $loc = \Illuminate\Support\Facades\Cache::get('driver_loc_'.$driverId);
        if (!$loc) {
            return response()->json(['status' => 'error', 'message' => 'Location not found'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $loc]);
    }
}
