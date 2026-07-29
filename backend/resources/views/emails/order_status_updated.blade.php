<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تحديث على حالة طلبك</title>
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
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header.processing {
            background-image: linear-gradient(to right, #3b82f6, #2563eb);
        }
        .header.shipped {
            background-image: linear-gradient(to right, #8b5cf6, #7c3aed);
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
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        .badge.processing {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .badge.shipped {
            background-color: #ede9fe;
            color: #5b21b6;
        }
        .button-container {
            text-align: center;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .button.processing {
            background-color: #2563eb;
        }
        .button.processing:hover {
            background-color: #1d4ed8;
        }
        .button.shipped {
            background-color: #7c3aed;
        }
        .button.shipped:hover {
            background-color: #6d28d9;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header {{ $statusType }}">
            @if($statusType === 'processing')
                <h1>طلبك قيد التجهيز 📦</h1>
            @else
                <h1>طلبك في الطريق إليك 🚚</h1>
            @endif
        </div>
        <div class="content">
            <h2>مرحباً {{ $order->user ? $order->user->first_name : 'عميلنا العزيز' }}،</h2>
            
            @if($statusType === 'processing')
                <p>لقد تم تأكيد طلبك والبدء في تجهيزه. فريقنا الآن يجمع المنتجات الرائعة التي اخترتها وسيتم تسليمها لشركة الشحن أو المندوب قريباً جداً!</p>
            @else
                <p>أخبار رائعة! تم تسليم طلبك لشركة الشحن او فريق التوصيل، وهو الآن في طريقه إليك. يرجى الاستعداد لاستلامه قريباً.</p>
            @endif
            
            <div class="order-details">
                <div class="order-row">
                    <span class="label">رقم الطلب:</span>
                    <span class="value" dir="ltr">#{{ $order->order_number }}</span>
                </div>
                <div class="order-row">
                    <span class="label">الحالة الجديدة:</span>
                    <span class="value">
                        @if($statusType === 'processing')
                            <span class="badge processing">قيد المعالجة</span>
                        @else
                            <span class="badge shipped">تم الشحن / في الطريق</span>
                        @endif
                    </span>
                </div>
                <div class="order-row">
                    <span class="label">تاريخ التحديث:</span>
                    <span class="value" dir="ltr">{{ now()->format('Y-m-d H:i') }}</span>
                </div>
            </div>

            <p>يمكنك تتبع سير طلبك بشكل مباشر ومعرفة المزيد من التفاصيل عبر حسابك في المتجر.</p>

            <div class="button-container">
                <a href="{{ url('/profile/orders/' . $order->id) }}" class="button {{ $statusType }}">تتبع الطلب</a>
            </div>
        </div>
        <div class="footer">
            <p>يسعدنا تسوقك معنا,<br>فريق عمل المتجر</p>
        </div>
    </div>
</body>
</html>
