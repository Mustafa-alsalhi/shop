<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلب جديد لمنتجاتك</title>
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
            background-image: linear-gradient(to right, #059669, #10b981);
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
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 24px;
        }
        .items-table th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: bold;
            text-align: right;
            padding: 12px;
            border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #111827;
        }
        
        .button-container {
            text-align: center;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        .button {
            display: inline-block;
            background-color: #059669;
            color: #ffffff;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #047857;
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
            <h1>تم طلب من منتجاتك! 🛒</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $seller->store_name ?? $seller->user->name }}،</h2>
            <p>لديك مبيعات جديدة في متجرك! قام عميل للتو بإجراء طلب يحتوي على منتجات خاصة بك.</p>
            
            <div class="order-details">
                <div class="order-row">
                    <span class="label">رقم الطلب:</span>
                    <span class="value" dir="ltr">#{{ $order->order_number }}</span>
                </div>
                <div class="order-row">
                    <span class="label">تاريخ الطلب:</span>
                    <span class="value">{{ $order->created_at->format('Y-m-d H:i') }}</span>
                </div>
            </div>

            <h3 style="color: #111827; margin-bottom: 12px;">المنتجات المطلوبة:</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($items as $item)
                        <tr>
                            <td>
                                {{ $item->product_name }}
                                @if($item->color || $item->size || $item->variant_name)
                                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                                        @if($item->color) لون: {{ $item->color }} | @endif
                                        @if($item->size) مقاس: {{ $item->size }} | @endif
                                        @if($item->variant_name) {{ $item->variant_name }}: {{ $item->variant_value }} @endif
                                    </div>
                                @endif
                            </td>
                            <td>{{ $item->quantity }}</td>
                            <td>{{ number_format($item->price, 2) }}</td>
                            <td>{{ number_format($item->total, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <p>يرجى التوجه إلى لوحة البائع الخاصة بك لتجهيز الشحنة ومتابعة الطلب في أقرب وقت.</p>

            <div class="button-container">
                <a href="{{ url('/seller/orders') }}" class="button" style="color:#ffffff;">الذهاب للوحة تحكم البائع</a>
            </div>
        </div>
        <div class="footer">
            <p>متمنين لك المزيد من المبيعات,<br>إدارة المتجر</p>
        </div>
    </div>
</body>
</html>
