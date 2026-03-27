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
        Schema::create('admin_audits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_id');
            $table->string('action', 20);
            $table->string('path', 255);
            $table->string('ip_address', 45);
            $table->text('user_agent');
            $table->json('details')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            // Indexes for performance
            $table->index('admin_id');
            $table->index('action');
            $table->index('ip_address');
            $table->index('created_at');
            
            // Foreign key constraint
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_audits');
    }
};
