# 🚀 إعداد المشروع على GitHub

## الخطوات المطلوبة لرفع المشروع على GitHub

### 1. تثبيت Git (إذا لم يكن مثبتاً)

#### على Windows:
1. **اذهب إلى:** https://git-scm.com/download/win
2. **حمل Git for Windows**
3. **ثبّت البرنامج** (استخدم الإعدادات الافتراضية)
4. **أعد تشغيل Command Prompt أو PowerShell**

### 2. إنشاء حساب GitHub (إذا لم يكن لديك)

1. **اذهب إلى:** https://github.com
2. **اضغط "Sign up"**
3. **املأ البيانات المطلوبة**
4. **تحقق من الإيميل**

### 3. إنشاء مستودع جديد على GitHub

1. **سجل دخول إلى GitHub**
2. **اضغط "+" في الزاوية العلوية اليسرى**
3. **اختر "New repository"**
4. **املأ البيانات:**
   - Repository name: `ecommerce-store`
   - Description: `متجر إلكتروني احترافي - Laravel + React`
   - Public/Private: اختر حسب احتياجك
   - **لا تضيف README أو .gitignore** (لدينا بالفعل)
5. **اضغط "Create repository"**

### 4. إعداد Git محلياً

```bash
# افتح Command Prompt أو PowerShell
cd "C:\Users\ALBAHA\Desktop\my store"

# تهيئة Git
git init

# إضافة ملفات الإعداد
git add .gitignore README.md

# عمل أول commit
git commit -m "Initial commit - Project setup"

# إضافة ريموت GitHub (استبدل YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-store.git

# تغيير الفرع الرئيسي إلى main
git branch -M main
```

### 5. رفع الملفات إلى GitHub

```bash
# إضافة جميع الملفات
git add .

# عمل commit للملفات
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

# رفع الملفات إلى GitHub
git push -u origin main
```

### 6. التحقق من الرفع

1. **اذهب إلى مستودعك على GitHub**
2. **تأكد من وجود جميع الملفات**
3. **تحقق من README.md يظهر بشكل صحيح**

---

## 📁 الملفات الرئيسية التي تم رفعها

### Backend:
```
backend/
├── app/                 # Controllers, Models, Middleware
├── config/              # Configuration files
├── database/            # Migrations, Seeders, Factories
├── routes/              # API and web routes
├── storage/             # File storage
├── public/              # Public assets
├── composer.json        # PHP dependencies
├── .env.example         # Environment template
└── artisan              # Laravel CLI
```

### Frontend:
```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Redux store
│   ├── hooks/           # Custom hooks
│   └── styles/          # CSS and Tailwind
├── public/              # Static assets
├── dist/                # Build output
├── package.json         # Node dependencies
└── vite.config.js       # Vite configuration
```

### Configuration:
```
.gitignore               # Files to ignore
README.md                # Project documentation
GITHUB_SETUP.md          # This file
```

---

## 🔧 أوامر Git مفيدة

### عرض الحالة:
```bash
git status
```

### عرض التغييرات:
```bash
git diff
```

### عرض سجل commits:
```bash
git log --oneline
```

### إضافة ملفات جديدة:
```bash
git add filename
git add .
```

### عمل commit:
```bash
git commit -m "Your message"
```

### رفع التغييرات:
```bash
git push
```

### سحب التغييرات من GitHub:
```bash
git pull
```

---

## 🌟 بعد الرفع على GitHub

### 1. إعداد GitHub Pages (اختياري):
لعرض الواجهة الأمامية مباشرة:
1. **اذهب إلى Settings في مستودعك**
2. **اختر Pages من القائمة اليسرى**
3. **اختر Source: Deploy from a branch**
4. **اختر Branch: main و Folder: /frontend/dist**
5. **اضغط Save**

### 2. إضافة Collaborators:
1. **اذهب إلى Settings**
2. **اختر Collaborators**
3. **اضغط Add people**
4. **أدخل أسماء المستخدمين**

### 3. إضافة Issues و Projects:
1. **استخدم Issues لتتبع المهام**
2. **استخدم Projects للتنظيم**

---

## 📋 التحقق النهائي

بعد الرفع، تأكد من:

- ✅ جميع الملفات مرفوعة
- ✅ README.md يظهر بشكل صحيح
- ✅ .gitignore يعمل بشكل صحيح
- ✅ لا توجد ملفات حساسة مرفوعة (like .env)
- ✅ الروابط في README تعمل

---

## 🎯 الخطوات التالية

1. **مشاركة الرابط مع الفريق**
2. **إعداد Branches للتطوير**
3. **إضافة Pull Requests workflow**
4. **إعداد Actions للـ CI/CD**

**رابط المستودع سيكون:** `https://github.com/YOUR_USERNAME/ecommerce-store`

---

## 🆘 المساعدة

إذا واجهت أي مشاكل:
1. **تحقق من اتصال الإنترنت**
2. **تأكد من بيانات GitHub صحيحة**
3. **تحقق من صلاحيات المستودع**
4. **استخدم `git push --force` إذا لزم الأمر** (بحذر!)

**هل تريد مني مساعدتك في أي خطوة محددة؟** 🤔
