# 🚀 دليل خطوة بخطوة لرفع المشروع على GitHub

## 📋 المتطلبات الأساسية:
1. **اتصال بالإنترنت**
2. **حساب GitHub**
3. **Git مثبت على الجهاز**

---

## 🎯 الخطوة 1: تثبيت Git

### إذا لم يكن Git مثبتاً:
1. **افتح المتصفح**
2. **اذهب إلى:** https://git-scm.com/download/win
3. **حمل Git for Windows**
4. **ثبّت البرنامج** (اضغط Next, Next, Next, Finish)
5. **أعد تشغيل الكمبيوتر**

---

## 🎯 الخطوة 2: إنشاء مستودع GitHub

1. **افحح GitHub:** https://github.com
2. **سجل دخول** أو أنشئ حساب جديد
3. **اضغط "+" في الزاوية العلوية اليسرى**
4. **اختر "New repository"**
5. **املأ البيانات:**
   - Repository name: `store`
   - Description: `متجر إلكتروني احترافي - Laravel + React`
   - Public/Private: اختر حسب احتياجك
6. **اضغط "Create repository"**
7. **انسخ رابط المستودع:** `https://github.com/YOUR_USERNAME/store.git`

---

## 🎯 الخطوة 3: تجهيز المشروع للرفع

1. **افتح Command Prompt كـ Administrator:**
   - اضغط Win + X
   - اختر "Terminal (Admin)" أو "Command Prompt (Admin)"

2. **اذهب إلى مجلد المشروع:**
   ```cmd
   cd "C:\Users\ALBAHA\Desktop\my store"
   ```

3. **تحقق من الملفات:**
   ```cmd
   dir
   ```
   يجب ترى: backend/, frontend/, README.md, .gitignore

---

## 🎯 الخطوة 4: تهيئة Git ورفع الملفات

### 4.1 تهيئة Git:
```cmd
git init
```

### 4.2 إعداد المستخدم (مرة واحدة فقط):
```cmd
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
**استبدل باسمك وإيميلك الفعلي**

### 4.3 إضافة المستودع البعيد:
```cmd
git remote add origin https://github.com/YOUR_USERNAME/store.git
```
**استبدل YOUR_USERNAME باسم مستخدم GitHub**

### 4.4 إضافة الملفات:
```cmd
git add .
```

### 4.5 عمل commit:
```cmd
git commit -m "Complete E-Commerce Store with Laravel and React"
```

### 4.6 تغيير الفرع الرئيسي:
```cmd
git branch -M main
```

### 4.7 رفع الملفات:
```cmd
git push -u origin main
```

---

## 🎯 الخطوة 5: التحقق من الرفع

1. **اذهب إلى مستودعك على GitHub**
2. **تحقق من وجود:**
   - ✅ مجلد backend/
   - ✅ مجلد frontend/
   - ✅ ملف README.md
   - ✅ ملف .gitignore
   - ✅ جميع الملفات الأخرى

3. **تأكد من عدم وجود ملفات حساسة:**
   - ❌ لا يجب وجود .env
   - ❌ لا يجب وجود node_modules/
   - ❌ لا يجب وجود vendor/

---

## 🎯 الخطوة 6: مشاركة المشروع

### رابط المستودع:
```
https://github.com/YOUR_USERNAME/store
```

### يمكنك:
1. **مشاركة الرابط** مع الفريق
2. **إضافة Collaborators** من Settings
3. **استخدام Issues** لتتبع المهام
4. **إعداد GitHub Pages** للواجهة الأمامية

---

## 🚨 استكشاف الأخطاء:

### إذا ظهر "git not recognized":
- **الحل:** Git غير مثبت، أعد تثبيته

### إذا ظهر "Permission denied":
- **الحل:** افتح Command Prompt كـ Administrator

### إذا ظهر "Repository not found":
- **الحل:** تحقق من اسم المستخدم والمستودع

### إذا فشل الرفع:
- **الحل:** تحقق من اتصال الإنترنت والبيانات

---

## 📊 ملخص المشروع:

### ما سيتم رفعه:
- ✅ **Backend Laravel 10+** - API كامل
- ✅ **Frontend React.js** - واجهة احترافية
- ✅ **Database** - migrations و seeders
- ✅ **Authentication** - JWT و Sanctum
- ✅ **Admin Panel** - لوحة تحكم متكاملة
- ✅ **Documentation** - README.md وأدلة

### حجم المشروع:
- **Backend:** ~50MB (بدون vendor)
- **Frontend:** ~100MB (بدون node_modules)
- **Total:** ~150MB (ملفات المشروع فقط)

---

## 🎉 النتيجة النهائية:

**بعد تنفيذ هذه الخطوات، سيكون المشروع الخاص بك متاحاً على:**

```
https://github.com/YOUR_USERNAME/store
```

**ويمكن للفريق العمل عليه مباشرة!** 🚀

---

## 📞 المساعدة:

إذا واجهت أي مشاكل:
1. **تحقق من الخطوات مرة أخرى**
2. **تأكد من بيانات GitHub صحيحة**
3. **استخدم `git status` للتحقق**
4. **استخدم `git log` لعرض commits**

**هل تريد مني مساعدتك في أي خطوة محددة؟** 🤔
