<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رمز التحقق لتسجيل الدخول</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .otp-container {
            background-color: #fff7ed;
            border: 2px dashed #f59e0b;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #f59e0b;
            letter-spacing: 8px;
            margin: 10px 0;
        }
        .warning {
            color: #dc2626;
            font-size: 14px;
            margin-top: 15px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        .footer a {
            color: #f59e0b;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>متجر أصالة</h1>
        </div>
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 10px;">مرحباً {{ $userName }}!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                شكراً لتسجيل الدخول إلى متجر أصالة. لضمان أمان حسابك، يرجى استخدام رمز التحقق التالي لإكمال عملية تسجيل الدخول:
            </p>
            
            <div class="otp-container">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">رمز التحقق الخاص بك:</p>
                <div class="otp-code">{{ $otp }}</div>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.
            </p>
            
            <p class="warning">
                ⚠️ إذا لم تكن أن من قام بمحاولة تسجيل الدخول، يرجى تجاهل هذا البريد الإلكتروني.
            </p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} متجر أصالة. جميع الحقوق محفوظة.</p>
            <p>هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
        </div>
    </div>
</body>
</html>
