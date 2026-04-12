<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // كوبونات للتجربة
        $coupons = [
            [
                'code' => 'SAVE20',
                'name' => 'خصم 20 ريال',
                'description' => 'خصم ثابت بقيمة 20 ريال على جميع المنتجات',
                'type' => 'fixed',
                'value' => 20.00,
                'minimum_amount' => 100.00,
                'maximum_discount' => null,
                'usage_limit' => 100,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
            [
                'code' => 'WELCOME10',
                'name' => 'خصم الترحيب',
                'description' => 'خصم 10% للعملاء الجدد',
                'type' => 'percentage',
                'value' => 10.00,
                'minimum_amount' => 50.00,
                'maximum_discount' => 50.00,
                'usage_limit' => 500,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
                'is_first_time_only' => true,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
            [
                'code' => 'SUMMER25',
                'name' => 'خصم الصيف',
                'description' => 'خصم 25% على منتجات الصيف',
                'type' => 'percentage',
                'value' => 25.00,
                'minimum_amount' => 200.00,
                'maximum_discount' => 100.00,
                'usage_limit' => 200,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(2),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => [1, 2, 3], // فئات الملابس
            ],
            [
                'code' => 'FLASH50',
                'name' => 'خصم سريع',
                'description' => 'خصم 50 ريال على الطلبات فوق 300 ريال',
                'type' => 'fixed',
                'value' => 50.00,
                'minimum_amount' => 300.00,
                'maximum_discount' => null,
                'usage_limit' => 50,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addDays(7),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
            [
                'code' => 'LOYALTY15',
                'name' => 'خصم ولاء',
                'description' => 'خصم 15% للعملاء الدائمين',
                'type' => 'percentage',
                'value' => 15.00,
                'minimum_amount' => 150.00,
                'maximum_discount' => 75.00,
                'usage_limit' => 1000,
                'used_count' => 0,
                'starts_at' => now(),
                'expires_at' => now()->addYear(),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
            [
                'code' => 'EXPIRED',
                'name' => 'كوبون منتهي',
                'description' => 'هذا الكوبون منتهي الصلاحية',
                'type' => 'fixed',
                'value' => 10.00,
                'minimum_amount' => 50.00,
                'maximum_discount' => null,
                'usage_limit' => 100,
                'used_count' => 0,
                'starts_at' => now()->subMonth(),
                'expires_at' => now()->subDay(),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
            [
                'code' => 'FUTURE',
                'name' => 'كوبون مستقبلي',
                'description' => 'هذا الكوبون سيعمل في المستقبل',
                'type' => 'fixed',
                'value' => 30.00,
                'minimum_amount' => 100.00,
                'maximum_discount' => null,
                'usage_limit' => 200,
                'used_count' => 0,
                'starts_at' => now()->addWeek(),
                'expires_at' => now()->addMonth(),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
            [
                'code' => 'LIMITED',
                'name' => 'كوبون محدود',
                'description' => 'كوبون بحد استخدام محدود جداً',
                'type' => 'percentage',
                'value' => 20.00,
                'minimum_amount' => 80.00,
                'maximum_discount' => 40.00,
                'usage_limit' => 5,
                'used_count' => 5,
                'starts_at' => now()->subWeek(),
                'expires_at' => now()->addWeek(),
                'is_active' => true,
                'is_first_time_only' => false,
                'applicable_products' => null,
                'applicable_categories' => null,
            ],
        ];

        foreach ($coupons as $couponData) {
            Coupon::create($couponData);
        }

        $this->command->info('Coupons seeded successfully!');
    }
}
