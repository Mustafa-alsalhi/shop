<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOffersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('banner')->nullable();
            $table->string('thumbnail')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed', 'free_shipping'])->default('percentage');
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'scheduled'])->default('active');
            $table->boolean('show_in_home')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['status', 'start_date', 'end_date']);
            $table->index('show_in_home');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('offers');
    }
}
