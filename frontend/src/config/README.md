# Logo Configuration Guide

## كيفية تغيير شعار المتجر

يمكنك تغيير شعار المتجر بسهولة عن طريق تعديل الملف التالي:

### 📁 المسار
```
src/config/logo.js
```

### 🔧 الإعدادات المتاحة

#### 1. رابط الشعار (LOGO_URL)
```javascript
export const LOGO_URL = "https://example.com/your-logo.png";
```

#### 2. حجم الشعار (LOGO_SIZE)
```javascript
export const LOGO_SIZE = {
  width: 40,  // العرض بالبكسل
  height: 40  // الارتفاع بالبكسل
};
```

#### 3. اسم المتجر (STORE_NAME)
```javascript
export const STORE_NAME = "اسم متجرك";
```

### 📝 أمثلة

#### مثال 1: استخدام صورة من الإنترنت
```javascript
export const LOGO_URL = "https://my-website.com/logo.png";
export const LOGO_SIZE = { width: 50, height: 50 };
export const STORE_NAME = "متجري المفضل";
```

#### مثال 2: استخدام صورة محلية
```javascript
export const LOGO_URL = "/images/my-logo.png";
export const LOGO_SIZE = { width: 45, height: 45 };
export const STORE_NAME = "المتجر الذهبي";
```

#### مثال 3: استخدام صورة من مجلد assets
```javascript
export const LOGO_URL = "/assets/logo.svg";
export const LOGO_SIZE = { width: 60, height: 60 };
export const STORE_NAME = "متجر التكنولوجيا";
```

### 🎨 نصائح للشعار

1. **الحجم الموصى به:** 40x40 بكسل للشاشات العادية
2. **الصيغ المدعومة:** PNG, JPG, SVG, WEBP
3. **الخلفية:** يفضل استخدام صورة بشفافية (PNG)
4. **الدقة:** استخدم صورة عالية الجودة لتجنب التشويش

### 🔄 بعد التعديل

بعد تعديل الملف، سيتم تحديث الشعار تلقائياً في جميع صفحات الموقع التي تستخدم شريط العنوان.

### 📱 التوافق

الشعار يعمل بشكل متجاوب على:
- 🖥️ أجهزة الكمبيوتر
- 📱 الأجهزة اللوحية
- 📱 الهواتف الذكية

---

## 💬 WhatsApp Configuration

### 📁 المسار
```
src/config/whatsapp.js
```

### 🔧 الإعدادات المتاحة

#### 1. رقم الواتساب (WHATSAPP_NUMBER)
```javascript
export const WHATSAPP_NUMBER = "967776780551";
```

#### 2. الرسائل المخصصة (WHATSAPP_MESSAGES)
```javascript
export const WHATSAPP_MESSAGES = {
  home: "مرحباً، أود الاستفسار عن منتجات متجركم",
  products: "مرحباً، أود الاستفسار عن بعض المنتجات",
  product: "مرحباً، أود الاستفسار عن هذا المنتج",
  cart: "مرحباً، أود الاستفسار عن المنتجات في سلة المشتريات",
  account: "مرحباً، أود الاستفسار عن حسابي",
  default: "مرحباً، أود الاستفسار عن منتجاتكم"
};
```

### 🎯 المكونات

#### WhatsAppButton Component
**الملف:** `src/components/UI/WhatsAppButton.jsx`

زر واتساب عائم للصفحات الداخلية:
```jsx
<WhatsAppButton 
  phoneNumber={WHATSAPP_NUMBER} 
  message={WHATSAPP_MESSAGES.products}
/>
```

#### WhatsAppHeaderButton Component
**الملف:** `src/components/Layout/WhatsAppHeaderButton.jsx`

زر واتساب في شريط العنوان (يعمل في جميع الصفحات):
```jsx
<WhatsAppHeaderButton isMobile={false} />
<WhatsAppHeaderButton isMobile={true} />
```

### 🌟 المميزات

- 🎨 تصميم عصري وأنيق
- 📱 متجاوب مع جميع الشاشات
- ⚡ تأثيرات حركية سلسة
- 💬 رسائل مخصصة لكل صفحة
- 🔧 سهولة التخصيص
- 🎯 تحسين تجربة المستخدم
- 🌐 يعمل في جميع الصفحات تلقائياً

### 📍 أماكن الظهور

#### 🖥️ في جميع الصفحات:
- أسفل يسار الشاشة - زر عائم ثابت
- لون أخضر مع تأثيرات حركية
- أيقونة الواتساب الرسمية

### 🔄 التفعيل التلقائي

زر الواتساب يظهر تلقائياً في جميع الصفحات لأنه مدمج في:
- `src/main.jsx` (زر عائم في جميع الصفحات فقط)

### 🎯 ملاحظة هامة

تم إزالة زر الواتساب من شريط العنوان بناءً على طلبك. الآن زر الواتساب يظهر فقط كزر عائم في جميع الصفحات.
