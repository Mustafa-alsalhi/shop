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
        // Add selected_image_index to carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->integer('selected_image_index')->nullable()->after('variant_value');
        });

        // Add selected_image_index to order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->integer('selected_image_index')->nullable()->after('variant_value');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove selected_image_index from carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn('selected_image_index');
        });

        // Remove selected_image_index from order_items table
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('selected_image_index');
        });
    }
};
