# إعدادات CORS محسّنة لـ Laravel على InfinityFree

## المشكلة الحالية:
إعدادات CORS الحالية تسمح بجميع المصادر (`'*'`) لكنها قد لا تكون كافية لبعض المتصفحات أو للإنتاج.

## الحلول المقترحة:

### 1. تحديث ملف config/cors.php
```bash
# استبدل الملف الحالي بالنسخة المحسّنة
copy config/cors_improved.php config/cors.php
```

### 2. تحديث .htaccess
```bash
# استبدل الملف الحالي بالنسخة المحسّنة
copy public/.htaccess_improved public/.htaccess
```

### 3. إضافة CORS Middleware
```bash
# انسخ middleware جديد
copy app/Http/Middleware/CorsMiddleware.php app/Http/Middleware/
```

### 4. تحديث bootstrap/app.php
```bash
# استبدل الملف الحالي بالنسخة المحسّنة
copy bootstrap/app_improved.php bootstrap/app.php
```

### 5. تحديث routes/api.php
```bash
# استبدل الملف الحالي بالنسخة المحسّنة
copy routes/api_improved.php routes/api.php
```

## أوامر التنفيذ:

```bash
cd backend

# 1. تحديث إعدادات CORS
cp config/cors_improved.php config/cors.php

# 2. تحديث .htaccess
cp public/.htaccess_improved public/.htaccess

# 3. إضافة CORS Middleware
cp app/Http/Middleware/CorsMiddleware.php app/Http/Middleware/

# 4. تحديث bootstrap/app.php
cp bootstrap/app_improved.php bootstrap/app.php

# 5. تحديث routes/api.php
cp routes/api_improved.php routes/api.php

# 6. مسح الكاش
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# 7. كشف الإعدادات للإنتاج
php artisan config:cache
php artisan route:cache
```

## الميزات الجديدة:

### 1. CORS Headers محسّنة:
- مصادر محددة للـ development و production
- headers محددة بدلاً من `'*'`
- max-age أطول (24 ساعة)

### 2. Security Headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### 3. Performance Headers:
- Cache control للملفات الثابتة
- Compression للملفات النصية
- PHP Configuration محسّنة

### 4. Error Handling:
- معالجة أفضل لـ OPTIONS requests
- Error pages مخصصة
- Logging محسّن

## اختبار CORS:

### 1. اختبار من المتصفح:
```javascript
fetch('https://asala2026.infinityfreeapp.com/api/test-cors')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### 2. اختبار من curl:
```bash
curl -X OPTIONS https://asala2026.infinityfreeapp.com/api/products \
  -H "Origin: https://asala2026.infinityfreeapp.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```

### 3. اختبار من Postman:
- Method: OPTIONS
- URL: https://asala2026.infinityfreeapp.com/api/products
- Headers:
  - Origin: https://asala2026.infinityfreeapp.com
  - Access-Control-Request-Method: GET
  - Access-Control-Request-Headers: Content-Type, Authorization

## استكشاف الأخطاء:

### 1. إذا لم تعمل CORS:
- تحقق من وجود .htaccess الصحيح
- تأكد من أن mod_headers مفعّل في Apache
- تحقق من سجلات الأخطاء في InfinityFree

### 2. إذا كانت هناك أخطاء 500:
- تحقق من صلاحيات الملفات (755 للمجلدات، 644 للملفات)
- تأكد من وجود جميع الملفات المطلوبة
- تحقق من سجلات PHP errors

### 3. إذا كانت هناك مشاكل في الصور:
- تأكد من رابط storage link
- تحقق من صلاحيات مجلد storage
- تأكد من وجود الصور في المكان الصحيح

## ملاحظات هامة:

1. **InfinityFree محدود**: قد لا يدعم بعض ميزات Apache المتقدمة
2. **SSL Certificate**: تأكد من وجود شهادة SSL صالحة
3. **Performance**: قد تكون الاستجابة بطيئة في البداية
4. **Limits**: هناك حدود لعدد الطلبات والمساحة

## للرفع على InfinityFree:

1. استخدم FTP Client (مثل FileZilla)
2. ارفع جميع الملفات إلى مجلد `htdocs/`
3. تأكد من صلاحيات المجلدات
4. اختبر الروابط يدوياً

## الروابط للاختبار:

- API Test: https://asala2026.infinityfreeapp.com/api/test-cors
- Products: https://asala2026.infinityfreeapp.com/api/products
- Categories: https://asala2026.infinityfreeapp.com/api/categories
- Health Check: https://asala2026.infinityfreeapp.com/api/health
