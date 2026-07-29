<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            
            // General Settings
            $table->string('store_name')->default('My Store');
            $table->text('store_description')->nullable();
            $table->string('store_logo')->nullable();
            $table->string('store_favicon')->nullable();
            $table->string('store_email')->nullable();
            $table->string('store_phone')->nullable();
            $table->text('store_address')->nullable();
            
            // Site Settings
            $table->string('site_name')->default('My Store');
            $table->string('site_language')->default('ar');
            $table->string('timezone')->default('Asia/Riyadh');
            $table->string('date_format')->default('Y-m-d');
            $table->string('time_format')->default('H:i');
            
            // Account Settings
            $table->boolean('allow_registration')->default(true);
            $table->boolean('allow_guest_checkout')->default(true);
            
            // Order Settings
            $table->integer('order_start_number')->default(1000);
            $table->integer('cancelled_order_retention_days')->default(30);
            $table->string('default_order_status')->default('pending');
            
            // Notification Settings
            $table->boolean('admin_notifications')->default(true);
            $table->boolean('customer_notifications')->default(true);
            
            // SEO Settings
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('seo_keywords')->nullable();
            $table->text('analytics_code')->nullable();
            
            // Homepage Settings
            $table->integer('products_per_section')->default(8);
            $table->json('homepage_sections')->nullable();
            $table->json('banner_settings')->nullable();
            
            // Security Settings
            $table->integer('max_login_attempts')->default(5);
            $table->integer('login_lockout_minutes')->default(15);
            
            // Maintenance Settings
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->boolean('maintenance_admin_only')->default(true);
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('settings');
    }
};
