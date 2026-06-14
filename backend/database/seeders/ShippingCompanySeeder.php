<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ShippingCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $companies = [
            [
                'name' => 'أرامكس (Aramex)',
                'code' => 'aramex',
                'description' => 'توصيل سريع وموثوق',
                'cost' => 15.00,
                'is_active' => true,
                'delivery_days' => 2,
                'tracking_url' => 'https://www.aramex.com/track'
            ],
            [
                'name' => 'إس إم إس إيه (SMSA)',
                'code' => 'smsa',
                'description' => 'خدمة توصيل ممتازة',
                'cost' => 12.00,
                'is_active' => true,
                'delivery_days' => 3,
                'tracking_url' => 'https://www.smsaexpress.com/track'
            ],
            [
                'name' => 'دي إتش إل (DHL)',
                'code' => 'dhl',
                'description' => 'توصيل دولي',
                'cost' => 25.00,
                'is_active' => true,
                'delivery_days' => 5,
                'tracking_url' => 'https://www.dhl.com/en/express/tracking.html'
            ],
            [
                'name' => 'فيديكس (FedEx)',
                'code' => 'fedex',
                'description' => 'توصيل عالمي',
                'cost' => 28.00,
                'is_active' => true,
                'delivery_days' => 4,
                'tracking_url' => 'https://www.fedex.com/fedextrack'
            ],
            [
                'name' => 'البريد السعودي',
                'code' => 'saudi_post',
                'description' => 'توصيل محلي',
                'cost' => 8.00,
                'is_active' => true,
                'delivery_days' => 7,
                'tracking_url' => 'https://trackings.post.com.sa'
            ],
            [
                'name' => 'نقل (Naqel)',
                'code' => 'naqel',
                'description' => 'خدمة توصيل سريعة',
                'cost' => 10.00,
                'is_active' => true,
                'delivery_days' => 3,
                'tracking_url' => 'https://www.naqelksa.com/track'
            ],
            [
                'name' => 'جي آند تي (J&T)',
                'code' => 'jnt',
                'description' => 'توصيل آمن',
                'cost' => 9.00,
                'is_active' => true,
                'delivery_days' => 4,
                'tracking_url' => 'https://www.jet.co.id/track'
            ]
        ];

        foreach ($companies as $company) {
            \App\Models\ShippingCompany::create($company);
        }
    }
}
