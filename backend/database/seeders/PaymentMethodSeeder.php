<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $methods = [
            [
                'name' => 'بطاقة الائتمان',
                'code' => 'credit_card',
                'description' => 'الدفع عبر البطاقات الائتمانية',
                'fee' => 2.50,
                'is_active' => true,
                'config' => [
                    'requires_cvv' => true,
                    'requires_expiry' => true,
                    'supported_cards' => ['visa', 'mastercard', 'amex']
                ],
                'icon' => 'credit-card'
            ],
            [
                'name' => 'الدفع عند الاستلام',
                'code' => 'cash_on_delivery',
                'description' => 'الدفع نقداً عند استلام الطلب',
                'fee' => 0.00,
                'is_active' => true,
                'config' => [
                    'requires_change' => true
                ],
                'icon' => 'cash'
            ],
            [
                'name' => 'باي بال',
                'code' => 'paypal',
                'description' => 'الدفع عبر حساب باي بال',
                'fee' => 3.00,
                'is_active' => true,
                'config' => [
                    'requires_account' => true
                ],
                'icon' => 'paypal'
            ],
            [
                'name' => 'تحويل بنكي',
                'code' => 'bank_transfer',
                'description' => 'التحويل البنكي المباشر',
                'fee' => 1.00,
                'is_active' => true,
                'config' => [
                    'requires_account_details' => true
                ],
                'icon' => 'bank'
            ],
            [
                'name' => 'أبل باي',
                'code' => 'apple_pay',
                'description' => 'الدفع عبر أبل باي',
                'fee' => 2.00,
                'is_active' => true,
                'config' => [
                    'requires_device' => true
                ],
                'icon' => 'apple'
            ]
        ];

        foreach ($methods as $method) {
            \App\Models\PaymentMethod::create($method);
        }
    }
}
