<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        Setting::firstOrCreate([
            'id' => 1
        ], [
            // General Settings
            'store_name' => 'My Store',
            'store_description' => '',
            'store_logo' => null,
            'store_favicon' => null,
            'store_email' => '',
            'store_phone' => '',
            'store_address' => '',
            
            // Social Media Links
            'facebook_url' => '',
            'instagram_url' => '',
            'twitter_url' => '',
            'tiktok_url' => '',
            'youtube_url' => '',
            'telegram_url' => '',
            'whatsapp_url' => '',
            
            // Site Settings
            'site_name' => 'My Store',
            'site_language' => 'ar',
            'timezone' => 'Asia/Riyadh',
            'date_format' => 'Y-m-d',
            'time_format' => 'H:i',
            
            // Account Settings
            'allow_registration' => true,
            'allow_guest_checkout' => true,
            
            // Order Settings
            'order_start_number' => 1000,
            'cancelled_order_retention_days' => 30,
            'default_order_status' => 'pending',
            
            // Notification Settings
            'admin_notifications' => true,
            'customer_notifications' => true,
            
            // SEO Settings
            'seo_title' => '',
            'seo_description' => '',
            'seo_keywords' => '',
            'analytics_code' => '',
            
            // Homepage Settings
            'products_per_section' => 8,
            'homepage_sections' => null,
            'banner_settings' => null,
            
            // Security Settings
            'max_login_attempts' => 5,
            'login_lockout_minutes' => 15,
            
            // Maintenance Settings
            'maintenance_mode' => false,
            'maintenance_message' => '',
            'maintenance_admin_only' => true,
        ]);
    }
}
