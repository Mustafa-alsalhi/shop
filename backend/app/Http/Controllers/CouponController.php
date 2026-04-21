<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    /**
     * عرض جميع الكوبونات
     */
    public function index()
    {
        try {
            $coupons = Coupon::latest()->paginate(10);
            
            return response()->json([
                'status' => 'success',
                'data' => $coupons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch coupons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض الكوبونات المتاحة للمستخدمين
     */
    public function userCoupons()
    {
        $coupons = Coupon::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->get(['id', 'code', 'name', 'description', 'type', 'value', 'minimum_amount', 'maximum_discount', 'usage_limit', 'used_count', 'starts_at', 'expires_at', 'is_first_time_only']);
        
        return response()->json([
            'status' => 'success',
            'data' => $coupons
        ]);
    }

    /**
     * تخزين كوبون جديد
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:coupons',
                'name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|in:fixed,percentage',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'nullable|numeric|min:0',
                'maximum_discount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'starts_at' => 'nullable|date',
                'expires_at' => 'nullable|date|after:starts_at',
                'is_active' => 'boolean',
                'is_first_time_only' => 'boolean',
                'applicable_products' => 'nullable|array',
                'applicable_products.*' => 'integer',
                'applicable_categories' => 'nullable|array',
                'applicable_categories.*' => 'integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $coupon = Coupon::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Coupon created successfully',
                'data' => $coupon
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض كوبون محدد
     */
    public function show($id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $coupon
        ]);
    }

    /**
     * تحديث كوبون محدد
     */
    public function update(Request $request, $id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:coupons,code,' . $id,
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
            'is_first_time_only' => 'boolean',
            'applicable_products' => 'nullable|array',
            'applicable_products.*' => 'integer',
            'applicable_categories' => 'nullable|array',
            'applicable_categories.*' => 'integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon updated successfully',
            'data' => $coupon
        ]);
    }

    /**
     * حذف كوبون محدد
     */
    public function destroy($id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        $coupon->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon deleted successfully'
        ]);
    }

    /**
     * التحقق من صحة كوبون
     */
    public function validateCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'total_amount' => 'required|numeric|min:0',
            'user_id' => 'nullable|integer',
            'products' => 'nullable|array',
            'products.*.id' => 'integer',
            'products.*.category_id' => 'integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        // التحقق من صلاحية الكوبون
        if (!$coupon->isValid()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon is not valid or expired'
            ], 400);
        }

        // التحقق من الحد الأدنى للطلب
        if (!$coupon->canApplyToAmount($request->total_amount)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Minimum amount requirement not met',
                'minimum_amount' => $coupon->minimum_amount
            ], 400);
        }

        // حساب قيمة الخصم
        $discount = $coupon->calculateDiscount($request->total_amount);

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon is valid',
            'data' => [
                'coupon' => $coupon,
                'discount_amount' => $discount,
                'final_amount' => $request->total_amount - $discount
            ]
        ]);
    }

    /**
     * تفعيل/إلغاء تفعيل كوبون
     */
    public function toggleStatus($id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found'
            ], 404);
        }

        $coupon->is_active = !$coupon->is_active;
        $coupon->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Coupon status updated successfully',
            'data' => $coupon
        ]);
    }

    /**
     * عرض الكوبونات النشطة فقط
     */
    public function active()
    {
        $coupons = Coupon::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $coupons
        ]);
    }

    /**
     * عرض إحصائيات الكوبونات
     */
    public function statistics()
    {
        $total = Coupon::count();
        $active = Coupon::where('is_active', true)->count();
        $expired = Coupon::whereNotNull('expires_at')->where('expires_at', '<', now())->count();
        $used = Coupon::where('used_count', '>', 0)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'active' => $active,
                'expired' => $expired,
                'used' => $used,
                'unused' => $total - $used
            ]
        ]);
    }
}
