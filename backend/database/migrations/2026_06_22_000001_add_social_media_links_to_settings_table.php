<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('facebook_url')->nullable()->after('store_address');
            $table->string('instagram_url')->nullable()->after('facebook_url');
            $table->string('twitter_url')->nullable()->after('instagram_url');
            $table->string('tiktok_url')->nullable()->after('twitter_url');
            $table->string('youtube_url')->nullable()->after('tiktok_url');
            $table->string('telegram_url')->nullable()->after('youtube_url');
            $table->string('whatsapp_url')->nullable()->after('telegram_url');
        });
    }

    public function down()
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'facebook_url',
                'instagram_url',
                'twitter_url',
                'tiktok_url',
                'youtube_url',
                'telegram_url',
                'whatsapp_url'
            ]);
        });
    }
};
