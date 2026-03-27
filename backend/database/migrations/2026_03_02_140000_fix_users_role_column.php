<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class FixUsersRoleColumn extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Use raw SQL to alter the column
        DB::statement('ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT "user"');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT "user"');
    }
}
