<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * تطبيع رقم الجوال اليمني إلى صيغة 9 أرقام (مثال: 771234567)
     * يقبل: 771234567, 0771234567, +967771234567, 967771234567, 00967771234567
     * البادئات المسموحة: 70, 71, 73, 77, 78
     */
    public static function normalizeYemeniPhone(?string $phone): ?string
    {
        if ($phone === null || trim($phone) === '') {
            return null;
        }

        // تحويل الأرقام العربية/الفارسية إلى إنجليزية
        $arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $cleaned = str_replace($arabicDigits, $englishDigits, trim($phone));

        // إزالة جميع الرموز والمسافات والإبقاء على الأرقام فقط
        $digits = preg_replace('/\D+/', '', $cleaned);

        if (str_starts_with($digits, '00967')) {
            $digits = substr($digits, 5);
        } elseif (str_starts_with($digits, '967') && strlen($digits) >= 12) {
            $digits = substr($digits, 3);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        // التحقق من أن الرقم مكون من 9 أرقام ويبدأ بـ 70, 71, 73, 77, 78
        if (preg_match('/^7[01378]\d{7}$/', $digits)) {
            return $digits;
        }

        return null;
    }

    /**
     * إرجاع كافة الصيغ المحتملة لرقم الجوال للبحث في قاعدة البيانات
     */
    public static function getPhoneVariants(string $phone): array
    {
        $normalized = self::normalizeYemeniPhone($phone) ?: preg_replace('/\D+/', '', $phone);

        if (!$normalized) {
            return [$phone];
        }

        return array_values(array_unique([
            $normalized,
            '0' . $normalized,
            '+967' . $normalized,
            '967' . $normalized,
            '00967' . $normalized,
        ]));
    }

    /**
     * إرسال رسالة نصية عبر Quick Connect API
     */
    public static function sendSms(string $phone, string $message, ?string $channel = null): array
    {
        $normalized = self::normalizeYemeniPhone($phone);
        if (!$normalized) {
            return [
                'success' => false,
                'status' => 400,
                'message' => 'رقم الجوال اليمني غير صحيح. يجب أن يبدأ بـ 77 أو 73 أو 71 أو 70 ويتكون من 9 أرقام.',
            ];
        }

        $baseUrl = rtrim(
            config('services.quick_connect.url', 'https://aalcgjgocszngpcqzjih.supabase.co/functions/v1/public-api'),
            '/'
        );
        $apiKey = config('services.quick_connect.key', 'qc_live_d66bc38904eeeb17eb0a6e27097c7ff1588657b235ad76e7');
        $selectedChannel = $channel ?: config('services.quick_connect.channel', 'whatsapp');

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($baseUrl . '/messages', [
                    'channel' => $selectedChannel,
                    'to' => $normalized,
                    'body' => $message,
                ]);

            $status = $response->status();
            $data = $response->json();

            if ($response->successful()) {
                Log::info('SMS sent successfully via Quick Connect', [
                    'to' => $normalized,
                    'channel' => $selectedChannel,
                    'response' => $data,
                ]);

                return [
                    'success' => true,
                    'status' => $status,
                    'data' => $data,
                ];
            }

            Log::error('Quick Connect SMS API error', [
                'status' => $status,
                'to' => $normalized,
                'response' => $response->body(),
            ]);

            $errorMessage = match ($status) {
                400 => 'بيانات الرسالة أو رقم الجوال غير صحيح',
                401 => 'مفتاح خدمة الرسائل النصية غير صالح',
                402 => 'رصيد خدمة الرسائل النصية غير كافٍ حالياً',
                403 => 'حساب خدمة الرسائل غير مفعّل أو المفتاح موقوف',
                404 => 'مسار خدمة الرسائل غير موجود',
                default => ($data['message'] ?? $data['error'] ?? 'فشل في إرسال الرسالة النصية عبر المزود'),
            };

            return [
                'success' => false,
                'status' => $status,
                'message' => $errorMessage,
                'data' => $data,
            ];
        } catch (\Exception $e) {
            Log::error('Exception while sending SMS via Quick Connect: ' . $e->getMessage(), [
                'to' => $normalized,
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'status' => 500,
                'message' => 'تعذر الاتصال بخدمة الرسائل النصية: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * إرسال رمز التحقق OTP عبر الرسائل النصية
     */
    public static function sendOtp(string $phone, string $otp, string $purpose = 'register'): array
    {
        $message = match ($purpose) {
            'register' => "رمز التحقق لتفعيل حسابك هو: {$otp}\nصالح لمدة 10 دقائق. لا تشارك هذا الرمز مع أي شخص.",
            'reset' => "رمز استعادة كلمة المرور لحسابك هو: {$otp}\nصالح لمدة 10 دقائق.",
            default => "رمز التحقق لتسجيل الدخول هو: {$otp}\nصالح لمدة 10 دقائق.",
        };

        return self::sendSms($phone, $message);
    }

    /**
     * استعلام الرصيد من Quick Connect API
     */
    public static function getBalance(): array
    {
        $baseUrl = rtrim(
            config('services.quick_connect.url', 'https://aalcgjgocszngpcqzjih.supabase.co/functions/v1/public-api'),
            '/'
        );
        $apiKey = config('services.quick_connect.key', 'qc_live_d66bc38904eeeb17eb0a6e27097c7ff1588657b235ad76e7');

        try {
            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Accept' => 'application/json',
                ])
                ->get($baseUrl . '/balance');

            return [
                'success' => $response->successful(),
                'status' => $response->status(),
                'data' => $response->json(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'status' => 500,
                'message' => $e->getMessage(),
            ];
        }
    }
}

