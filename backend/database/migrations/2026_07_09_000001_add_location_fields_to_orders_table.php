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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('billing_address');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('formatted_address')->nullable()->after('longitude');
            $table->string('building_details')->nullable()->after('formatted_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'formatted_address', 'building_details']);
        });
    }
};
