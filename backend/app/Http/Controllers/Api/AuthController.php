<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\LoginOtpMail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
            'role' => 'customer',
            'is_active' => true,
        ]);

        // Don't return token - user must login with OTP
        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول باستخدام بريدك الإلكتروني وكلمة المرور.',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'بيانات الدخول غير صحيحة'
            ], 401);
        }

        $user = Auth::user();

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'حسابك غير نشط، يرجى التواصل مع الدعم الفني'
            ], 403);
        }

        // If email is already verified, skip OTP and login directly
        if ($user->email_verified_at) {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'تم تسجيل الدخول بنجاح'
            ]);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in cache for 10 minutes
        $cacheKey = 'login_otp_' . $user->email;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        // Send OTP email
        try {
            Mail::to($user->email)->send(new LoginOtpMail($otp, $user->name));
        } catch (\Exception $e) {
            \Log::error('Mail sending failed in login: ' . $e->getMessage());
            \Log::error('Mail error trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'فشل في إرسال رمز التحقق: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'requires_otp' => true,
            'email' => $user->email,
            'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
        ]);
    }

    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $cacheKey = 'login_otp_' . $request->email;
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp) {
            return response()->json([
                'message' => 'رمز التحقق منتهي الصلاحية أو غير صحيح'
            ], 422);
        }

        if ($cachedOtp !== $request->otp) {
            return response()->json([
                'message' => 'رمز التحقق غير صحيح'
            ], 422);
        }

        // Delete OTP from cache after successful verification
        Cache::forget($cacheKey);

        // Authenticate user and generate token
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

        // Mark email as verified if it isn't already
        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'تم تسجيل الدخول بنجاح'
        ]);
    }

    public function resendLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'المستخدم غير موجود'
            ], 404);
        }

        // Generate new 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store new OTP in cache for 10 minutes
        $cacheKey = 'login_otp_' . $user->email;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        // Send OTP email
        try {
            Mail::to($user->email)->send(new LoginOtpMail($otp, $user->name));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'فشل في إرسال رمز التحقق، يرجى المحاولة مرة أخرى'
            ], 500);
        }

        return response()->json([
            'message' => 'تم إعادة إرسال رمز التحقق بنجاح'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in cache for 10 minutes for password reset
        $cacheKey = 'reset_otp_' . $user->email;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        // Send OTP email
        try {
            Mail::to($user->email)->send(new ResetPasswordMail($otp, $user->name));
        } catch (\Exception $e) {
            \Log::error('Mail sending failed in forgotPassword: ' . $e->getMessage());
            return response()->json([
                'message' => 'فشل في إرسال الرمز: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
        ]);
    }

    public function resetPassword(Request $request)
    {
        // Notice we are treating 'token' as 'otp' now from frontend side, or receiving 'otp' explicitly
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string|size:6', // The frontend sends this as token, we use it as OTP
            'password' => 'required|string|min:8|confirmed',
        ]);

        $cacheKey = 'reset_otp_' . $request->email;
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp) {
            return response()->json([
                'message' => 'رمز التحقق منتهي الصلاحية أو غير صحيح'
            ], 422);
        }

        if ($cachedOtp !== $request->token) {
            return response()->json([
                'message' => 'رمز التحقق غير صحيح'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح'
        ]);
    }

    public function getCurrentUser(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'city' => $user->city,
            'country' => $user->country,
            'postal_code' => $user->postal_code,
            'role' => $user->role,
            'is_active' => $user->is_active,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'current_password' => 'nullable|required_with:new_password|string',
            'new_password' => 'nullable|string|min:6|confirmed',
        ]);

        // Update profile data
        $updateData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
        ];

        // Update password if provided
        if ($request->filled('new_password')) {
            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'كلمة المرور الحالية غير صحيحة'
                ], 422);
            }

            // Update password
            $updateData['password'] = Hash::make($request->new_password);
        }

        $user->update($updateData);

        return response()->json([
            'user' => $user,
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
