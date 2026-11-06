<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Category;
use App\Models\SellerCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RestaurantController extends Controller
{
    /**
     * قائمة المطاعم مع خيارات البحث والفلترة وحساب المسافة
     */
    public function index(Request $request)
    {
        try {
            $query = Seller::where('type', 'restaurant')
                ->where('status', 'active');

            // بحث بالاسم أو الوصف أو نوع المأكولات
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('store_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('cuisine_type', 'like', "%{$search}%");
                });
            }

            // تصفية حسب التصنيف الغذائي (عبر منتجات المطعم)
            if ($request->filled('category_id')) {
                $categoryId = $request->category_id;
                $query->whereHas('products', function ($pq) use ($categoryId) {
                    $pq->where('category_id', $categoryId)
                       ->where('is_active', true)
                       ->where('is_approved', true);
                });
            }

            // المطاعم المفتوحة حالياً فقط
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

            $restaurants = $query->withCount(['approvedProducts as meals_count'])->get();

            // حساب المسافة إذا توفرت إحداثيات العميل
            $customerLat = $request->latitude;
            $customerLng = $request->longitude;

            $transformed = $restaurants->map(function ($rest) use ($customerLat, $customerLng) {
                $distanceKm = null;
                $deliveryFee = env('BASE_DELIVERY_FEE', 15);

                if ($customerLat && $customerLng && $rest->latitude && $rest->longitude) {
                    $deliveryInfo = \App\Services\DeliveryService::calculateFee(
                        (float)$customerLat, (float)$customerLng,
                        (float)$rest->latitude, (float)$rest->longitude
                    );
                    $distanceKm = $deliveryInfo['distance_km'];
                    $deliveryFee = $deliveryInfo['fee'];
                }

                return [
                    'id' => $rest->id,
                    'name' => $rest->store_name,
                    'type' => 'restaurant',
                    'description' => $rest->description,
                    'avatar' => $rest->avatar,
                    'cover_image' => $rest->cover_image,
                    'rating' => (float)$rest->rating,
                    'reviews_count' => (int)$rest->reviews_count,
                    'is_open' => (bool)$rest->is_open,
                    'accepting_orders' => (bool)$rest->accepting_orders,
                    'preparation_time' => $rest->preparation_time ?: '20-30 دقيقة',
                    'min_order_amount' => (float)$rest->min_order_amount,
                    'cuisine_type' => $rest->cuisine_type ?: 'وجبات سريعة ومأكولات متنوعة',
                    'address' => $rest->address,
                    'city' => $rest->city,
                    'latitude' => $rest->latitude,
                    'longitude' => $rest->longitude,
                    'distance_km' => $distanceKm,
                    'delivery_fee' => $deliveryFee,
                    'meals_count' => $rest->meals_count,
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
            Log::error('Error fetching restaurants: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'حدث خطأ أثناء جلب المطاعم'], 500);
        }
    }

    /**
     * المطاعم المميزة والأعلى تقييماً
     */
    public function featured(Request $request)
    {
        try {
            $restaurants = Seller::where('type', 'restaurant')
                ->where('status', 'active')
                ->orderByDesc('rating')
                ->orderByDesc('reviews_count')
                ->take(8)
                ->get()
                ->map(function ($rest) {
                    return [
                        'id' => $rest->id,
                        'name' => $rest->store_name,
                        'description' => $rest->description,
                        'avatar' => $rest->avatar,
                        'cover_image' => $rest->cover_image,
                        'rating' => (float)$rest->rating,
                        'reviews_count' => (int)$rest->reviews_count,
                        'is_open' => (bool)$rest->is_open,
                        'preparation_time' => $rest->preparation_time ?: '20-30 دقيقة',
                        'cuisine_type' => $rest->cuisine_type ?: 'مأكولات شهية',
                        'min_order_amount' => (float)$rest->min_order_amount,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $restaurants
            ]);
        } catch (\Exception $e) {
            Log::error('Featured restaurants error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch featured restaurants'], 500);
        }
    }

    /**
     * تفاصيل المطعم الكاملة مع قائمة الطعام والأقسام والوجبات
     */
    public function show(Request $request, $id)
    {
        try {
            $seller = Seller::where('type', 'restaurant')->findOrFail($id);

            // جلب وجبات المطعم المصرح بها
            $meals = Product::where('seller_id', $seller->id)
                ->where('is_active', true)
                ->where('is_approved', true)
                ->with(['category:id,name,slug'])
                ->get();

            // تنظيم قائمة الطعام حسب الأقسام
            $menuSections = [];
            $categoriesGrouped = $meals->groupBy(function ($meal) {
                return $meal->category ? $meal->category->name : 'أطباق أخرى';
            });

            foreach ($categoriesGrouped as $categoryName => $items) {
                $menuSections[] = [
                    'category_name' => $categoryName,
                    'meals' => $items->map(function ($meal) {
                        return [
                            'id' => $meal->id,
                            'name' => $meal->name,
                            'slug' => $meal->slug,
                            'description' => $meal->description,
                            'detailed_description' => $meal->detailed_description,
                            'price' => (float)$meal->price,
                            'sale_price' => $meal->sale_price ? (float)$meal->sale_price : null,
                            'image_url' => $meal->image_url,
                            'preparation_time' => $meal->preparation_time ?: 20,
                            'food_options' => $meal->food_options ?: [
                                'sizes' => [],
                                'extras' => [
                                    ['name' => 'إضافة جبنة تشيدر', 'price' => 0.50],
                                    ['name' => 'صوص إضافي خاص', 'price' => 0.30],
                                    ['name' => 'بطاطس مقلية مقرمشة', 'price' => 1.00],
                                    ['name' => 'مشروب غازي بارد', 'price' => 1.00],
                                ],
                                'removals' => [
                                    ['name' => 'بدون بصل'],
                                    ['name' => 'بدون طماطم'],
                                    ['name' => 'بدون مخلل'],
                                    ['name' => 'بدون صوص حار'],
                                ]
                            ],
                            'rating' => (float)$meal->rating,
                            'is_featured' => (bool)$meal->is_featured,
                            'is_available' => $meal->stock > 0,
                        ];
                    })->values()
                ];
            }

            // حساب المسافة ورسوم التوصيل التقريبية
            $distanceKm = null;
            $deliveryFee = env('BASE_DELIVERY_FEE', 15);
            if ($request->latitude && $request->longitude && $seller->latitude && $seller->longitude) {
                $calc = \App\Services\DeliveryService::calculateFee(
                    (float)$request->latitude, (float)$request->longitude,
                    (float)$seller->latitude, (float)$seller->longitude
                );
                $distanceKm = $calc['distance_km'];
                $deliveryFee = $calc['fee'];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $seller->id,
                    'name' => $seller->store_name,
                    'type' => 'restaurant',
                    'description' => $seller->description,
                    'avatar' => $seller->avatar,
                    'cover_image' => $seller->cover_image,
                    'rating' => (float)$seller->rating,
                    'reviews_count' => (int)$seller->reviews_count,
                    'is_open' => (bool)$seller->is_open,
                    'accepting_orders' => (bool)$seller->accepting_orders,
                    'preparation_time' => $seller->preparation_time ?: '20-30 دقيقة',
                    'min_order_amount' => (float)$seller->min_order_amount,
                    'cuisine_type' => $seller->cuisine_type ?: 'وجبات ومأكولات متنوعة',
                    'address' => $seller->address,
                    'city' => $seller->city,
                    'working_hours' => $seller->working_hours ?: [
                        'saturday' => ['open' => '10:00', 'close' => '00:00', 'is_closed' => false],
                        'sunday' => ['open' => '10:00', 'close' => '00:00', 'is_closed' => false],
                        'monday' => ['open' => '10:00', 'close' => '00:00', 'is_closed' => false],
                        'tuesday' => ['open' => '10:00', 'close' => '00:00', 'is_closed' => false],
                        'wednesday' => ['open' => '10:00', 'close' => '00:00', 'is_closed' => false],
                        'thursday' => ['open' => '10:00', 'close' => '01:00', 'is_closed' => false],
                        'friday' => ['open' => '13:00', 'close' => '01:00', 'is_closed' => false],
                    ],
                    'distance_km' => $distanceKm,
                    'delivery_fee' => $deliveryFee,
                    'menu_sections' => $menuSections,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading restaurant detail: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'المطعم غير موجود'], 404);
        }
    }

    /**
     * الوجبات الأكثر طلباً / العروض الغذائية
     */
    public function popularMeals(Request $request)
    {
        try {
            $meals = Product::whereHas('seller', function ($q) {
                    $q->where('type', 'restaurant')->where('status', 'active');
                })
                ->where('is_active', true)
                ->where('is_approved', true)
                ->with(['seller:id,store_name,rating,reviews_count,preparation_time,is_open', 'category:id,name'])
                ->orderByDesc('sold_count')
                ->orderByDesc('rating')
                ->take(12)
                ->get()
                ->map(function ($meal) {
                    return [
                        'id' => $meal->id,
                        'name' => $meal->name,
                        'slug' => $meal->slug,
                        'description' => $meal->description,
                        'price' => (float)$meal->price,
                        'sale_price' => $meal->sale_price ? (float)$meal->sale_price : null,
                        'image_url' => $meal->image_url,
                        'preparation_time' => $meal->preparation_time ?: 20,
                        'food_options' => $meal->food_options,
                        'rating' => (float)$meal->rating,
                        'category_name' => $meal->category ? $meal->category->name : 'وجبات',
                        'seller' => [
                            'id' => $meal->seller->id,
                            'name' => $meal->seller->store_name,
                            'is_open' => (bool)$meal->seller->is_open,
                            'preparation_time' => $meal->seller->preparation_time ?: '20-30 دقيقة',
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $meals
            ]);
        } catch (\Exception $e) {
            Log::error('Popular meals error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to fetch popular meals'], 500);
        }
    }
}
