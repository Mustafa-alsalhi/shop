<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSellersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->nullable();
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->decimal('rating', 3, 2)->default(4.80);
            $table->integer('reviews_count')->default(125);
            $table->string('status')->default('active');
            $table->boolean('is_verified')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sellers');
    }
}
