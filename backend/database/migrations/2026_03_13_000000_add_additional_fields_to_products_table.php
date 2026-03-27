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
            // Sale Price (Discount Price)
            $table->decimal('sale_price', 10, 2)->nullable()->after('price');
            
            // Currency
            $table->string('currency', 3)->default('USD')->after('sale_price');
            
            // Product Condition
            $table->enum('condition', ['new', 'used', 'refurbished'])->default('new')->after('currency');
            
            // Sale Dates
            $table->datetime('sale_start_date')->nullable()->after('condition');
            $table->datetime('sale_end_date')->nullable()->after('sale_start_date');
            
            // Gallery Images (JSON array of additional images)
            $table->json('gallery_images')->nullable()->after('images');
            
            // Product Variants (JSON array of variants with colors, sizes, etc.)
            $table->json('variants')->nullable()->after('gallery_images');
            
            // Add indexes for better performance
            $table->index('currency');
            $table->index('condition');
            $table->index('sale_start_date');
            $table->index('sale_end_date');
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['currency']);
            $table->dropIndex(['condition']);
            $table->dropIndex(['sale_start_date']);
            $table->dropIndex(['sale_end_date']);
            $table->dropIndex(['is_featured']);
            
            $table->dropColumn([
                'sale_price',
                'currency',
                'condition',
                'sale_start_date',
                'sale_end_date',
                'gallery_images',
                'variants'
            ]);
        });
    }
};
