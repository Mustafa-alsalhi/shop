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
            // Add seller_name field if it doesn't exist
            if (!Schema::hasColumn('products', 'seller_name')) {
                $table->string('seller_name')->nullable()->after('seller_id');
            }
            
            // Add seller_avatar field if it doesn't exist
            if (!Schema::hasColumn('products', 'seller_avatar')) {
                $table->string('seller_avatar')->nullable()->after('seller_name');
            }
            
            // Add seller_rating field if it doesn't exist
            if (!Schema::hasColumn('products', 'seller_rating')) {
                $table->decimal('seller_rating', 3, 2)->default(4.8)->after('seller_avatar');
            }
            
            // Add seller_reviews_count field if it doesn't exist
            if (!Schema::hasColumn('products', 'seller_reviews_count')) {
                $table->integer('seller_reviews_count')->default(0)->after('seller_rating');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'seller_name',
                'seller_avatar', 
                'seller_rating',
                'seller_reviews_count'
            ]);
        });
    }
};
