<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Seller;
use App\Models\Product;
use App\Models\Category;

class SampleRestaurantSeeder extends Seeder
{
    public function run()
    {
        // 1. مطعم الشيباني للمأكولات اليمنية الأصيلة
        $user1 = User::firstOrCreate(
            ['email' => 'shaibani@restaurant.com'],
            [
                'name' => 'مطعم الشيباني',
                'password' => bcrypt('password123'),
                'role' => 'seller',
                'phone' => '777000111',
            ]
        );

        $shaibani = Seller::updateOrCreate(
            ['user_id' => $user1->id],
            [
                'store_name' => 'مطعم الشيباني للمأكولات اليمنية',
                'type' => 'restaurant',
                'description' => 'أصالة المطبخ اليمني، أشهى أطباق المندي، المظبي، الفحسة والسلتة على أصولها.',
                'avatar' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
                'cover_image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000',
                'rating' => 4.90,
                'reviews_count' => 340,
                'status' => 'active',
                'is_verified' => true,
                'is_open' => true,
                'accepting_orders' => true,
                'preparation_time' => '25-35 دقيقة',
                'min_order_amount' => 10.00,
                'cuisine_type' => 'مأكولات يمنية، مندي، شعبيات',
                'address' => 'شارع الستين، بالقرب من الجولة',
                'city' => 'صنعاء',
                'latitude' => 15.3694,
                'longitude' => 44.1910,
            ]
        );

        // 2. برجر فاكتوري
        $user2 = User::firstOrCreate(
            ['email' => 'burgerfactory@restaurant.com'],
            [
                'name' => 'برجر فاكتوري',
                'password' => bcrypt('password123'),
                'role' => 'seller',
                'phone' => '777000222',
            ]
        );

        $burgerFactory = Seller::updateOrCreate(
            ['user_id' => $user2->id],
            [
                'store_name' => 'برجر فاكتوري - Burger Factory',
                'type' => 'restaurant',
                'description' => 'أفضل برجر لحم ودجاج طازج مشوي على اللهب مع خلطات صوصاتنا السرية.',
                'avatar' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
                'cover_image' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000',
                'rating' => 4.85,
                'reviews_count' => 280,
                'status' => 'active',
                'is_verified' => true,
                'is_open' => true,
                'accepting_orders' => true,
                'preparation_time' => '15-25 دقيقة',
                'min_order_amount' => 5.00,
                'cuisine_type' => 'برجر، وجبات سريعة، صوصات',
                'address' => 'شارع حدة، أمام المول',
                'city' => 'صنعاء',
                'latitude' => 15.3350,
                'longitude' => 44.1980,
            ]
        );

        // 3. بيتزا نابولي
        $user3 = User::firstOrCreate(
            ['email' => 'napoli@restaurant.com'],
            [
                'name' => 'بيتزا نابولي',
                'password' => bcrypt('password123'),
                'role' => 'seller',
                'phone' => '777000333',
            ]
        );

        $napoli = Seller::updateOrCreate(
            ['user_id' => $user3->id],
            [
                'store_name' => 'بيتزا نابولي الإيطالية',
                'type' => 'restaurant',
                'description' => 'بيتزا إيطالية مخبوزة على الحجر بأجود أنواع جبنة الموزاريلا والخضار الطازجة.',
                'avatar' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
                'cover_image' => 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1000',
                'rating' => 4.80,
                'reviews_count' => 195,
                'status' => 'active',
                'is_verified' => true,
                'is_open' => true,
                'accepting_orders' => true,
                'preparation_time' => '20-30 دقيقة',
                'min_order_amount' => 8.00,
                'cuisine_type' => 'بيتزا، باستا، معجنات',
                'address' => 'شارع صخر',
                'city' => 'صنعاء',
                'latitude' => 15.3480,
                'longitude' => 44.2050,
            ]
        );

        // جلب التصنيفات
        $catBurger = Category::where('slug', 'burger')->first();
        $catPizza = Category::where('slug', 'pizza')->first();
        $catYemeni = Category::where('slug', 'yemeni-food')->first();

        // إضافة وجبات لـ برجر فاكتوري
        if ($catBurger) {
            Product::updateOrCreate(
                ['slug' => 'classic-beef-burger'],
                [
                    'name' => 'برجر لحم كلاسيك فاخر',
                    'sku' => 'MEAL-BURGER-01',
                    'seller_id' => $burgerFactory->id,
                    'seller_name' => $burgerFactory->store_name,
                    'category_id' => $catBurger->id,
                    'description' => 'قطعة لحم أنجوس مشوية على اللهب مع جبن الشيدر والخس وصوص الشيف.',
                    'detailed_description' => 'شريحة لحم بقر بلدي طازج 150 جرام مع خبز البريوش الطري والمخلل وصوص البرجر المميز.',
                    'price' => 5.50,
                    'sale_price' => 4.50,
                    'currency' => 'USD',
                    'stock' => 100,
                    'image_url' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
                    'is_active' => true,
                    'is_approved' => true,
                    'is_featured' => true,
                    'rating' => 4.9,
                    'reviews_count' => 120,
                    'sold_count' => 350,
                    'preparation_time' => 15,
                    'food_options' => [
                        'sizes' => [
                            ['name' => 'سنجل (شريحة واحدة)', 'price' => 4.50],
                            ['name' => 'دبل (شريحتين لحم)', 'price' => 6.50],
                            ['name' => 'تربل (3 شرائح لحم)', 'price' => 8.00],
                        ],
                        'extras' => [
                            ['name' => 'إضافة جبنة شيدر سائلة', 'price' => 0.50],
                            ['name' => 'إضافة شريحة بيكون مقرمش', 'price' => 1.00],
                            ['name' => 'إضافة بطاطس مقلية مقرمشة', 'price' => 1.00],
                            ['name' => 'صوص برجر خاص إضافي', 'price' => 0.30],
                            ['name' => 'بيبسي بارد 330 مل', 'price' => 0.70],
                        ],
                        'removals' => [
                            ['name' => 'بدون مخلل'],
                            ['name' => 'بدون بصل'],
                            ['name' => 'بدون طماطم'],
                        ]
                    ]
                ]
            );

            Product::updateOrCreate(
                ['slug' => 'crispy-chicken-burger'],
                [
                    'name' => 'برجر دجاج كرسبي سوبريم',
                    'sku' => 'MEAL-BURGER-02',
                    'seller_id' => $burgerFactory->id,
                    'seller_name' => $burgerFactory->store_name,
                    'category_id' => $catBurger->id,
                    'description' => 'صدر دجاج مقرمش متبل بالبهارات الخاصة مع صوص المايونيز بالثوم والجبنة الذائبة.',
                    'price' => 4.80,
                    'currency' => 'USD',
                    'stock' => 80,
                    'image_url' => 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600',
                    'is_active' => true,
                    'is_approved' => true,
                    'is_featured' => true,
                    'rating' => 4.8,
                    'sold_count' => 290,
                    'preparation_time' => 15,
                    'food_options' => [
                        'sizes' => [
                            ['name' => 'عادي', 'price' => 4.80],
                            ['name' => 'دبل تشيكن', 'price' => 6.50],
                        ],
                        'extras' => [
                            ['name' => 'صوص حار سبايسي', 'price' => 0.30],
                            ['name' => 'جبن هالبينو', 'price' => 0.60],
                            ['name' => 'أصابع بطاطس ويدجز', 'price' => 1.20],
                        ]
                    ]
                ]
            );
        }

        // وجبات مطعم الشيباني
        if ($catYemeni) {
            Product::updateOrCreate(
                ['slug' => 'yemeni-mandi-meat'],
                [
                    'name' => 'نفر لحم مندي بلدي فاخر',
                    'sku' => 'MEAL-YEMEN-01',
                    'seller_id' => $shaibani->id,
                    'seller_name' => $shaibani->store_name,
                    'category_id' => $catYemeni->id,
                    'description' => 'لحم بلدي طازج مطهو في حفرة المندي مع الأرز البسمتي الفاخر والسحاوق والشوربة.',
                    'price' => 12.00,
                    'sale_price' => 10.50,
                    'currency' => 'USD',
                    'stock' => 50,
                    'image_url' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
                    'is_active' => true,
                    'is_approved' => true,
                    'is_featured' => true,
                    'rating' => 4.95,
                    'sold_count' => 450,
                    'preparation_time' => 25,
                    'food_options' => [
                        'sizes' => [
                            ['name' => 'نفر واحد (شخص)', 'price' => 10.50],
                            ['name' => 'نفرين (شخصين)', 'price' => 20.00],
                            ['name' => 'نصف تيس مندي عائلي', 'price' => 45.00],
                        ],
                        'extras' => [
                            ['name' => 'سحاوق بالجبن مضاعف', 'price' => 0.50],
                            ['name' => 'أرز مندي إضافي', 'price' => 1.50],
                            ['name' => 'مرق لحم دسم', 'price' => 0.50],
                            ['name' => 'حلبة وسلتة حارة', 'price' => 1.50],
                        ]
                    ]
                ]
            );

            Product::updateOrCreate(
                ['slug' => 'yemeni-fahsah'],
                [
                    'name' => 'فحسة لحم يمنية بالمرق والحلبة',
                    'sku' => 'MEAL-YEMEN-02',
                    'seller_id' => $shaibani->id,
                    'seller_name' => $shaibani->store_name,
                    'category_id' => $catYemeni->id,
                    'description' => 'فحسة في المدرة الحجرية تغلي مع اللحم المهروس والمرق والحلبة تقدم مع ملوج ساخن.',
                    'price' => 6.00,
                    'currency' => 'USD',
                    'stock' => 60,
                    'image_url' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
                    'is_active' => true,
                    'is_approved' => true,
                    'is_featured' => true,
                    'rating' => 4.85,
                    'sold_count' => 310,
                    'preparation_time' => 20,
                    'food_options' => [
                        'extras' => [
                            ['name' => 'خبز ملوج بلدي إضافي', 'price' => 0.40],
                            ['name' => 'سحاوق كراث وجبن', 'price' => 0.60],
                        ]
                    ]
                ]
            );
        }

        // وجبات بيتزا نابولي
        if ($catPizza) {
            Product::updateOrCreate(
                ['slug' => 'pizza-margherita-napoli'],
                [
                    'name' => 'بيتزا مارجريتا نابولي الأصلية',
                    'sku' => 'MEAL-PIZZA-01',
                    'seller_id' => $napoli->id,
                    'seller_name' => $napoli->store_name,
                    'category_id' => $catPizza->id,
                    'description' => 'صلصة طماطم إيطالية مع جبنة الموزاريلا الطازجة وريحان وزيت زيتون بكر.',
                    'price' => 7.00,
                    'currency' => 'USD',
                    'stock' => 70,
                    'image_url' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
                    'is_active' => true,
                    'is_approved' => true,
                    'is_featured' => true,
                    'rating' => 4.85,
                    'sold_count' => 240,
                    'preparation_time' => 20,
                    'food_options' => [
                        'sizes' => [
                            ['name' => 'وسط (Medium)', 'price' => 7.00],
                            ['name' => 'كبير (Large)', 'price' => 9.50],
                            ['name' => 'عائلي (Family XL)', 'price' => 12.00],
                        ],
                        'extras' => [
                            ['name' => 'أطراف محشوة بالجبن', 'price' => 1.50],
                            ['name' => 'موزاريلا إضافية مضاعفة', 'price' => 1.00],
                            ['name' => 'فطر طازج وزيتون', 'price' => 0.70],
                        ]
                    ]
                ]
            );
        }
    }
}
