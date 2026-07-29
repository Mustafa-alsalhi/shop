@component('mail::message')
# مرحباً {{ $userName }}،

لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في متجر أصالة.

**رمز التحقق الخاص بك هو:**

@component('mail::panel')
<div style="text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #d97706;">
{{ $otp }}
</div>
@endcomponent

الرمز صالح لمدة 10 دقائق فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة ولا تشارك الرمز مع أي شخص.

مع تحياتنا،<br>
فريق {{ config('app.name') }}
@endcomponent
