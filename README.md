# Multi-Vendor E-Commerce & Delivery Platform | منصة تجارة إلكترونية متعددة البائعين ونظام توصيل متكامل

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.2+-777BB4?style=for-the-badge&logo=php&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)

منصة تجارة إلكترونية وتوصيل متكاملة متعددة البائعين والأنشطة (**Multi-Vendor & Multi-Activity E-Commerce Platform**)، مبنية باستخدام **Laravel RESTful API** في الواجهة الخلفية و **React.js (Vite)** في الواجهة الأمامية. تدعم المنصة المتاجر المتنوعة، المطاعم، السوبرماركت، وتوفر 4 لوحات تحكم مستقلة بصلاحيات مخصصة (**RBAC**) لكل من المدير، البائع، مندوب التوصيل، والعميل.

---

## أبرز المميزات (Key Features)

### 1. نظام متعدد البائعين والأنشطة (Multi-Vendor & Dynamic Activities)
- دعم أنشطة تجارية متعددة (متاجر، مطاعم، سوبرماركت، وغيرها) مع صفحات أنشطة ديناميكية وبنرات إعلانية مخصصة لكل نشاط.
- تخصيص واجهات عرض المنتجات حسب نوع النشاط (بطاقات منتجات المتاجر مع المقاسات والألوان، وبطاقات وجبات المطاعم مع وقت التحضير والإضافات).
- نظام فئات رئيسية وفرعية متداخلة (**Nested Categories**) وعروض ترويجية وكوبونات خصم.

### 2. أربع لوحات تحكم متكاملة (Role-Based Dashboards - RBAC)
- **لوحة تحكم المدير (Admin Dashboard):** إدارة شاملة للمستخدمين، البائعين، المناديب، الأنشطة، الفئات، المنتجات، الطلبات، البنرات الإعلانية، الضرائب، طرق الدفع، وطلبات السحب المالي، مع تقارير وإحصائيات تفصيلية.
- **لوحة تحكم البائع (Seller Dashboard):** إدارة المتجر، المنتجات والمتغيرات والمخزون، العروض والكوبونات الخاصة بالمتجر، متابعة الطلبات وتحديث حالاتها، وطلبات سحب الأرباح.
- **لوحة تحكم مندوب التوصيل (Driver Dashboard):** استلام الطلبات المسندة، عرض موقع العميل والمتجر على الخريطة، تحديث حالة التوصيل، وتأكيد التسليم عبر رمز التحقق (**Delivery Confirmation Code**).
- **واجهة العميل (Customer Storefront):** تصفح المتاجر والمطاعم والأنشطة، فلترة وبحث متقدم، إدارة السلة والمفضلة (**Wishlist**)، إتمام الطلبات، وتتبع حالة الطلب وموقع التوصيل لحظياً.

### 3. المصادقة والتحقق عبر الواتساب (WhatsApp OTP Authentication)
- نظام مصادقة آمن يعتمد على **Laravel Sanctum** (**Token-Based API Authentication**).
- تسجيل الحسابات، التحقق من رقم الجوال، واستعادة كلمة المرور عبر رموز تحقق (**OTP**) تُرسل فورياً عبر **WhatsApp API (Quick Connect)**.
- دعم كامل لتنسيق والتحقق من أرقام الجوال اليمنية (`+967`) مع تحويل الأرقام العربية تلقائياً.

### 4. نظام التوصيل والخرائط التفاعلية (Geolocation & Delivery System)
- تحديد موقع الاستلام والتوصيل بدقة عبر خرائط تفاعلية (**Leaflet & React-Leaflet**).
- حساب تلقائي لتكلفة التوصيل بناءً على المسافة الفعلية بالكيلومتر والضرائب المطبقة.
- تأكيد استلام الطلب بأمان عبر كود تسليم مكون من 6 أرقام (`delivery_code`) يتم التحقق منه عند التسليم.

### 5. نظام محادثة فوري (Built-in Messaging System)
- نظام محادثة مدمج يتيح التواصل المباشر بين العملاء والبائعين وإدارة المنصة.

---

## التقنيات المستخدمة (Tech Stack)

| الطبقة (Layer) | التقنيات والأدوات (Technologies) |
| :--- | :--- |
| **Backend** | PHP 8.2+, Laravel, RESTful API, Laravel Sanctum (API Tokens), Eloquent ORM, GuzzleHTTP |
| **Frontend** | React 18, Vite, Redux Toolkit, React Query, React Router v6, Tailwind CSS, Framer Motion, Headless UI |
| **Maps & UI** | Leaflet, React-Leaflet, Heroicons, React Icons, React Hook Form, React Hot Toast |
| **Database** | MySQL (Relational Schema, Migrations, Seeders, Indexing) |
| **External APIs** | Quick Connect API (WhatsApp OTP Verification) |

---

## هيكلية المشروع (Project Architecture)

