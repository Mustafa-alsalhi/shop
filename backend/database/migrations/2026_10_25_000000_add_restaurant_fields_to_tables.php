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
                $table->string('type')->default('store');
            }
            if (!Schema::hasColumn('sellers', 'cover_image')) {
                $table->string('cover_image')->nullable();
            }
            if (!Schema::hasColumn('sellers', 'is_open')) {
                $table->boolean('is_open')->default(true);
            }
            if (!Schema::hasColumn('sellers', 'accepting_orders')) {
                $table->boolean('accepting_orders')->default(true);
            }
            if (!Schema::hasColumn('sellers', 'preparation_time')) {
                $table->string('preparation_time')->nullable()->default('20-30 دقيقة');
            }
            if (!Schema::hasColumn('sellers', 'min_order_amount')) {
                $table->decimal('min_order_amount', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('sellers', 'working_hours')) {
                $table->json('working_hours')->nullable();
            }
            if (!Schema::hasColumn('sellers', 'cuisine_type')) {
                $table->string('cuisine_type')->nullable();
            }
        });

        // 2. تعديل جدول التصنيفات categories
        Schema::table('categories', function (Blueprint $table) {
            if (!Schema::hasColumn('categories', 'type')) {
                $table->string('type')->default('store');
            }
        });

        // 3. تعديل جدول المنتجات products
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'food_options')) {
                $table->json('food_options')->nullable();
            }
            if (!Schema::hasColumn('products', 'preparation_time')) {
                $table->integer('preparation_time')->nullable();
            }
        });

        // 4. تعديل جدول السلة carts
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'selected_options')) {
                $table->json('selected_options')->nullable();
            }
            if (!Schema::hasColumn('carts', 'special_instructions')) {
                $table->text('special_instructions')->nullable();
            }
            if (!Schema::hasColumn('carts', 'seller_type')) {
                $table->string('seller_type')->default('store');
            }
        });

        // 5. تعديل جدول عناصر الطلب order_items
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'selected_options')) {
                $table->json('selected_options')->nullable();
            }
            if (!Schema::hasColumn('order_items', 'special_instructions')) {
                $table->text('special_instructions')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
