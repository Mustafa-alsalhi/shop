@component('mail::message')
# مرحباً {{ $customerName }}!

شكراً لتواصلك معنا في متجر أصالة. نقدر اهتمامك ونحن سعداء بالرد على رسالتك.

---

## رسالتك الأصلية:

**الموضوع:** {{ $originalSubject }}

**الرسالة:**
{{ $originalMessage }}

---

## ردنا:

{{ $reply }}

---

## معلومات إضافية:

- **تاريخ الرد:** {{ $replyDate }}
- **البريد الإلكتروني:** support@asalah-store.com
- **رقم الهاتف:** +966 50 123 4567

---

إذا كان لديك أي استفسارات إضافية، فلا تتردد في التواصل معنا.

مع أطيب التحيات،
فريق متجر أصالة

---

**تابعنا على:**
- [الموقع الإلكتروني](https://asalah-store.com)
- [تويتر](https://twitter.com/asalah_store)
- [انستغرام](https://instagram.com/asalah_store)
@endcomponent
