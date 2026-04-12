<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCouponsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique(); // كود الكوبون
            $table->string('name')->nullable(); // اسم الكوبون
            $table->text('description')->nullable(); // وصف الكوبون
            $table->enum('type', ['fixed', 'percentage']); // نوع الخصم
            $table->decimal('value', 10, 2); // قيمة الخصم
            $table->decimal('minimum_amount', 10, 2)->nullable(); // الحد الأدنى للطلب
            $table->decimal('maximum_discount', 10, 2)->nullable(); // أقصى خصم
            $table->integer('usage_limit')->nullable(); // حد الاستخدام
            $table->integer('used_count')->default(0); // عدد مرات الاستخدام
            $table->dateTime('starts_at')->nullable(); // وقت البدء
            $table->dateTime('expires_at')->nullable(); // وقت الانتهاء
            $table->boolean('is_active')->default(true); // حالة التفعيل
            $table->boolean('is_first_time_only')->default(false); // للعملاء الجدد فقط
            $table->json('applicable_products')->nullable(); // المنتجات المطبقة
            $table->json('applicable_categories')->nullable(); // الفئات المطبقة
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
        Schema::dropIfExists('coupons');
    }
}
