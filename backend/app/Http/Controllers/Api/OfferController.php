<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OfferController extends Controller
{
    /**
     * عرض جميع العروض
     */
    public function index(Request $request)
    {
        $query = Offer::withCount('products');

        // فلترة حسب الحالة
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // فلترة حسب عرض في الصفحة الرئيسية
        if ($request->has('show_in_home') && $request->boolean('show_in_home')) {
            $query->where('show_in_home', true);
        }

        // ترتيب
        $query->orderBy('sort_order')->orderBy('created_at', 'desc');

        $offers = $query->paginate(12);

        return response()->json($offers);
    }

    /**
     * عرض العروض النشطة للواجهة الأمامية
     */
    public function active(Request $request)
    {
        $now = now();

        $query = Offer::withCount('products')
            ->where('status', 'active')
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now);
            });

        // العروض في الصفحة الرئيسية
        if ($request->has('show_in_home') && $request->boolean('show_in_home')) {
            $query->where('show_in_home', true);
        }

        $query->orderBy('sort_order')->orderBy('created_at', 'desc');

        $offers = $query->paginate(12);

        return response()->json($offers);
    }

    /**
     * عرض تفاصيل عرض معين مع المنتجات المرتبطة
     */
    public function show($id)
    {
        $offer = Offer::with(['products' => function ($query) {
            $query->orderBy('offer_products.sort_order');
        }])->withCount('products')->findOrFail($id);

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

        return response()->json($offer);
    }

    /**
     * إنشاء عرض جديد (للوحة التحكم)
     */
    public function store(Request $request)
    {
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
            'show_in_home' => 'boolean',
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
            'show_in_home' => $request->show_in_home ?? false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        // ربط المنتجات بالعرض
        if ($request->has('product_ids') && is_array($request->product_ids)) {
            $productData = [];
            foreach ($request->product_ids as $index => $productId) {
                $specialPrice = $request->special_prices[$productId] ?? null;
                $productData[$productId] = [
                    'special_price' => $specialPrice,
                    'sort_order' => $index,
                ];
            }
            $offer->products()->attach($productData);
        }

        return response()->json([
            'message' => 'تم إنشاء العرض بنجاح',
            'offer' => $offer->load('products')
        ], 201);
    }

    /**
     * تحديث عرض (للوحة التحكم)
     */
    public function update(Request $request, $id)
    {
        $offer = Offer::findOrFail($id);

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
            'show_in_home' => 'boolean',
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
            'show_in_home' => $request->show_in_home ?? false,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        // تحديث المنتجات المرتبطة
        if ($request->has('product_ids') && is_array($request->product_ids)) {
            $productData = [];
            foreach ($request->product_ids as $index => $productId) {
                $specialPrice = $request->special_prices[$productId] ?? null;
                $productData[$productId] = [
                    'special_price' => $specialPrice,
                    'sort_order' => $index,
                ];
            }
            $offer->products()->sync($productData);
        }

        return response()->json([
            'message' => 'تم تحديث العرض بنجاح',
            'offer' => $offer->load('products')
        ]);
    }

    /**
     * حذف عرض
     */
    public function destroy($id)
    {
        $offer = Offer::findOrFail($id);

        // حذف الصور
        if ($offer->banner) {
            Storage::disk('public')->delete($offer->banner);
        }
        if ($offer->thumbnail) {
            Storage::disk('public')->delete($offer->thumbnail);
        }

        // حذف العرض (سيتم حذف العلاقات تلقائياً بسبب onDelete cascade)
        $offer->delete();

        return response()->json([
            'message' => 'تم حذف العرض بنجاح'
        ]);
    }

    /**
     * إضافة منتج إلى عرض
     */
    public function addProduct(Request $request, $offerId)
    {
        $offer = Offer::findOrFail($offerId);
        $product = Product::findOrFail($request->product_id);

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'special_price' => 'nullable|numeric|min:0',
        ]);

        // التحقق من أن المنتج غير مضاف مسبقاً
        if ($offer->products()->where('product_id', $product->id)->exists()) {
            return response()->json([
                'message' => 'المنتج مضاف بالفعل لهذا العرض'
            ], 400);
        }

        // إضافة المنتج
        $maxSortOrder = $offer->products()->max('offer_products.sort_order') ?? 0;
        $offer->products()->attach($product->id, [
            'special_price' => $request->special_price,
            'sort_order' => $maxSortOrder + 1,
        ]);

        return response()->json([
            'message' => 'تم إضافة المنتج للعرض بنجاح'
        ]);
    }

    /**
     * إزالة منتج من عرض
     */
    public function removeProduct($offerId, $productId)
    {
        $offer = Offer::findOrFail($offerId);
        $offer->products()->detach($productId);

        return response()->json([
            'message' => 'تم إزالة المنتج من العرض بنجاح'
        ]);
    }

    /**
     * تحديث سعر خاص لمنتج في عرض
     */
    public function updateProductPrice(Request $request, $offerId, $productId)
    {
        $offer = Offer::findOrFail($offerId);
        
        $request->validate([
            'special_price' => 'nullable|numeric|min:0',
        ]);

        $offer->products()->updateExistingPivot($productId, [
            'special_price' => $request->special_price,
        ]);

        return response()->json([
            'message' => 'تم تحديث السعر الخاص بنجاح'
        ]);
    }
}
