<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('sellers', function (Blueprint $table) {
            // KYC Documents
            $table->string('id_card_image')->nullable();
            $table->string('commercial_register_image')->nullable();
            $table->string('signed_contract_image')->nullable();

            // Financial Data
            $table->string('kuraimi_account_name')->nullable();
            $table->string('kuraimi_account_number')->nullable();
            $table->string('alt_network_name')->nullable();
            $table->string('alt_recipient_name')->nullable();
            $table->string('alt_recipient_phone')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn([
                'id_card_image',
                'commercial_register_image',
                'signed_contract_image',
                'kuraimi_account_name',
                'kuraimi_account_number',
                'alt_network_name',
                'alt_recipient_name',
                'alt_recipient_phone'
            ]);
        });
    }
};
