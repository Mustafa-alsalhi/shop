<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('activities')) {
            Schema::create('activities', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // اسم النشاط (مثال: المطاعم والوجبات، الكافيهات، المخابز...)
                $table->string('slug')->unique(); // الرمز الفريد (مثال: restaurant, cafe, bakery, supermarket...)
                $table->string('icon')->default('✨'); // الإيموجي أو الأيقونة
                $table->text('description')->nullable(); // وصف مختصر
                $table->string('banner_title')->nullable(); // عنوان البانر الترويجي
                $table->text('banner_subtitle')->nullable(); // وصف البانر
                $table->string('banner_bg')->nullable()->default('from-amber-600 via-orange-600 to-amber-700'); // تدرج لون البانر
                $table->string('banner_image')->nullable(); // صورة غلاف البانر إن وجدت
                $table->string('place_label')->default('مكان'); // مسمى المكان (مطعم / كافيه / مخبز / محل)
                $table->string('item_label')->default('صنف'); // مسمى العنصر (وجبة / مشروب / منتج / صنف)
                $table->boolean('is_active')->default(true); // مفعل / معطل
                $table->integer('sort_order')->default(0); // ترتيب الظهور
                $table->timestamps();
            });

            // إدراج نشاط المطاعم ونشاط تجريبي كبداية افتراضية لضمان استمرار عمل المطاعم بسلاسة
            DB::table('activities')->insert([
                [
                    'name' => 'المطاعم والوجبات',
                    'slug' => 'restaurant',
                    'icon' => '🍔',
                    'description' => 'أشهى المأكولات والوجبات السريعة والمشاوي والمندي وتوصيل ساخن لباب بيتك',
                    'banner_title' => 'اطلب أشهى الوجبات من أفضل المطاعم القريبة منك',
                    'banner_subtitle' => 'استمتع بألذ المأكولات اليمنية، البرجر، البيتزا والمشويات مع تتبع مباشر وتوصيل سريع ومضمون.',
                    'banner_bg' => 'from-amber-600 via-orange-600 to-amber-700',
                    'banner_image' => null,
                    'place_label' => 'مطعم',
                    'item_label' => 'وجبة',
                    'is_active' => true,
                    'sort_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'الكافيهات والحلويات',
                    'slug' => 'cafe',
                    'icon' => '☕',
                    'description' => 'قهوة مختصة، مشروبات ساخنة وباردة، وحلويات طازجة ولذيذة',
                    'banner_title' => 'استمتع بألذ أنواع القهوة المختصة والحلويات الفاخرة',
                    'banner_subtitle' => 'اختر كافيهك المفضل واطلب قهوتك المفضلة وحلاك المفضل لتصلك طازجة أينما كنت.',
                    'banner_bg' => 'from-rose-600 via-amber-700 to-amber-900',
                    'banner_image' => null,
                    'place_label' => 'كافيه',
                    'item_label' => 'مشروب وحلى',
                    'is_active' => true,
                    'sort_order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'المخابز والمعجنات',
                    'slug' => 'bakery',
                    'icon' => '🥖',
                    'description' => 'خبز طازج، معجنات، فطائر وكيك للمناسبات بأعلى جودة',
                    'banner_title' => 'أشهى المعجنات والمخبوزات الطازجة يومياً من الفرن إليك',
                    'banner_subtitle' => 'تذوق ألذ أنواع الفطائر والكيك والمخبوزات المجهزة بأيدي أمهر الخبازين.',
                    'banner_bg' => 'from-amber-500 via-yellow-600 to-orange-600',
                    'banner_image' => null,
                    'place_label' => 'مخبز',
                    'item_label' => 'مخبوزات',
                    'is_active' => true,
                    'sort_order' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
