<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        // General Settings
        'store_name',
        'store_description',
        'store_logo',
        'store_favicon',
        'store_email',
        'store_phone',
        'store_address',
        
        // Social Media Links
        'facebook_url',
        'instagram_url',
        'twitter_url',
        'tiktok_url',
        'youtube_url',
        'telegram_url',
        'whatsapp_url',
        
        // Site Settings
        'site_name',
        'site_language',
        'timezone',
        'date_format',
        'time_format',
        
        // Account Settings
        'allow_registration',
        'allow_guest_checkout',
        
        // Order Settings
        'order_start_number',
        'cancelled_order_retention_days',
        'default_order_status',
        
        // Notification Settings
        'admin_notifications',
        'customer_notifications',
        
        // SEO Settings
        'seo_title',
        'seo_description',
        'seo_keywords',
        'analytics_code',
        
        // Homepage Settings
        'products_per_section',
        'homepage_sections',
        'banner_settings',
        
        // Security Settings
        'max_login_attempts',
        'login_lockout_minutes',
        
        // Maintenance Settings
        'maintenance_mode',
        'maintenance_message',
        'maintenance_admin_only',

        // Driver Settings
        'delivery_zones',
    ];

    protected $casts = [
        'allow_registration' => 'boolean',
        'allow_guest_checkout' => 'boolean',
        'admin_notifications' => 'boolean',
        'customer_notifications' => 'boolean',
        'maintenance_mode' => 'boolean',
        'maintenance_admin_only' => 'boolean',
        'homepage_sections' => 'array',
        'banner_settings' => 'array',
        'delivery_zones' => 'array',
    ];

    /**
     * Get a setting value by key
     */
    public static function get($key, $default = null)
    {
        $setting = self::first();
        if (!$setting) {
            return $default;
        }
        return $setting->$key ?? $default;
    }

    /**
     * Set a setting value
     */
    public static function set($key, $value)
    {
        $setting = self::first();
        if (!$setting) {
            $setting = self::create([$key => $value]);
        } else {
            $setting->$key = $value;
            $setting->save();
        }
        return $setting;
    }

    /**
     * Get all settings as key-value array
     */
    public static function allSettings()
    {
        $setting = self::first();
        if (!$setting) {
            return [];
        }
        return $setting->toArray();
    }
}
