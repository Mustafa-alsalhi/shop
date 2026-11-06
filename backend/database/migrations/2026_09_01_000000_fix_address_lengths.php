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
        // Fix users table
        if (Schema::hasColumn('users', 'address')) {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE users MODIFY address VARCHAR(1000) NULL');
        }
        if (Schema::hasColumn('users', 'city')) {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE users MODIFY city VARCHAR(255) NULL');
        }
        
        // Fix sellers table
        if (Schema::hasColumn('sellers', 'address')) {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE sellers MODIFY address VARCHAR(1000) NULL');
        }
        if (Schema::hasColumn('sellers', 'city')) {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE sellers MODIFY city VARCHAR(255) NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 
    }
};
