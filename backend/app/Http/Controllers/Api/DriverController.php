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
            
            $orders = Order::with(['items.product.seller', 'user'])
                ->where('driver_id', $driverId)
                ->whereIn('driver_status', ['assigned', 'picked_up_from_seller', 'out_for_delivery'])
                ->orderBy('created_at', 'desc')
                ->get();
                
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
            
            $order = Order::where('id', $orderId)
                ->where('driver_id', $driverId)
                ->firstOrFail();
                
            $order->driver_status = $request->driver_status;
            
            // If delivered, also update order status
            if ($request->driver_status === 'delivered') {
                $order->status = 'delivered';
            } elseif ($request->driver_status === 'out_for_delivery') {
                $order->status = 'shipped';
            }
            
            $order->save();

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
}
