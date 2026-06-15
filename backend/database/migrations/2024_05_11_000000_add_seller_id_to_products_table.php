<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add seller_id to the products table so that the subsequent migration
     * (2024_05_12_000001_add_seller_name_to_products_table) can place columns
     * AFTER seller_id without hitting "Unknown column 'seller_id'" in MySQL.
     *
     * A foreign key constraint is intentionally omitted here because the
     * sellers table does not exist yet at this point in the migration chain.
     * The proper FK constraint is added later in
     * 2026_05_10_001139_add_seller_id_to_products_table.php.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'seller_id')) {
                $table->unsignedBigInteger('seller_id')->nullable()->after('category_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'seller_id')) {
                $table->dropColumn('seller_id');
            }
        });
    }
};
