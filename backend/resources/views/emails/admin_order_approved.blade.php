<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد قبول طلب من البائع</title>
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
            background-image: linear-gradient(to right, #2563eb, #3b82f6);
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
        .badge {
            background-color: #dbeafe;
            color: #1e40af;
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
            background-color: #2563eb;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #1d4ed8;
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
            <h1>تم قبول طلب من قبل التاجر ✅</h1>
        </div>
        <div class="content">
            <h2>إشعار إداري سريع،</h2>
            <p>لقد قام التاجر بالموافقة للتو على طلب جديد خاص بأحد العملاء وبدأ في معالجته.</p>
            
            <div class="order-details">
                <div class="order-row">
                    <span class="label">اسم التاجر (المتجر):</span>
                    <span class="value">{{ $seller->store_name ?? 'متجر غير محدد' }}</span>
                </div>
                <div class="order-row">
                    <span class="label">رقم الطلب:</span>
                    <span class="value" dir="ltr">#{{ $order->order_number }}</span>
                </div>
                <div class="order-row">
                    <span class="label">الحالة الجديدة:</span>
                    <span class="value"><span class="badge">قيد المعالجة</span></span>
                </div>
                <div class="order-row">
                    <span class="label">تاريخ وتوقيت القبول:</span>
                    <span class="value" dir="ltr">{{ now()->format('Y-m-d H:i') }}</span>
                </div>
            </div>

            <p>للاطلاع على تفاصيل الطلب بشكل كامل وللقيام بأي إجراء، يرجى التوجه إلى لوحة الإدارة العامة.</p>

            <div class="button-container">
                <a href="{{ url('/admin/orders') }}" class="button" style="color: #ffffff;">الذهاب لإدارة الطلبات</a>
            </div>
        </div>
        <div class="footer">
            <p>نظام إشعارات المتجر الآلي<br>لا تقم بالرد على هذه الرسالة</p>
        </div>
    </div>
</body>
</html>
