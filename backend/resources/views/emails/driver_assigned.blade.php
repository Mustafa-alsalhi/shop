<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تعيين طلب للتوصيل</title>
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
            background-image: linear-gradient(to right, #4f46e5, #9333ea);
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
            width: 120px;
        }
        .value {
            color: #111827;
            text-align: left;
            flex-grow: 1;
        }
        .button-container {
            text-align: center;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #4338ca;
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
        <div class="header">
            <h1>تم تعيين طلب جديد للتوصيل</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $driver->name }}،</h2>
            <p>لقد تم تكليفك بطلب جديد ومسؤولية توصيله إلى العميل في الوقت المحدد.</p>
            
            <div class="order-details">
                <div class="order-row">
                    <span class="label">رقم الطلب:</span>
                    <span class="value" dir="ltr">#{{ $order->order_number }}</span>
                </div>
                <div class="order-row">
                    <span class="label">العنوان:</span>
                    <span class="value">{{ $order->formatted_address ?: 'غير محدد' }}</span>
                </div>
                <div class="order-row">
                    <span class="label">اسم العميل:</span>
                    <span class="value">{{ $order->user ? $order->user->name : 'غير محدد' }}</span>
                </div>
                <div class="order-row">
                    <span class="label">هاتف العميل:</span>
                    <span class="value">{{ $order->user ? $order->user->phone : 'غير محدد' }}</span>
                </div>
            </div>

            <p>يرجى التوجه إلى لوحة التحكم الخاصة بك للاطلاع على كافة التفاصيل والمعلومات الإضافية ومسار التوصيل.</p>

            <div class="button-container">
                <a href="{{ url('/driver/orders/' . $order->id) }}" class="button" style="color: #ffffff;">عرض تفاصيل الطلب</a>
            </div>
        </div>
        <div class="footer">
            <p>نشكرك على مجهودك,<br>إدارة المتجر</p>
        </div>
    </div>
</body>
</html>
