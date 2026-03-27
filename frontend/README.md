# E-Commerce Store Frontend

واجهة مستخدم احترافية لمتجر إلكترونيكي مبني باستخدام React.js و Vite

## التقنيات المستخدمة

- React 18.2.0
- Vite 4.5.0
- TailwindCSS 3.3.5
- Redux Toolkit
- React Router DOM
- Axios
- Heroicons
- React Query

## الهيكلية

```
src/
├── components/
│   ├── Auth/
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── Layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── SearchOverlay.jsx
│   │   └── CartSidebar.jsx
│   ├── Product/
│   │   ├── ProductCard.jsx
│   │   └── ProductFilters.jsx
│   └── UI/
│       ├── LoadingSpinner.jsx
│       └── Notifications.jsx
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── Errors/
│   │   ├── NotFound.jsx
│   │   └── ServerError.jsx
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   └── ...
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   └── cartService.js
├── store/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   ├── productsSlice.js
│   │   └── uiSlice.js
│   └── store.js
└── styles/
    └── globals.css
```

## المميزات

- **تصميم احترافي** باستخدام TailwindCSS
- **إدارة الحالة** مع Redux Toolkit
- **التنقل بين الصفحات** مع React Router
- **طلبات API** مع React Query و Axios
- **مكونات قابلة لإعادة الاستخدام**
- **نظام إشعارات** مدمجج
- **تحميل محسّن** و Skeleton Screens
- **تصميم متجاوب** للجوالات المختلفة

## التشغيل المحلي

### تثبيت الاعتماديات

```bash
npm install
```

### تشغيل خادم التطوير

```bash
npm run dev
```

### بناء نسخة الإنتاج

```bash
npm run build
```

### معاينة نسخة الإنتاج

```bash
npm run preview
```

## المتغيرات البيئية

يمكنك إنشاء ملف `.env` في جذر المشروع:

```env
VITE_API_URL=http://localhost:8000/api
```

## الاتصال بالـ Backend

التطبيق متصل بـ Laravel API backend. تأكد من تشغيل خادم Laravel على المنفذ 8000.

## الصفحات الرئيسية

- **Home**: الصفحة الرئيسية مع المنتجات المميزة
- **Products**: عرض جميع المنتجات مع الفلاتر والبحث
- **ProductDetail**: تفاصيل المنتج مع المتغيرات
- **Cart**: سلة المشتريات
- **Auth**: تسجيل الدخول والتسجيل
- **Admin**: لوحة تحكم المسؤول

## المكونات الرئيسية

- **Header**: شريط التصفح مع قائمة تنقل
- **Layout**: الهيكل الرئيسي للصفحات
- **ProductCard**: بطاقة المنتج مع إضافة للسلة
- **CartSidebar**: سلة المشتريات الجانبية
- **Notifications**: نظام الإشعارات

## Redux Store

- **authSlice**: إدارة حالة المصادقة
- **cartSlice**: إدارة سلة المشتريات
- **productsSlice**: إدارة المنتجات والفلاتر
- **uiSlice**: إدارة واجهة المستخدم

## الخدمات

- **apiService**: إعدادات Axios الأساسية
- **authService**: خدمات المصادقة
- **productService**: خدمات المنتجات
- **cartService**: خدمات السلة
