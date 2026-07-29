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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_approved')) {
                $table->boolean('is_approved')->default(true)->after('seller_id');
            }
            if (!Schema::hasColumn('products', 'seller_category_id')) {
                $table->foreignId('seller_category_id')->nullable()->after('is_approved')->constrained('seller_categories')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['seller_category_id']);
            $table->dropColumn(['is_approved', 'seller_category_id']);
        });
    }
};
