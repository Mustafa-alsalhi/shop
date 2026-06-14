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
        // Add variant fields to carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->string('color')->nullable()->after('currency');
            $table->string('color_code')->nullable()->after('color');
            $table->string('size')->nullable()->after('color_code');
            $table->string('variant_name')->nullable()->after('size');
            $table->string('variant_value')->nullable()->after('variant_name');
        });

        // Add variant fields to order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('color')->nullable()->after('image_url');
            $table->string('color_code')->nullable()->after('color');
            $table->string('size')->nullable()->after('color_code');
            $table->string('variant_name')->nullable()->after('size');
            $table->string('variant_value')->nullable()->after('variant_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove variant fields from carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['color', 'color_code', 'size', 'variant_name', 'variant_value']);
        });

        // Remove variant fields from order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['color', 'color_code', 'size', 'variant_name', 'variant_value']);
        });
    }
};
