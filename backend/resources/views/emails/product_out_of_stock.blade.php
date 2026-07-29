<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تنبيه نفاذ المخزون</title>
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
            background-image: linear-gradient(to right, #dc2626, #ef4444);
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
        .product-details {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .product-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            border-bottom: 1px solid #fecaca;
            padding-bottom: 8px;
        }
        .product-row:last-child {
            margin-bottom: 0;
            border-bottom: none;
            padding-bottom: 0;
        }
        .label {
            font-weight: bold;
            color: #991b1b;
            width: 120px;
        }
        .value {
            color: #7f1d1d;
            text-align: left;
            flex-grow: 1;
        }
        .badge {
            background-color: #fee2e2;
            color: #dc2626;
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
            background-color: #dc2626;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #b91c1c;
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
            <h1>تنبيه: نفاذ كمية منتج ⚠️</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $ownerName }}،</h2>
            <p>نود تنبيهك بأن أحد منتجاتك المعروضة في المتجر قد نفذت كميته بالكامل (أو وصلت للصفر) في آخر عملية شراء.</p>
            
            <div class="product-details">
                <div class="product-row">
                    <span class="label">اسم المنتج:</span>
                    <span class="value">{{ $product->name }}</span>
                </div>
                <div class="product-row">
                    <span class="label">رمز المنتج (SKU):</span>
                    <span class="value" dir="ltr">{{ $product->sku ?: 'لا يوجد' }}</span>
                </div>
                <div class="product-row">
                    <span class="label">المخزون الحالي:</span>
                    <span class="value"><span class="badge">0 (نفذت الكمية)</span></span>
                </div>
            </div>

            <p>يرجى التفضل بتحديث المخزون وتوفير كميات جديدة من هذا المنتج إذا كنت تنوي الاستمرار في بيعه وإلا فلن يظهر للعملاء الجدد.</p>

            <div class="button-container">
                <a href="{{ url('/') }}" class="button" style="color: #ffffff;">الذهاب لتحديث المخزون</a>
            </div>
        </div>
        <div class="footer">
            <p>تنبيهات النظام الآلية المتجر,<br>لا تقم بالرد على هذه الرسالة</p>
        </div>
    </div>
</body>
</html>
