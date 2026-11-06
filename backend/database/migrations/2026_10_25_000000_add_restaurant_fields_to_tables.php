<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. تعديل جدول البائعين sellers
        Schema::table('sellers', function (Blueprint $table) {
            if (!Schema::hasColumn('sellers', 'type')) {
                $table->string('type')->default('store')->after('store_name'); // 'store' أو 'restaurant'
            }
            if (!Schema::hasColumn('sellers', 'cover_image')) {
                $table->string('cover_image')->nullable()->after('avatar_image');
            }
            if (!Schema::hasColumn('sellers', 'is_open')) {
                $table->boolean('is_open')->default(true)->after('status');
            }
            if (!Schema::hasColumn('sellers', 'accepting_orders')) {
                $table->boolean('accepting_orders')->default(true)->after('is_open');
            }
            if (!Schema::hasColumn('sellers', 'preparation_time')) {
                $table->string('preparation_time')->nullable()->default('20-30 دقيقة')->after('accepting_orders');
            }
            if (!Schema::hasColumn('sellers', 'min_order_amount')) {
                $table->decimal('min_order_amount', 10, 2)->default(0)->after('preparation_time');
            }
            if (!Schema::hasColumn('sellers', 'working_hours')) {
                $table->json('working_hours')->nullable()->after('min_order_amount');
            }
            if (!Schema::hasColumn('sellers', 'cuisine_type')) {
                $table->string('cuisine_type')->nullable()->after('working_hours');
            }
        });

        // 2. تعديل جدول التصنيفات categories
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'type')) {
                $table->string('type')->default('store')->after('name'); // 'store' أو 'restaurant'
            }
        });

        // 3. تعديل جدول المنتجات products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'food_options')) {
                $table->json('food_options')->nullable()->after('variants'); // خيارات الوجبة، الإضافات المدفوعة/المجانية، الأحجام
            }
            if (!Schema::hasColumn('products', 'preparation_time')) {
                $table->integer('preparation_time')->nullable()->after('food_options'); // وقت التحضير بالدقائق
            }
        });

        // 4. تعديل جدول السلة carts
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'selected_options')) {
                $table->json('selected_options')->nullable()->after('variant_attributes');
            }
            if (!Schema::hasColumn('carts', 'special_instructions')) {
                $table->text('special_instructions')->nullable()->after('selected_options');
            }
            if (!Schema::hasColumn('carts', 'seller_type')) {
                $table->string('seller_type')->default('store')->after('special_instructions');
            }
        });

        // 5. تعديل جدول عناصر الطلب order_items
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'selected_options')) {
                $table->json('selected_options')->nullable()->after('variant_value');
            }
            if (!Schema::hasColumn('order_items', 'special_instructions')) {
                $table->text('special_instructions')->nullable()->after('selected_options');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn([
                'type', 'cover_image', 'is_open', 'accepting_orders', 
                'preparation_time', 'min_order_amount', 'working_hours', 'cuisine_type'
            ]);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['type']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['food_options', 'preparation_time']);
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['selected_options', 'special_instructions', 'seller_type']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['selected_options', 'special_instructions']);
        });
    }
};