```text
shop/
├── backend/                  # الخادم المركزي (Laravel RESTful API)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # وحدات التحكم (Admin, Seller, Driver, Customer APIs)
│   │   │   └── Middleware/   # التحقق من الصلاحيات والأدوار (RoleMiddleware, SecurityHeaders)
│   │   ├── Models/           # نماذج قاعدة البيانات والعلاقات (Eloquent Models)
│   │   └── Services/         # خدمات الربط الخارجي (SmsService / WhatsApp OTP)
│   ├── config/               # إعدادات النظام و CORS والخدمات الخارجية
│   ├── database/
│   │   ├── migrations/       # هيكلة جداول قاعدة البيانات
│   │   └── seeders/          # البيانات الأولية الافتراضية
│   └── routes/
│       └── api.php           # مسارات الـ RESTful API
│
└── frontend/                 # تطبيق الويب (React.js + Vite)
    ├── src/
    │   ├── components/       # المكونات القابلة لإعادة الاستخدام (Layout, Banners, Product, UI)
    │   ├── pages/            # صفحات المنصة (Admin, Seller, Driver, Auth, Storefront)
    │   ├── services/         # طبقة الاتصال بالـ API (Axios Interceptors & Services)
    │   ├── store/            # إدارة الحالة العامة (Redux Toolkit Slices)
    │   ├── hooks/            # Custom React Hooks
    │   └── utils/            # الدوال المساعدة ومعالجة الصور
    └── public/               # الملفات الثابتة والشعارات
```

---

## طريقة التثبيت والتشغيل محلياً (Installation & Local Setup)

### المتطلبات الأساسية (Prerequisites)
- **PHP** >= 8.2 & **Composer**
- **MySQL** >= 8.0
- **Node.js** >= 18.x & **npm**

### 1. إعداد الواجهة الخلفية (Backend Setup)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

قم بإنشاء قاعدة بيانات في MySQL وتحديث بيانات الاتصال في ملف `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_store
DB_USERNAME=root
DB_PASSWORD=

QUICK_CONNECT_API_URL=https://aalcgjgocszngpcqzjih.supabase.co/functions/v1/public-api
QUICK_CONNECT_API_KEY=your_api_key_here
QUICK_CONNECT_CHANNEL=whatsapp
```

ثم قم بتشغيل الترحيلات والبيانات الأولية وتشغيل السيرفر:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```
سيعمل الخادم الخلفي على الرابط: `http://127.0.0.1:8000`

### 2. إعداد الواجهة الأمامية (Frontend Setup)

```bash
cd frontend
npm install
```

تأكد من ضبط رابط الـ API المحلي في ملف `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

لتشغيل بيئة التطوير:

```bash
npm run dev
```

ولبناء نسخة الإنتاج (`Production Build`):

```bash
npm run build
```

---

## أبرز مسارات الواجهة البرمجية (Core API Endpoints)

### المصادقة والتحقق (Authentication & WhatsApp OTP)
- `POST /api/register` — تسجيل حساب جديد وإرسال كود التحقق عبر الواتساب
- `POST /api/verify-register-otp` — تأكيد كود الـ OTP وتفعيل الحساب
- `POST /api/resend-register-otp` — إعادة إرسال كود التحقق
- `POST /api/login` — تسجيل الدخول برقم الجوال وكلمة المرور
- `POST /api/forgot-password` — طلب رمز استعادة كلمة المرور عبر الواتساب
- `POST /api/reset-password` — تعيين كلمة مرور جديدة
- `POST /api/register-seller` — تسجيل حساب بائع ومتجر جديد

### المتجر والمنتجات والأنشطة (Storefront, Products & Activities)
- `GET /api/activities` — جلب الأنشطة التجارية الفعالة
- `GET /api/banners` — جلب البنرات الإعلانية (الرئيسية، الترويجية، والخاصة بالأنشطة)
- `GET /api/categories` — جلب الفئات الرئيسية والفرعية
- `GET /api/products` — جلب المنتجات مع دعم الفلترة والبحث والترتيب
- `GET /api/sellers` — استعراض المتاجر والمطاعم المعتمدة
- `GET /api/offers` — جلب العروض الترويجية الفعالة

### الطلبات والتوصيل ولوحات التحكم (Orders & Role Dashboards)
- `POST /api/orders` — إنشاء طلب جديد مع حساب تكلفة التوصيل والضرائب
- `GET /api/admin/dashboard` — إحصائيات وتقارير لوحة تحكم المدير
- `GET /api/seller/dashboard` — إحصائيات ومبيعات لوحة تحكم البائع
- `GET /api/driver/dashboard` — ملخص الطلبات والأرباح في لوحة تحكم المندوب
- `PUT /api/driver/orders/{id}/status` — تحديث حالة توصيل الطلب وتأكيد كود التسليم

---

## الجوانب الأمنية (Security Practices)
- **Token-Based Authentication:** حماية المسارات عبر **Laravel Sanctum**.
- **Role-Based Access Control (RBAC):** فصل تام لصلاحيات (`admin`, `seller`, `driver`, `customer`) عبر Middleware مخصص.
- **OTP Verification:** التحقق من ملكية رقم الهاتف عبر الواتساب مع تحديد صلاحية زمنية للرمز.
- **Security Headers & CORS:** تطبيق ترويسات الحماية القياسية والتحكم الدقيق في النطاقات المسموح لها بالاتصال.
- **Input Validation & Sanitization:** التحقق الصارم من كافة المدخلات وحماية قاعدة البيانات من هجمات `SQL Injection` و `XSS`.

---

## الترخيص (License)
هذا المشروع مرخص بموجب رخصة [MIT License](https://opensource.org/licenses/MIT).
