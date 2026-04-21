<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAdditionalFieldsToCartsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->string('product_name')->nullable()->after('quantity');
            $table->decimal('price', 10, 2)->nullable()->after('product_name');
            $table->string('image_url')->nullable()->after('price');
            $table->string('sku')->nullable()->after('image_url');
            $table->decimal('weight', 8, 2)->nullable()->after('sku');
            $table->string('dimensions')->nullable()->after('weight');
            $table->string('category')->nullable()->after('dimensions');
            $table->string('brand')->nullable()->after('category');
            $table->text('description')->nullable()->after('brand');
            $table->text('short_description')->nullable()->after('description');
            $table->string('status')->default('active')->after('short_description');
            $table->boolean('featured')->default(false)->after('status');
            $table->json('variant_attributes')->nullable()->after('featured');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
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
            ]);
        });
    }
}
