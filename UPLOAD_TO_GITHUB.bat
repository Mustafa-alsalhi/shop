@echo off
echo ========================================
echo   رفع المشروع إلى GitHub
echo ========================================

echo 1. التحقق من تثبيت Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git غير مثبت! يرجى تثبيته أولاً من:
    echo https://git-scm.com/download/win
    pause
    exit /b 1
)

echo 2. تهيئة Git...
cd /d "C:\Users\ALBAHA\Desktop\my store"
git init

echo 3. إضافة ملفات الإعداد...
git add .gitignore README.md GITHUB_SETUP.md

echo 4. عمل أول commit...
git commit -m "Initial commit - Project setup"

echo 5. إضافة ريموت GitHub...
echo.
echo ملاحظة: استبدل YOUR_USERNAME باسم مستخدم GitHub الخاص بك
echo.
set /p github_username="أدخل اسم مستخدم GitHub: "
git remote add origin https://github.com/%github_username%/ecommerce-store.git

echo 6. تغيير الفرع الرئيسي إلى main...
git branch -M main

echo 7. إضافة جميع الملفات...
git add .

echo 8. عمل commit للمشروع الكامل...
git commit -m "Add complete e-commerce store with Laravel and React

Features:
- Laravel 10+ backend with RESTful API
- React.js frontend with Vite
- JWT Authentication with Laravel Sanctum
- Admin dashboard with statistics
- Product management with variants
- Nested categories system
- Shopping cart and orders
- Multi-payment methods
- User roles (Admin, Vendor, Customer)
- Security features and validation
- Responsive design with TailwindCSS
- Redux Toolkit for state management
- React Query for API calls

Tech Stack:
- Backend: Laravel 10, MySQL, JWT, Sanctum
- Frontend: React, Vite, TailwindCSS, Redux, React Query
- Authentication: Laravel Sanctum + JWT
- UI: TailwindCSS + Heroicons
- State Management: Redux Toolkit
- API: RESTful with proper validation"

echo 9. رفع الملفات إلى GitHub...
git push -u origin main

echo.
echo ========================================
echo   تم رفع المشروع بنجاح!
echo ========================================
echo.
echo رابط المستودع: https://github.com/%github_username%/ecommerce-store
echo.
echo الخطوات التالية:
echo 1. افتح الرابط أعلاه للتحقق من الملفات
echo 2. تأكد من عدم وجود ملفات حساسة مرفوعة
echo 3. شارك الرابط مع الفريق
echo.
pause
