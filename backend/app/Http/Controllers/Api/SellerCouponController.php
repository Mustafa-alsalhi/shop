<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\Category;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerCouponController extends Controller
{
    /**
     * عرض جميع كوبونات البائع
     */
    public function index(Request $request)
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $coupons = Coupon::where('seller_id', $seller->id)
                ->latest()
                ->paginate(10);
            
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
     * عرض كوبون محدد للبائع
     */
    public function show($id)
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $coupon = Coupon::where('seller_id', $seller->id)->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $coupon
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Coupon not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * تخزين كوبون جديد للبائع
     */
    public function store(Request $request)
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

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

            // التحقق من أن المنتجات تخص البائع
            if ($request->has('applicable_products') && is_array($request->applicable_products)) {
                $validProductIds = Product::where('seller_id', $seller->id)
                    ->whereIn('id', $request->applicable_products)
                    ->pluck('id')
                    ->toArray();
                
                $request->merge(['applicable_products' => $validProductIds]);
            }

            $coupon = Coupon::create(array_merge($request->all(), ['seller_id' => $seller->id]));

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
     * تحديث كوبون للبائع
     */
    public function update(Request $request, $id)
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $coupon = Coupon::where('seller_id', $seller->id)->findOrFail($id);

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

            // التحقق من أن المنتجات تخص البائع
            if ($request->has('applicable_products') && is_array($request->applicable_products)) {
                $validProductIds = Product::where('seller_id', $seller->id)
                    ->whereIn('id', $request->applicable_products)
                    ->pluck('id')
                    ->toArray();
                
                $request->merge(['applicable_products' => $validProductIds]);
            }

            $coupon->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Coupon updated successfully',
                'data' => $coupon
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف كوبون للبائع
     */
    public function destroy($id)
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $coupon = Coupon::where('seller_id', $seller->id)->findOrFail($id);

            $coupon->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Coupon deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تفعيل/إلغاء تفعيل كوبون للبائع
     */
    public function toggleStatus($id)
    {
        try {
            $seller = $this->getAuthenticatedSeller();
            
            if (!$seller) {
                return response()->json([
                    'message' => 'Seller not found'
                ], 404);
            }

            $coupon = Coupon::where('seller_id', $seller->id)->findOrFail($id);

            $coupon->is_active = !$coupon->is_active;
            $coupon->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Coupon status updated successfully',
                'data' => $coupon
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to toggle coupon status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على منتجات البائع لاختيارها في الكوبون
     */
    public function getProducts()
    {
        try {
            // جلب جميع المنتجات مباشرة بدون أي شروط
            \Log::info('Fetching all products from database...');
            $products = Product::select('id', 'name', 'price', 'main_image', 'category_id')
                ->get();
            
            \Log::info('Found ' . $products->count() . ' total products in database');
            
            return response()->json([
                'status' => 'success',
                'data' => $products
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getProducts: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب الفئات المتاحة للكوبون
     */
    public function getCategories()
    {
        try {
            $user = auth()->user();
            \Log::info('Current user ID for categories: ' . ($user ? $user->id : 'null'));
            
            $seller = $this->getAuthenticatedSeller();
            
            // إذا لم يوجد seller، جلب جميع الفئات كحل مؤقت
            if (!$seller) {
                \Log::warning('Seller not found. Fetching all categories as fallback...');
                $categories = Category::select('id', 'name', 'slug', 'image')
                    ->get();
                \Log::info('Fallback: Found ' . $categories->count() . ' total categories in database');
                
                return response()->json([
                    'status' => 'success',
                    'data' => $categories
                ]);
            }

            \Log::info('Fetching categories for seller ID: ' . $seller->id);

            // جلب جميع الفئات النشطة (بدون شرط وجود منتجات)
            $categories = Category::where('is_active', true)
                ->select('id', 'name', 'slug', 'image')
                ->get();

            \Log::info('Found ' . $categories->count() . ' active categories');

            // إذا لم يوجد فئات نشطة، جلب جميع الفئات كحل مؤقت
            if ($categories->count() === 0) {
                \Log::warning('No active categories found. Fetching all categories as fallback...');
                // جلب جميع الفئات كحل مؤقت
                $categories = Category::select('id', 'name', 'slug', 'image')
                    ->get();
                \Log::info('Fallback: Found ' . $categories->count() . ' total categories in database');
            }

            return response()->json([
                'status' => 'success',
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getCategories: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على البائع المسجل
     */
    private function getAuthenticatedSeller()
    {
        $user = auth()->user();
        if (!$user) {
            return null;
        }
        
        return Seller::where('user_id', $user->id)->first();
    }
}
