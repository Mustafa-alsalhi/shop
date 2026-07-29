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
    public function getDriverProfile(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'driver') {
            return response()->json(['message' => 'Unauthorized'], 403);
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
                    'shipping_fee' => $order->shipping,
                    'driver_profit' => $order->shipping * 0.80,
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
}
