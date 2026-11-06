<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    /**
     * قائمة الأنشطة المفعلة للواجهة الأمامية
     */
    public function index(Request $request)
    {
        try {
            $activities = Activity::active()
                ->withCount([
                    'sellers as places_count' => function ($q) {
                        $q->where('status', 'active');
                    },
                    'categories as categories_count' => function ($q) {
                        $q->where('is_active', true);
                    }
                ])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching activities: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'تعذر جلب قائمة الأنشطة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تفاصيل نشاط معين بالرمز أو المعرف
     */
    public function show(Request $request, $slugOrId)
    {
        try {
            $activity = Activity::where('slug', $slugOrId)
                ->orWhere('id', $slugOrId)
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $activity
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'النشاط غير موجود'
            ], 404);
        }
    }

    /**
     * تصنيفات نشاط معين (مثل تصنيفات المأكولات للمطاعم، أو تصنيفات المشروبات للكافيهات)
     */
    public function categories(Request $request, $slugOrId)
    {
        try {
            $activity = Activity::where('slug', $slugOrId)
                ->orWhere('id', $slugOrId)
                ->first();

            $slug = $activity ? $activity->slug : $slugOrId;

            $categories = Category::where('type', $slug)
                ->where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching activity categories: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'تعذر جلب تصنيفات النشاط'], 500);
        }
    }

    /**
     * جلب الأماكن / المتاجر التابعة لهذا النشاط (مثل قائمة المطاعم أو الكافيهات أو المخابز)
     */
    public function places(Request $request, $slugOrId)
    {
        try {
            $activity = Activity::where('slug', $slugOrId)
                ->orWhere('id', $slugOrId)
                ->first();

            $slug = $activity ? $activity->slug : $slugOrId;

            $query = Seller::where('type', $slug)
                ->where('status', 'active');

            // بحث بالاسم أو الوصف أو التخصص
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('store_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('cuisine_type', 'like', "%{$search}%");
                });
            }

            // تصفية حسب التصنيف
            if ($request->filled('category_id')) {
                $categoryId = $request->category_id;
                $query->whereHas('products', function ($pq) use ($categoryId) {
                    $pq->where('category_id', $categoryId)
                       ->where('is_active', true)
                       ->where('is_approved', true);
                });
            }

            // المفتوحة حالياً فقط
            if ($request->boolean('open_only')) {
                $query->where('is_open', true)->where('accepting_orders', true);
            }

            // الترتيب
            $sortBy = $request->query('sort_by', 'popular');
            if ($sortBy === 'rating') {
                $query->orderByDesc('rating')->orderByDesc('reviews_count');
            } elseif ($sortBy === 'newest') {
                $query->latest();
            } else {
                $query->orderByDesc('is_open')->orderByDesc('rating');
            }

            $places = $query->withCount(['approvedProducts as items_count'])->get();

            // حساب المسافة
            $customerLat = $request->latitude;
            $customerLng = $request->longitude;

            $placeLabel = $activity ? $activity->place_label : 'مكان';
            $itemLabel = $activity ? $activity->item_label : 'صنف';

            $transformed = $places->map(function ($place) use ($customerLat, $customerLng, $slug, $placeLabel, $itemLabel) {
                $distanceKm = null;
                $deliveryFee = env('BASE_DELIVERY_FEE', 15);

                if ($customerLat && $customerLng && $place->latitude && $place->longitude) {
                    if (class_exists(\App\Services\DeliveryService::class)) {
                        $deliveryInfo = \App\Services\DeliveryService::calculateFee(
                            (float)$customerLat, (float)$customerLng,
                            (float)$place->latitude, (float)$place->longitude
                        );
                        $distanceKm = $deliveryInfo['distance_km'];
                        $deliveryFee = $deliveryInfo['fee'];
                    }
                }

                return [
                    'id' => $place->id,
                    'name' => $place->store_name,
                    'type' => $slug,
                    'place_label' => $placeLabel,
                    'item_label' => $itemLabel,
                    'description' => $place->description,
                    'avatar' => $place->avatar,
                    'cover_image' => $place->cover_image,
                    'rating' => (float)$place->rating,
                    'reviews_count' => (int)$place->reviews_count,
                    'is_open' => (bool)$place->is_open,
                    'accepting_orders' => (bool)$place->accepting_orders,
                    'preparation_time' => $place->preparation_time ?: '20-30 دقيقة',
                    'min_order_amount' => (float)$place->min_order_amount,
                    'cuisine_type' => $place->cuisine_type ?: 'أصناف متنوعة ومميزة',
                    'address' => $place->address,
                    'city' => $place->city,
                    'latitude' => $place->latitude,
                    'longitude' => $place->longitude,
                    'distance_km' => $distanceKm,
                    'delivery_fee' => $deliveryFee,
                    'items_count' => $place->items_count,
                ];
            });

            if ($sortBy === 'nearby' && $customerLat && $customerLng) {
                $transformed = $transformed->sortBy(function ($item) {
                    return $item['distance_km'] ?? 999999;
                })->values();
            }

            return response()->json([
                'success' => true,
                'data' => $transformed
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching activity places: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'حدث خطأ أثناء جلب الأماكن'], 500);
        }
    }

    /**
     * الأصناف الأكثر طلباً في هذا النشاط
     */
    public function popularItems(Request $request, $slugOrId)
    {
        try {
            $activity = Activity::where('slug', $slugOrId)
                ->orWhere('id', $slugOrId)
                ->first();

            $slug = $activity ? $activity->slug : $slugOrId;

            $items = Product::whereHas('seller', function ($q) use ($slug) {
                    $q->where('type', $slug)->where('status', 'active');
                })
                ->where('is_active', true)
                ->where('is_approved', true)
                ->with(['seller:id,store_name,rating,reviews_count,preparation_time,is_open,type', 'category:id,name'])
                ->orderByDesc('sold_count')
                ->orderByDesc('rating')
                ->take(12)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'slug' => $item->slug,
                        'description' => $item->description,
                        'price' => (float)$item->price,
                        'sale_price' => $item->sale_price ? (float)$item->sale_price : null,
                        'image_url' => $item->image_url,
                        'preparation_time' => $item->preparation_time ?: 20,
                        'food_options' => $item->food_options,
                        'rating' => (float)$item->rating,
                        'category_name' => $item->category ? $item->category->name : 'أصناف مختارة',
                        'seller' => [
                            'id' => $item->seller->id,
                            'name' => $item->seller->store_name,
                            'type' => $item->seller->type,
                            'is_open' => (bool)$item->seller->is_open,
                            'preparation_time' => $item->seller->preparation_time ?: '20-30 دقيقة',
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching popular items: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'تعذر جلب الأصناف'], 500);
        }
    }

    /**
     * تفاصيل أي مكان / متجر / مطعم تابع لأي نشاط (بنفس نسق صفحة تفاصيل المطعم تماماً)
     */
    public function placeDetail(Request $request, $id)
    {
        try {
            $seller = Seller::findOrFail($id);

            // جلب معلومات النشاط لتخصيص المسميات
            $activity = Activity::where('slug', $seller->type)->first();
            $placeLabel = $activity ? $activity->place_label : ($seller->type === 'restaurant' ? 'مطعم' : 'متجر');
            $itemLabel = $activity ? $activity->item_label : ($seller->type === 'restaurant' ? 'وجبة' : 'صنف');

            // جلب منتجات/أصناف المكان المصرح بها
            $products = Product::where('seller_id', $seller->id)
                ->where('is_active', true)
                ->where('is_approved', true)
                ->with(['category:id,name,slug'])
                ->get();

            // تنظيم القائمة حسب الأقسام والتصنيفات
            $menuSections = [];
            $categoriesGrouped = $products->groupBy(function ($item) {
                return $item->category ? $item->category->name : 'أصناف متنوعة';
            });

            foreach ($categoriesGrouped as $categoryName => $items) {
                $menuSections[] = [
                    'category_name' => $categoryName,
                    'meals' => $items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'name' => $item->name,
                            'slug' => $item->slug,
                            'description' => $item->description,
                            'detailed_description' => $item->detailed_description,
                            'price' => (float)$item->price,
                            'sale_price' => $item->sale_price ? (float)$item->sale_price : null,
                            'image_url' => $item->image_url,
                            'preparation_time' => $item->preparation_time ?: 20,
                            'food_options' => $item->food_options ?: [
                                'sizes' => [],
                                'extras' => [
                                    ['name' => 'إضافة مميزة خاصة', 'price' => 0.50],
                                    ['name' => 'تغليف هدايا فاخر', 'price' => 1.00],
                                ],
                                'removals' => [
                                    ['name' => 'بدون إضافات حارة'],
                                    ['name' => 'بدون سكر إضافي'],
                                ]
                            ],
                            'rating' => (float)$item->rating,
                            'is_featured' => (bool)$item->is_featured,
                            'is_available' => $item->stock > 0,
                        ];
                    })->values()
                ];
            }

            // حساب المسافة ورسوم التوصيل
            $distanceKm = null;
            $deliveryFee = env('BASE_DELIVERY_FEE', 15);
            if ($request->latitude && $request->longitude && $seller->latitude && $seller->longitude) {
                if (class_exists(\App\Services\DeliveryService::class)) {
                    $calc = \App\Services\DeliveryService::calculateFee(
                        (float)$request->latitude, (float)$request->longitude,
                        (float)$seller->latitude, (float)$seller->longitude
                    );
                    $distanceKm = $calc['distance_km'];
                    $deliveryFee = $calc['fee'];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $seller->id,
                    'name' => $seller->store_name,
                    'type' => $seller->type,
                    'place_label' => $placeLabel,
                    'item_label' => $itemLabel,
                    'activity_name' => $activity ? $activity->name : null,
                    'activity_icon' => $activity ? $activity->icon : '🏬',
                    'description' => $seller->description,
                    'avatar' => $seller->avatar,
                    'cover_image' => $seller->cover_image,
                    'rating' => (float)$seller->rating,
                    'reviews_count' => (int)$seller->reviews_count,
                    'is_open' => (bool)$seller->is_open,
                    'accepting_orders' => (bool)$seller->accepting_orders,
                    'preparation_time' => $seller->preparation_time ?: '20-30 دقيقة',
                    'min_order_amount' => (float)$seller->min_order_amount,
                    'cuisine_type' => $seller->cuisine_type ?: 'أصناف متنوعة وخدمة متميزة',
                    'address' => $seller->address,
                    'city' => $seller->city,
                    'working_hours' => $seller->working_hours ?: [
                        'saturday' => ['open' => '09:00', 'close' => '23:00', 'is_closed' => false],
                        'sunday' => ['open' => '09:00', 'close' => '23:00', 'is_closed' => false],
                        'monday' => ['open' => '09:00', 'close' => '23:00', 'is_closed' => false],
                        'tuesday' => ['open' => '09:00', 'close' => '23:00', 'is_closed' => false],
                        'wednesday' => ['open' => '09:00', 'close' => '23:00', 'is_closed' => false],
                        'thursday' => ['open' => '09:00', 'close' => '00:00', 'is_closed' => false],
                        'friday' => ['open' => '13:00', 'close' => '00:00', 'is_closed' => false],
                    ],
                    'distance_km' => $distanceKm,
                    'delivery_fee' => $deliveryFee,
                    'menu_sections' => $menuSections,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading place detail: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'المكان غير موجود'], 404);
        }
    }

    /* -------------------------------------------------------------
     * لوحة تحكم المدير: إدارة الأنشطة (Admin CRUD)
     * ------------------------------------------------------------- */

    /**
     * جلب جميع الأنشطة للمدير مع الإحصائيات
     */
    public function adminIndex(Request $request)
    {
        try {
            $activities = Activity::orderBy('sort_order', 'asc')
                ->withCount([
                    'sellers as places_count',
                    'categories as categories_count'
                ])
                ->get()
                ->map(function ($act) {
                    // حساب إجمالي المنتجات التابعة لأماكن هذا النشاط
                    $itemsCount = Product::whereHas('seller', function ($q) use ($act) {
                        $q->where('type', $act->slug);
                    })->count();

                    $actArr = $act->toArray();
                    $actArr['items_count'] = $itemsCount;
                    return $actArr;
                });

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);
        } catch (\Exception $e) {
            Log::error('Admin activities fetch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'تعذر جلب الأنشطة: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إضافة نشاط تجاري جديد
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'slug' => 'nullable|string|max:50|unique:activities,slug',
                'icon' => 'nullable|string|max:20',
                'description' => 'nullable|string|max:500',
                'banner_title' => 'nullable|string|max:255',
                'banner_subtitle' => 'nullable|string|max:500',
                'banner_bg' => 'nullable|string|max:255',
                'banner_image' => 'nullable|string|max:500',
                'place_label' => 'nullable|string|max:50',
                'item_label' => 'nullable|string|max:50',
                'is_active' => 'nullable|boolean',
                'sort_order' => 'nullable|integer',
            ]);

            // توليد الرمز slug إن لم يمرر
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']) ?: ('act_' . time());
                // التحقق من فرادة الرمز
                if (Activity::where('slug', $validated['slug'])->exists()) {
                    $validated['slug'] .= '_' . rand(100, 999);
                }
            } else {
                $validated['slug'] = Str::slug($validated['slug']);
            }

            // ضبط القيم الافتراضية المناسبة
            if (empty($validated['icon'])) $validated['icon'] = '✨';
            if (empty($validated['place_label'])) $validated['place_label'] = 'مكان';
            if (empty($validated['item_label'])) $validated['item_label'] = 'صنف';
            if (empty($validated['banner_title'])) {
                $validated['banner_title'] = "أفضل {$validated['name']} في منصتنا";
            }
            if (empty($validated['banner_subtitle'])) {
                $validated['banner_subtitle'] = "اطلب الآن واستمتع بتجربة تسوق سريعة ومميزة وتوصيل فوري لباب منزلك.";
            }
            if (empty($validated['banner_bg'])) {
                $validated['banner_bg'] = 'from-amber-600 via-orange-600 to-amber-700';
            }
            if (!isset($validated['is_active'])) $validated['is_active'] = true;
            if (!isset($validated['sort_order'])) {
                $validated['sort_order'] = (Activity::max('sort_order') ?? 0) + 1;
            }

            $activity = Activity::create($validated);

            return response()->json([
                'success' => true,
                'message' => "تم إضافة نشاط '{$activity->name}' بنجاح!",
                'data' => $activity
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات النشاط غير صالحة',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating activity: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في حفظ النشاط: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تفاصيل نشاط للمدير
     */
    public function adminShow($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            return response()->json(['success' => true, 'data' => $activity]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'النشاط غير موجود'], 404);
        }
    }

    /**
     * تحديث بيانات نشاط
     */
    public function update(Request $request, $id)
    {
        try {
            $activity = Activity::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:100',
                'slug' => 'required|string|max:50|unique:activities,slug,' . $id,
                'icon' => 'nullable|string|max:20',
                'description' => 'nullable|string|max:500',
                'banner_title' => 'nullable|string|max:255',
                'banner_subtitle' => 'nullable|string|max:500',
                'banner_bg' => 'nullable|string|max:255',
                'banner_image' => 'nullable|string|max:500',
                'place_label' => 'nullable|string|max:50',
                'item_label' => 'nullable|string|max:50',
                'is_active' => 'nullable|boolean',
                'sort_order' => 'nullable|integer',
            ]);

            $oldSlug = $activity->slug;
            $newSlug = Str::slug($validated['slug']);
            $validated['slug'] = $newSlug;

            $activity->update($validated);

            // إذا تغير الرمز slug، تحديث البائعين والتصنيفات والإعلانات المرتبطة
            if ($oldSlug !== $newSlug) {
                Seller::where('type', $oldSlug)->update(['type' => $newSlug]);
                Category::where('type', $oldSlug)->update(['type' => $newSlug]);
                if (\Illuminate\Support\Facades\Schema::hasColumn('banners', 'type')) {
                    \App\Models\Banner::where('type', $oldSlug)->update(['type' => $newSlug]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "تم تحديث نشاط '{$activity->name}' بنجاح!",
                'data' => $activity
            ]);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات التحديث غير صالحة',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating activity: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في تحديث النشاط: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تبديل حالة التفعيل
     */
    public function toggle($id)
    {
        try {
            $activity = Activity::findOrFail($id);
            $activity->is_active = !$activity->is_active;
            $activity->save();

            $statusText = $activity->is_active ? 'تفعيل' : 'تعطيل';
            return response()->json([
                'success' => true,
                'message' => "تم {$statusText} نشاط '{$activity->name}' بنجاح",
                'is_active' => $activity->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'تعذر تغيير حالة النشاط'], 500);
        }
    }

    /**
     * حذف نشاط
     */
    public function destroy($id)
    {
        try {
            $activity = Activity::findOrFail($id);

            // حماية نشاط المطاعم الأساسي من الحذف العرضي إذا رغب المدير بذلك
            if ($activity->slug === 'restaurant') {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف نشاط المطاعم الأساسي، يمكنك تعطيله بدلاً من ذلك.'
                ], 400);
            }

            // التحقق من وجود بائعين مسجلين تحت هذا النشاط
            $hasSellers = Seller::where('type', $activity->slug)->exists();
            if ($hasSellers) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف هذا النشاط لوجود متاجر/أماكن مسجلة تابعة له. قم بنقلها أو تعطيل النشاط بدلاً من حذفه.'
                ], 400);
            }

            $name = $activity->name;
            $activity->delete();

            return response()->json([
                'success' => true,
                'message' => "تم حذف نشاط '{$name}' بنجاح!"
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'تعذر حذف النشاط: ' . $e->getMessage()], 500);
        }
    }
}
