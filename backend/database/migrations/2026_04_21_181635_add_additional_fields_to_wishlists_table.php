<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAdditionalFieldsToWishlistsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wishlists', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('product_id');
            $table->decimal('price', 10, 2)->nullable()->after('product_name');
            $table->string('image_url')->nullable()->after('price');
            $table->string('sku')->nullable()->after('image_url');
            $table->string('weight')->nullable()->after('sku');
            $table->string('dimensions')->nullable()->after('weight');
            $table->string('category')->nullable()->after('dimensions');
            $table->string('brand')->nullable()->after('category');
            $table->text('description')->nullable()->after('brand');
            $table->text('short_description')->nullable()->after('description');
            $table->string('status')->nullable()->after('short_description');
            $table->boolean('featured')->default(false)->after('status');
            $table->json('variant_attributes')->nullable()->after('featured');
            $table->string('currency', 3)->default('USD')->nullable()->after('variant_attributes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('wishlists', function (Blueprint $table) {
            $table->dropColumn([
                'product_name',
                'price',
                'image_url',
                'sku',
                'weight',
                'dimensions',
                'category',
                'brand',
                'description',
                'short_description',
                'status',
                'featured',
                'variant_attributes',
                'currency',
            ]);
        });
    }
}
