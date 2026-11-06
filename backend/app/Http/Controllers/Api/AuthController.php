<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoginOtpMail;
use App\Mail\ResetPasswordMail;

class AuthController extends Controller
{
    private function ensurePhoneAuthSchema(): void
    {
        static $checked = false;
        if ($checked) {
            return;
        }
        $checked = true;

        try {
            DB::statement('ALTER TABLE users MODIFY email VARCHAR(255) NULL');
        } catch (\Exception $e) {
            // Ignore if DB driver does not support MODIFY or column is already nullable
        }
    }

    private function findUserByPhone(string $phone): ?User
    {
        $variants = SmsService::getPhoneVariants($phone);
        return User::whereIn('phone', $variants)->first();
    }

    private function formatUserPayload(User $user): array
    {
        $data = $user->toArray();
        if (!empty($data['email']) && str_ends_with($data['email'], '@phone.local')) {
            $data['email'] = null;
        }
        return $data;
    }

    public function register(Request $request)
    {
        $this->ensurePhoneAuthSchema();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:30',
            'password' => 'required|string|min:8|confirmed',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $normalizedPhone = SmsService::normalizeYemeniPhone($request->phone);
        if (!$normalizedPhone) {
            return response()->json([
                'message' => 'رقم الجوال اليمني غير صحيح. يجب أن يبدأ بـ 77 أو 73 أو 71 أو 70 ويتكون من 9 أرقام.',
                'errors' => [
                    'phone' => ['رقم الجوال اليمني غير صحيح (مثال: 771234567)']
                ]
            ], 422);
        }

        // التحقق مما إذا كان الرقم مسجلاً ومفعلاً مسبقاً
        $existingUser = $this->findUserByPhone($normalizedPhone);
        if ($existingUser && $existingUser->email_verified_at !== null) {
            return response()->json([
                'message' => 'رقم الجوال هذا مسجل مسبقاً، يرجى تسجيل الدخول.',
                'errors' => [
                    'phone' => ['رقم الجوال هذا مسجل مسبقاً.']
                ]
            ], 422);
        }

        // توليد رمز تحقق OTP من 6 أرقام
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // إرسال الرمز عبر خدمة الرسائل النصية Quick Connect
        $smsResult = SmsService::sendOtp($normalizedPhone, $otp, 'register');
        if (!$smsResult['success']) {
            return response()->json([
                'message' => $smsResult['message'] ?? 'فشل في إرسال رمز التحقق عبر الرسائل النصية، يرجى المحاولة مرة أخرى.'
            ], 500);
        }

        $userData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => trim($request->first_name . ' ' . $request->last_name),
            'phone' => $normalizedPhone,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
            'role' => 'customer',
            'is_active' => true,
        ];

        try {
            if ($existingUser) {
                $existingUser->update($userData);
                $existingUser->remember_token = $otp;
                $existingUser->save();
                $user = $existingUser;
            } else {
                $userData['email'] = null;
                $user = User::create($userData);
                $user->remember_token = $otp;
                $user->save();
            }
        } catch (\Exception $dbEx) {
            // Fallback if email column still has NOT NULL constraint
            $userData['email'] = $normalizedPhone . '@phone.local';
            if ($existingUser) {
                $existingUser->update($userData);
                $existingUser->remember_token = $otp;
                $existingUser->save();
                $user = $existingUser;
            } else {
                $user = User::where('email', $userData['email'])->first();
                if ($user) {
                    $user->update($userData);
                } else {
                    $user = User::create($userData);
                }
                $user->remember_token = $otp;
                $user->save();
            }
        }

