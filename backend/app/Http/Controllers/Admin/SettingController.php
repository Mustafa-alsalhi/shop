<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class SettingController extends Controller
{
    public function __construct()
    {
        // Apply middleware to specific methods only
        $this->middleware(['auth:sanctum', 'admin'])->only(['index', 'update']);
    }

    public function index()
    {
        try {
            \Log::info('Admin settings index called');
            
            // Check if settings table has social media columns
            try {
                $columns = \Schema::getColumnListing('settings');
                \Log::info('Settings table columns', ['columns' => $columns]);
            } catch (\Exception $e) {
                \Log::error('Error getting columns', ['error' => $e->getMessage()]);
            }
            
            $settings = Setting::first();
            if (!$settings) {
                \Log::info('No settings found, creating new');
                $settings = new Setting();
                $settings->save();
            }
            \Log::info('Admin settings returned', ['settings' => $settings]);
            return response()->json($settings);
        } catch (\Exception $e) {
            \Log::error('Admin settings error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error fetching settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function publicIndex()
    {
        try {
            \Log::info('Public settings index called');
            $settings = Setting::first();
            if (!$settings) {
                \Log::info('No settings found, creating new');
                $settings = new Setting();
                $settings->save();
            }
            \Log::info('Public settings returned', ['settings' => $settings]);
            return response()->json($settings);
        } catch (\Exception $e) {
            \Log::error('Public settings error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error fetching settings: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            \Log::info('Settings update started', ['request_data' => $request->all()]);
            
            $settings = Setting::first();
            if (!$settings) {
                $settings = new Setting();
                $settings->save();
            }

            // Ensure settings directory exists
            $settingsPath = public_path('images/settings');
            \Log::info('Settings path', ['path' => $settingsPath, 'exists' => File::exists($settingsPath)]);
            
            if (!File::exists($settingsPath)) {
                File::makeDirectory($settingsPath, 0755, true);
                \Log::info('Created settings directory');
            }

            // Handle file uploads
            if ($request->hasFile('store_logo')) {
                $logo = $request->file('store_logo');
                $logoName = time() . '_logo.' . $logo->getClientOriginalExtension();
                \Log::info('Moving logo', ['from' => $logo->getPathname(), 'to' => $settingsPath . '/' . $logoName]);
                $logo->move($settingsPath, $logoName);
                $settings->store_logo = '/images/settings/' . $logoName;
            }

            if ($request->hasFile('store_favicon')) {
                $favicon = $request->file('store_favicon');
                $faviconName = time() . '_favicon.' . $favicon->getClientOriginalExtension();
                \Log::info('Moving favicon', ['from' => $favicon->getPathname(), 'to' => $settingsPath . '/' . $faviconName]);
                $favicon->move($settingsPath, $faviconName);
                $settings->store_favicon = '/images/settings/' . $faviconName;
            }

            // General Settings
            $settings->store_name = $request->store_name ?? $settings->store_name;
            $settings->store_description = $request->store_description ?? $settings->store_description;
            $settings->store_email = $request->store_email ?? $settings->store_email;
            $settings->store_phone = $request->store_phone ?? $settings->store_phone;
            $settings->store_address = $request->store_address ?? $settings->store_address;

            // Social Media Links
            $settings->facebook_url = $request->facebook_url ?? $settings->facebook_url;
            $settings->instagram_url = $request->instagram_url ?? $settings->instagram_url;
            $settings->twitter_url = $request->twitter_url ?? $settings->twitter_url;
            $settings->tiktok_url = $request->tiktok_url ?? $settings->tiktok_url;
            $settings->youtube_url = $request->youtube_url ?? $settings->youtube_url;
            $settings->telegram_url = $request->telegram_url ?? $settings->telegram_url;
            $settings->whatsapp_url = $request->whatsapp_url ?? $settings->whatsapp_url;

            // Site Settings
            $settings->site_name = $request->site_name ?? $settings->site_name;
            $settings->site_language = $request->site_language ?? $settings->site_language;
            $settings->timezone = $request->timezone ?? $settings->timezone;
            $settings->date_format = $request->date_format ?? $settings->date_format;
            $settings->time_format = $request->time_format ?? $settings->time_format;

            // Account Settings
            $settings->allow_registration = $request->has('allow_registration') ? $request->allow_registration : $settings->allow_registration;
            $settings->allow_guest_checkout = $request->has('allow_guest_checkout') ? $request->allow_guest_checkout : $settings->allow_guest_checkout;

            // Order Settings
            $settings->order_start_number = $request->order_start_number ?? $settings->order_start_number;
            $settings->cancelled_order_retention_days = $request->cancelled_order_retention_days ?? $settings->cancelled_order_retention_days;
            $settings->default_order_status = $request->default_order_status ?? $settings->default_order_status;

            // Notification Settings
            $settings->admin_notifications = $request->has('admin_notifications') ? $request->admin_notifications : $settings->admin_notifications;
            $settings->customer_notifications = $request->has('customer_notifications') ? $request->customer_notifications : $settings->customer_notifications;

            // SEO Settings
            $settings->seo_title = $request->seo_title ?? $settings->seo_title;
            $settings->seo_description = $request->seo_description ?? $settings->seo_description;
            $settings->seo_keywords = $request->seo_keywords ?? $settings->seo_keywords;
            $settings->analytics_code = $request->analytics_code ?? $settings->analytics_code;

            // Homepage Settings
            $settings->products_per_section = $request->products_per_section ?? $settings->products_per_section;
            if ($request->has('homepage_sections')) {
                $settings->homepage_sections = is_string($request->homepage_sections) 
                    ? json_decode($request->homepage_sections, true) 
                    : $request->homepage_sections;
            }
            if ($request->has('banner_settings')) {
                $settings->banner_settings = is_string($request->banner_settings) 
                    ? json_decode($request->banner_settings, true) 
                    : $request->banner_settings;
            }

            // Security Settings
            $settings->max_login_attempts = $request->max_login_attempts ?? $settings->max_login_attempts;
            $settings->login_lockout_minutes = $request->login_lockout_minutes ?? $settings->login_lockout_minutes;

            // Maintenance Settings
            $settings->maintenance_mode = $request->has('maintenance_mode') ? $request->maintenance_mode : $settings->maintenance_mode;
            $settings->maintenance_message = $request->maintenance_message ?? $settings->maintenance_message;
            $settings->maintenance_admin_only = $request->has('maintenance_admin_only') ? $request->maintenance_admin_only : $settings->maintenance_admin_only;

            // Driver Settings
            if ($request->has('delivery_zones')) {
                $settings->delivery_zones = is_string($request->delivery_zones)
                    ? json_decode($request->delivery_zones, true)
                    : $request->delivery_zones;
            }

            $settings->save();
            \Log::info('Settings saved successfully');

            return response()->json([
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            \Log::error('Settings update error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error updating settings: ' . $e->getMessage()
            ], 500);
        }
    }
}
