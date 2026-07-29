<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم تسليم طلبكم بسلام</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }
        .header {
            background-image: linear-gradient(to right, #10b981, #059669);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 32px 24px;
            color: #374151;
            line-height: 1.6;
        }
        .content h2 {
            color: #111827;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .order-details {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .order-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .order-row:last-child {
            margin-bottom: 0;
            border-bottom: none;
            padding-bottom: 0;
        }
        .label {
            font-weight: bold;
            color: #4b5563;
        }
        .value {
            color: #111827;
            text-align: left;
        }
        .badge {
            background-color: #d1fae5;
            color: #065f46;
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        .button-container {
            text-align: center;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #059669;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .review-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            padding: 16px;
            border-radius: 8px;
            margin-top: 24px;
            text-align: center;
        }
        .review-box p {
            margin-top: 0;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تم توصيل طلبك بنجاح! 📦🎉</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $order->user ? $order->user->first_name : 'عميلنا العزيز' }}،</h2>
            <p>يسعدنا إخبارك بأنه تم تسليم طلبك بنجاح إلى العنوان المحدد. نتمنى أن تنال المنتجات إعجابك وتكون إضافة رائعة ليومك!</p>
            
            <div class="order-details">
                <div class="order-row">
                    <span class="label">رقم الطلب:</span>
                    <span class="value" dir="ltr">#{{ $order->order_number }}</span>
                </div>
                <div class="order-row">
                    <span class="label">الحالة النهائية:</span>
                    <span class="value"><span class="badge">تم التسليم</span></span>
                </div>
                <div class="order-row">
                    <span class="label">تاريخ التسليم:</span>
                    <span class="value" dir="ltr">{{ now()->format('Y-m-d H:i') }}</span>
                </div>
            </div>

            <div class="review-box">
                <p><strong>رأيك يهمنا! ⭐</strong></p>
                <p style="font-size: 14px; margin-bottom: 0;">نأمل أن تشاركنا تجربتك وتقييمك للمنتجات التي وصلت إليك.</p>
            </div>

            <div class="button-container">
                <a href="{{ url('/profile/orders') }}" class="button" style="color: #ffffff;">عرض طلباتي وتقييم المنتجات</a>
            </div>
        </div>
        <div class="footer">
            <p>شكراً لثقتك بنا,<br>فريق عمل المتجر</p>
        </div>
    </div>
</body>
</html>
