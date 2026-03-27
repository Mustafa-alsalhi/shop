@echo off
echo ========================================
echo   إعداد CORS محسّن لـ Laravel على InfinityFree
echo ========================================

echo 1. تحديث ملف config/cors.php...
copy config\cors_improved.php config\cors.php

echo 2. تحديث ملف .htaccess...
copy public\.htaccess_improved public\.htaccess

echo 3. إضافة CORS Middleware...
copy app\Http\Middleware\CorsMiddleware.php app\Http\Middleware\

echo 4. تحديث bootstrap/app.php...
copy bootstrap\app_improved.php bootstrap\app.php

echo 5. تحديث routes/api.php...
copy routes\api_improved.php routes\api.php

echo 6. مسح الكاش...
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo 7. كشف الإعدادات للإنتاج...
php artisan config:cache
php artisan route:cache

echo 8. ربط التخزين...
php artisan storage:link

echo 9. إنشاء مجلدات الكاش المطلوبة...
if not exist "storage\framework\cache" mkdir storage\framework\cache
if not exist "storage\framework\sessions" mkdir storage\framework\sessions
if not exist "storage\framework\views" mkdir storage\framework\views
if not exist "storage\app\public" mkdir storage\app\public

echo 10. توليد مفتاح التطبيق...
php artisan key:generate

echo ========================================
echo   تم إعداد CORS بنجاح!
echo ========================================
echo.
echo الروابط للاختبار:
echo - API Test: https://asala2026.infinityfreeapp.com/api/test-cors
echo - Products: https://asala2026.infinityfreeapp.com/api/products
echo - Categories: https://asala2026.infinityfreeapp.com/api/categories
echo - Health: https://asala2026.infinityfreeapp.com/api/health
echo.
echo الخطوات التالية:
echo 1. ارفع الملفات إلى InfinityFree عبر FTP
echo 2. تأكد من وجود قاعدة بيانات
echo 3. حدث بيانات الاتصال في .env
echo 4. شغل php artisan migrate على الخادم
echo.
pause