        // حفظ رمز التحقق في الكاش لمدة 10 دقائق
        $cacheKey = 'register_otp_' . $normalizedPhone;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        return response()->json([
            'requires_otp' => true,
            'phone' => $normalizedPhone,
            'message' => 'تم إرسال رمز التحقق (OTP) عبر الواتساب إلى رقم جوالك',
            'user' => [
                'id' => $user->id,
                'phone' => $user->phone,
                'name' => $user->name,
            ]
        ], 201);
    }

    public function verifyRegisterOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $normalizedPhone = SmsService::normalizeYemeniPhone($request->phone) ?: trim($request->phone);
        $user = $this->findUserByPhone($normalizedPhone);

        if (!$user) {
            return response()->json([
                'message' => 'الحساب غير موجود، يرجى إعادة التسجيل'
            ], 404);
        }

        $cacheKey = 'register_otp_' . $normalizedPhone;
        $cachedOtp = Cache::get($cacheKey);
        $fallbackOtp = $user->remember_token;

        $inputOtp = trim($request->otp);
        $isValidOtp = ($cachedOtp && (string) $cachedOtp === $inputOtp)
            || (!$cachedOtp && $fallbackOtp && strlen($fallbackOtp) === 6 && (string) $fallbackOtp === $inputOtp);

        if (!$isValidOtp) {
            return response()->json([
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
            ], 422);
        }

        Cache::forget($cacheKey);

        $user->email_verified_at = now();
        $user->remember_token = null;
        $user->is_active = true;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->formatUserPayload($user),
            'token' => $token,
            'message' => 'تم تفعيل حسابك وتسجيل الدخول بنجاح!'
        ]);
    }

    public function resendRegisterOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $normalizedPhone = SmsService::normalizeYemeniPhone($request->phone);
        if (!$normalizedPhone) {
            return response()->json([
                'message' => 'رقم الجوال غير صحيح'
            ], 422);
        }

        $user = $this->findUserByPhone($normalizedPhone);
        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $cacheKey = 'register_otp_' . $normalizedPhone;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        $user->remember_token = $otp;
        $user->save();

        $smsResult = SmsService::sendOtp($normalizedPhone, $otp, 'register');
        if (!$smsResult['success']) {
            return response()->json([
                'message' => $smsResult['message'] ?? 'فشل في إعادة إرسال رمز التحقق'
            ], 500);
        }

        return response()->json([
            'message' => 'تم إعادة إرسال رمز التحقق إلى رقم جوالك بنجاح'
        ]);
    }

    public function login(Request $request)
    {
        $identifier = trim((string) ($request->input('phone') ?? $request->input('email') ?? ''));
        $password = (string) $request->input('password', '');

        if ($identifier === '' || $password === '') {
            return response()->json([
                'message' => 'يرجى إدخال رقم الجوال وكلمة المرور'
            ], 422);
        }

        $user = null;

        // دعم تسجيل الدخول برقم الجوال اليمني (أو البريد للحسابات الإدارية القديمة)
        if (str_contains($identifier, '@')) {
            $user = User::where('email', $identifier)->first();
        } else {
            $normalizedPhone = SmsService::normalizeYemeniPhone($identifier);
            if (!$normalizedPhone) {
                return response()->json([
                    'message' => 'رقم الجوال اليمني غير صحيح (مثال: 771234567)'
                ], 422);
            }
            $user = $this->findUserByPhone($normalizedPhone);
        }

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'رقم الجوال أو كلمة المرور غير صحيحة'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'حسابك غير نشط، يرجى التواصل مع الدعم الفني'
            ], 403);
        }

        // تسجيل الدخول مباشرة برقم الجوال وكلمة المرور (حيث أن التحقق بـ OTP أصبح عند إنشاء الحساب)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->formatUserPayload($user),
            'token' => $token,
            'message' => 'تم تسجيل الدخول بنجاح'
        ]);
    }

    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $identifier = trim((string) ($request->input('phone') ?? $request->input('email') ?? ''));
        $normalizedPhone = SmsService::normalizeYemeniPhone($identifier);
        $keySuffix = $normalizedPhone ?: $identifier;

        $cacheKey = 'login_otp_' . $keySuffix;
        $cachedOtp = Cache::get($cacheKey) ?: Cache::get('register_otp_' . $keySuffix);

        $user = $normalizedPhone
            ? $this->findUserByPhone($normalizedPhone)
            : User::where('email', $identifier)->first();

        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

        $inputOtp = trim($request->otp);
        $isValidOtp = ($cachedOtp && (string) $cachedOtp === $inputOtp)
            || (!$cachedOtp && $user->remember_token && strlen($user->remember_token) === 6 && (string) $user->remember_token === $inputOtp);

        if (!$isValidOtp) {
            return response()->json([
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
            ], 422);
        }

        Cache::forget($cacheKey);
        Cache::forget('register_otp_' . $keySuffix);

        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
        }
        $user->remember_token = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $this->formatUserPayload($user),
            'token' => $token,
            'message' => 'تم تسجيل الدخول بنجاح'
        ]);
    }

    public function resendLoginOtp(Request $request)
    {
        $identifier = trim((string) ($request->input('phone') ?? $request->input('email') ?? ''));
        $normalizedPhone = SmsService::normalizeYemeniPhone($identifier);

        $user = $normalizedPhone
            ? $this->findUserByPhone($normalizedPhone)
            : User::where('email', $identifier)->first();

        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $keySuffix = $normalizedPhone ?: $user->email;
        Cache::put('login_otp_' . $keySuffix, $otp, now()->addMinutes(10));
        $user->remember_token = $otp;
        $user->save();

        if ($normalizedPhone || $user->phone) {
            $targetPhone = $normalizedPhone ?: $user->phone;
            $smsResult = SmsService::sendOtp($targetPhone, $otp, 'login');
            if (!$smsResult['success']) {
                return response()->json([
                    'message' => $smsResult['message'] ?? 'فشل في إرسال رمز التحقق'
                ], 500);
            }
        } else {
            try {
                Mail::to($user->email)->send(new LoginOtpMail($otp, $user->name));
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'فشل في إرسال رمز التحقق، يرجى المحاولة مرة أخرى'
                ], 500);
            }
        }

        return response()->json([
            'message' => 'تم إعادة إرسال رمز التحقق بنجاح'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $identifier = trim((string) ($request->input('phone') ?? $request->input('email') ?? ''));
        if ($identifier === '') {
            return response()->json([
                'message' => 'يرجى إدخال رقم الجوال'
            ], 422);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        if (!str_contains($identifier, '@')) {
            $normalizedPhone = SmsService::normalizeYemeniPhone($identifier);
            if (!$normalizedPhone) {
                return response()->json([
                    'message' => 'رقم الجوال اليمني غير صحيح'
                ], 422);
            }

            $user = $this->findUserByPhone($normalizedPhone);
            if (!$user) {
                return response()->json([
                    'message' => 'لا يوجد حساب مسجل برقم الجوال هذا'
                ], 404);
            }

            Cache::put('reset_otp_' . $normalizedPhone, $otp, now()->addMinutes(10));
            $user->remember_token = $otp;
            $user->save();

            $smsResult = SmsService::sendOtp($normalizedPhone, $otp, 'reset');
            if (!$smsResult['success']) {
                return response()->json([
                    'message' => $smsResult['message'] ?? 'فشل في إرسال رمز الاستعادة عبر الرسائل النصية'
                ], 500);
            }

            return response()->json([
                'phone' => $normalizedPhone,
                'message' => 'تم إرسال رمز إعادة تعيين كلمة المرور إلى رقم جوالك'
            ]);
        }

        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();
        Cache::put('reset_otp_' . $user->email, $otp, now()->addMinutes(10));
        $user->remember_token = $otp;
        $user->save();

        try {
            Mail::to($user->email)->send(new ResetPasswordMail($otp, $user->name));
        } catch (\Exception $e) {
            Log::error('Mail sending failed in forgotPassword: ' . $e->getMessage());
            return response()->json([
                'message' => 'فشل في إرسال الرمز: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'تم إرسال رمز إعادة تعيين كلمة المرور'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $identifier = trim((string) ($request->input('phone') ?? $request->input('email') ?? ''));
        if ($identifier === '') {
            return response()->json([
                'message' => 'رقم الجوال مطلوب'
            ], 422);
        }

        $normalizedPhone = !str_contains($identifier, '@')
            ? SmsService::normalizeYemeniPhone($identifier)
            : null;

        $user = $normalizedPhone
            ? $this->findUserByPhone($normalizedPhone)
            : User::where('email', $identifier)->first();

        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

        $keySuffix = $normalizedPhone ?: $user->email;
        $cachedOtp = Cache::get('reset_otp_' . $keySuffix);
        $inputOtp = trim($request->token);

        $isValidOtp = ($cachedOtp && (string) $cachedOtp === $inputOtp)
            || (!$cachedOtp && $user->remember_token && strlen($user->remember_token) === 6 && (string) $user->remember_token === $inputOtp);

        if (!$isValidOtp) {
            return response()->json([
                'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية'
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->remember_token = null;
        $user->save();

        Cache::forget('reset_otp_' . $keySuffix);

        return response()->json([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح'
        ]);
    }

    public function getCurrentUser(Request $request)
    {
        $user = $request->user();

        $ordersCount = \App\Models\Order::where('user_id', $user->id)->count();
        $wishlistCount = \App\Models\Wishlist::where('user_id', $user->id)->count();
        $couponsCount = 0;

        $cleanEmail = ($user->email && str_ends_with($user->email, '@phone.local')) ? null : $user->email;

        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => $user->name,
            'email' => $cleanEmail,
            'phone' => $user->phone,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'postal_code' => $user->postal_code,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'seller_status' => $user->seller ? $user->seller->status : null,
            'stats' => [
                'orders_count' => $ordersCount,
                'wishlist_count' => $wishlistCount,
                'coupons_count' => $couponsCount
            ]
        ]);
    }

    public function registerSeller(Request $request)
    {
        $this->ensurePhoneAuthSchema();
        $user = auth('sanctum')->user();

        $rules = [
            'store_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'kuraimi_account_name' => 'nullable|string|max:255',
            'kuraimi_account_number' => 'nullable|string|max:255',
            'alt_network_name' => 'nullable|string|max:255',
            'alt_recipient_name' => 'nullable|string|max:255',
            'alt_recipient_phone' => 'nullable|string|max:50',

            // Files
            'avatar_file' => 'nullable|image|max:2048',
            'id_card_image_file' => 'required|image|max:5120',
            'commercial_register_image_file' => 'nullable|image|max:5120',
            'signed_contract_image_file' => 'nullable|image|max:5120',
        ];

        if (!$user) {
            $rules['first_name'] = 'required|string|max:255';
            $rules['last_name'] = 'required|string|max:255';
            $rules['phone'] = 'required_without:email|nullable|string|max:30';
            $rules['email'] = 'nullable|string|email|max:255|unique:users,email';
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $validated = $request->validate($rules);

        if (!$user) {
            $normalizedPhone = !empty($validated['phone'])
                ? SmsService::normalizeYemeniPhone($validated['phone'])
                : null;

            if (!empty($validated['phone']) && !$normalizedPhone) {
                return response()->json([
                    'message' => 'رقم الجوال اليمني غير صحيح (مثال: 771234567)'
                ], 422);
            }

            if ($normalizedPhone && $this->findUserByPhone($normalizedPhone)) {
                return response()->json([
                    'message' => 'رقم الجوال هذا مسجل مسبقاً، يرجى تسجيل الدخول أولاً ثم التقديم كبائع.'
                ], 422);
            }

            try {
                $user = \App\Models\User::create([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'phone' => $normalizedPhone,
                    'email' => $validated['email'] ?? null,
                    'email_verified_at' => now(),
                    'password' => Hash::make($validated['password']),
                    'role' => 'seller',
                    'is_active' => true,
                ]);
            } catch (\Exception $e) {
                $user = \App\Models\User::create([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                    'phone' => $normalizedPhone,
                    'email' => $validated['email'] ?? ($normalizedPhone . '@phone.local'),
                    'email_verified_at' => now(),
                    'password' => Hash::make($validated['password']),
                    'role' => 'seller',
                    'is_active' => true,
                ]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            unset($validated['first_name'], $validated['last_name'], $validated['phone'], $validated['email'], $validated['password'], $validated['password_confirmation']);
        } else {
            if ($user->role !== 'admin' && $user->role !== 'seller') {
                $user->role = 'seller';
                $user->save();
            }
            $token = $request->bearerToken();
        }

        $existingSeller = \App\Models\Seller::where('user_id', $user->id)->first();
        if ($existingSeller) {
            return response()->json([
                'message' => 'لقد قمت بتقديم طلب مسبقاً.'
            ], 400);
        }

        $uploadFields = [
            'avatar_file' => ['folder' => 'sellers', 'field' => 'avatar'],
            'id_card_image_file' => ['folder' => 'sellers/documents', 'field' => 'id_card_image'],
            'commercial_register_image_file' => ['folder' => 'sellers/documents', 'field' => 'commercial_register_image'],
            'signed_contract_image_file' => ['folder' => 'sellers/documents', 'field' => 'signed_contract_image'],
        ];

        foreach ($uploadFields as $requestField => $config) {
            if ($request->hasFile($requestField)) {
                $file = $request->file($requestField);
                $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(storage_path('app/public/images/' . $config['folder']), $fileName);
                $validated[$config['field']] = asset('storage/images/' . $config['folder'] . '/' . $fileName);
            }
            unset($validated[$requestField]);
        }

        $validated['user_id'] = $user->id;
        $validated['status'] = 'pending';
        $validated['is_verified'] = false;

        $seller = \App\Models\Seller::create($validated);

        return response()->json([
            'message' => 'تم إنشاء المتجر بنجاح وطلبك قيد المراجعة.',
            'seller' => $seller,
            'user' => $this->formatUserPayload($user->fresh()),
            'token' => $token
        ], 201);
    }

    public function updateProfile(Request $request)
    {
        $this->ensurePhoneAuthSchema();
        $user = Auth::user();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'current_password' => 'nullable|required_with:new_password|string',
            'new_password' => 'nullable|string|min:6|confirmed',
        ]);

        $normalizedPhone = $request->filled('phone')
            ? (SmsService::normalizeYemeniPhone($request->phone) ?: $request->phone)
            : $user->phone;

        $updateData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $request->first_name . ' ' . $request->last_name,
            'phone' => $normalizedPhone,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
        ];

        if ($request->filled('email')) {
            $updateData['email'] = $request->email;
        }

        if ($request->filled('new_password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'كلمة المرور الحالية غير صحيحة'
                ], 422);
            }

            $updateData['password'] = Hash::make($request->new_password);
        }

        $user->update($updateData);

        return response()->json([
            'user' => $this->formatUserPayload($user),
            'message' => 'تم تحديث الملف الشخصي بنجاح'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
