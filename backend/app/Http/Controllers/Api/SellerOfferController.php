<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SellerOfferController extends Controller
{
    /**
     * عرض جميع عروض البائع
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

            $query = Offer::withCount('products')
                ->where('seller_id', $seller->id);

            // فلترة حسب الحالة
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // ترتيب
            $query->orderBy('sort_order')->orderBy('created_at', 'desc');

            $offers = $query->get();

            return response()->json([
                'status' => 'success',
                'data' => $offers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch offers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض تفاصيل عرض معين
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

            $offer = Offer::with(['products' => function ($query) {
                $query->orderBy('offer_products.sort_order');
            }])->withCount('products')
                ->where('seller_id', $seller->id)
                ->findOrFail($id);

            // إضافة معلومات الخصم لكل منتج
            $offer->products->transform(function ($product) use ($offer) {
                $pivot = $product->pivot;
                $originalPrice = $product->price;
                
                // حساب السعر بعد الخصم
                if ($pivot->special_price) {
                    $discountedPrice = $pivot->special_price;
                } else {
                    switch ($offer->discount_type) {
                        case 'percentage':
                            $discountedPrice = $originalPrice - ($originalPrice * ($offer->discount_value / 100));
                            break;
                        case 'fixed':
                            $discountedPrice = max(0, $originalPrice - $offer->discount_value);
                            break;
                        case 'free_shipping':
                            $discountedPrice = $originalPrice;
                            break;
                        default:
                            $discountedPrice = $originalPrice;
                    }
                }

                // حساب نسبة الخصم
                $discountPercentage = $originalPrice > 0 
                    ? round((($originalPrice - $discountedPrice) / $originalPrice) * 100) 
                    : 0;

                $product->original_price = $originalPrice;
                $product->discounted_price = round($discountedPrice, 2);
                $product->discount_percentage = $discountPercentage;
                $product->special_price = $pivot->special_price;
                $product->is_free_shipping = $offer->discount_type === 'free_shipping';

                return $product;
            });

            // التحقق من أن العرض نشط
            $offer->is_active = $offer->isActive();

            return response()->json([
                'status' => 'success',
                'data' => $offer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch offer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء عرض جديد للبائع
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

            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'banner' => 'nullable|image|max:2048',
                'thumbnail' => 'nullable|image|max:2048',
                'discount_type' => 'required|in:percentage,fixed,free_shipping',
                'discount_value' => 'required|numeric|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'required|in:active,inactive,scheduled',
                'sort_order' => 'integer|min:0',
                'product_ids' => 'nullable|array',
                'product_ids.*' => 'exists:products,id',
                'special_prices' => 'nullable|array',
            ]);

            // رفع الصور
            $bannerPath = null;
            $thumbnailPath = null;

            if ($request->hasFile('banner')) {
                $bannerPath = $request->file('banner')->store('offers/banners', 'public');
            }

            if ($request->hasFile('thumbnail')) {
                $thumbnailPath = $request->file('thumbnail')->store('offers/thumbnails', 'public');
            }

            // إنشاء العرض
            $offer = Offer::create([
                'seller_id' => $seller->id,
                'title' => $request->title,
                'slug' => Str::slug($request->title) . '-' . time(),
                'description' => $request->description,
                'banner' => $bannerPath,
                'thumbnail' => $thumbnailPath,
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_value,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status,
                'show_in_home' => false, // البائع لا يمكنه عرض في الصفحة الرئيسية
                'sort_order' => $request->sort_order ?? 0,
            ]);

            // ربط المنتجات بالعرض - فقط منتجات البائع
            if ($request->has('product_ids') && is_array($request->product_ids)) {
                // التحقق من أن المنتجات تخص البائع
                $validProductIds = Product::where('seller_id', $seller->id)
                    ->whereIn('id', $request->product_ids)
                    ->pluck('id')
                    ->toArray();

                $productData = [];
                foreach ($validProductIds as $index => $productId) {
                    $specialPrice = $request->special_prices[$productId] ?? null;
                    $productData[$productId] = [
                        'special_price' => $specialPrice,
                        'sort_order' => $index,
                    ];
                }
                $offer->products()->attach($productData);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'تم إنشاء العرض بنجاح',
                'data' => $offer->load('products')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create offer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث عرض للبائع
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

            $offer = Offer::where('seller_id', $seller->id)->findOrFail($id);

            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'banner' => 'nullable|image|max:2048',
                'thumbnail' => 'nullable|image|max:2048',
                'discount_type' => 'required|in:percentage,fixed,free_shipping',
                'discount_value' => 'required|numeric|min:0',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'required|in:active,inactive,scheduled',
                'sort_order' => 'integer|min:0',
                'product_ids' => 'nullable|array',
                'product_ids.*' => 'exists:products,id',
                'special_prices' => 'nullable|array',
            ]);

            // رفع الصور الجديدة
            if ($request->hasFile('banner')) {
                // حذف الصورة القديمة
                if ($offer->banner) {
                    Storage::disk('public')->delete($offer->banner);
                }
                $bannerPath = $request->file('banner')->store('offers/banners', 'public');
                $offer->banner = $bannerPath;
            }

            if ($request->hasFile('thumbnail')) {
                // حذف الصورة القديمة
                if ($offer->thumbnail) {
                    Storage::disk('public')->delete($offer->thumbnail);
                }
                $thumbnailPath = $request->file('thumbnail')->store('offers/thumbnails', 'public');
                $offer->thumbnail = $thumbnailPath;
            }

            // تحديث البيانات
            $offer->update([
                'title' => $request->title,
                'slug' => Str::slug($request->title) . '-' . time(),
                'description' => $request->description,
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_value,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status,
                'sort_order' => $request->sort_order ?? 0,
            ]);

            // تحديث المنتجات المرتبطة - فقط منتجات البائع
            if ($request->has('product_ids') && is_array($request->product_ids)) {
                // التحقق من أن المنتجات تخص البائع
                $validProductIds = Product::where('seller_id', $seller->id)
                    ->whereIn('id', $request->product_ids)
                    ->pluck('id')
                    ->toArray();

                $productData = [];
                foreach ($validProductIds as $index => $productId) {
                    $specialPrice = $request->special_prices[$productId] ?? null;
                    $productData[$productId] = [
                        'special_price' => $specialPrice,
                        'sort_order' => $index,
                    ];
                }
                $offer->products()->sync($productData);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديث العرض بنجاح',
                'data' => $offer->load('products')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update offer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف عرض للبائع
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

            $offer = Offer::where('seller_id', $seller->id)->findOrFail($id);

            // حذف الصور
            if ($offer->banner) {
                Storage::disk('public')->delete($offer->banner);
            }
            if ($offer->thumbnail) {
                Storage::disk('public')->delete($offer->thumbnail);
            }

            // حذف العرض
            $offer->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'تم حذف العرض بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete offer',
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
