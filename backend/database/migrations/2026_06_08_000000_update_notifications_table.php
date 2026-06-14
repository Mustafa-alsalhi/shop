<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade')->after('id');
            $table->string('type')->default('info')->after('user_id');
            $table->string('title')->nullable()->after('type');
            $table->text('message')->nullable()->after('title');
            $table->text('data')->nullable()->after('message');
            $table->boolean('read')->default(false)->after('data');
            $table->timestamp('read_at')->nullable()->after('read');
            $table->string('link')->nullable()->after('read_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'type', 'title', 'message', 'data', 'read', 'read_at', 'link']);
        });
    }
}
