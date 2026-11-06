<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class RestaurantCategorySeeder extends Seeder
{
    public function run()
    {
        $restaurantCats = [
            [
                'name' => 'برجر',
                'slug' => 'burger',
                'type' => 'restaurant',
                'description' => 'أشهى برجر باللحم والدجاج المقرمش',
                'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 1
            ],
            [
                'name' => 'بيتزا',
                'slug' => 'pizza',
                'type' => 'restaurant',
                'description' => 'بيتزا إيطالية طازجة بمختلف النكهات',
                'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'مشويات وكباب',
                'slug' => 'grills',
                'type' => 'restaurant',
                'description' => 'أطيب المشويات والكباب والريش على الفحم',
                'image' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 3
            ],
            [
                'name' => 'مندي ومأكولات يمنية',
                'slug' => 'yemeni-food',
                'type' => 'restaurant',
                'description' => 'مندي ومظبي وفحسة وسلتة يمنية أصيلة',
                'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 4
            ],
            [
                'name' => 'شاورما وفطائر',
                'slug' => 'shawarma',
                'type' => 'restaurant',
                'description' => 'شاورما لحم ودجاج وفطائر طازجة',
                'image' => 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 5
            ],
            [
                'name' => 'وجبات سريعة',
                'slug' => 'fast-food',
                'type' => 'restaurant',
                'description' => 'ساندوتشات ووجبات خفيفة وسريعة',
                'image' => 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 6
            ],
            [
                'name' => 'حلويات ومعجنات',
                'slug' => 'desserts',
                'type' => 'restaurant',
                'description' => 'أشهى الحلويات الشرقية والغربية والمعجنات',
                'image' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 7
            ],
            [
                'name' => 'مشروبات وعصائر',
                'slug' => 'drinks',
                'type' => 'restaurant',
                'description' => 'عصائر طبيعية ومشروبات باردة وساخنة',
                'image' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
                'is_active' => true,
                'show_on_homepage' => true,
                'sort_order' => 8
            ],
        ];

        foreach ($restaurantCats as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
