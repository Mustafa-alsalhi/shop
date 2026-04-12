<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_amount',
        'maximum_discount',
        'usage_limit',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
        'is_first_time_only',
        'applicable_products',
        'applicable_categories'
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'is_first_time_only' => 'boolean',
        'applicable_products' => 'array',
        'applicable_categories' => 'array'
    ];

    /**
     * التحقق من صلاحية الكوبون
     */
    public function isValid(): bool
    {
        // التحقق من التفعيل
        if (!$this->is_active) {
            return false;
        }

        // التحقق من تاريخ البدء
        if ($this->starts_at && now()->lt($this->starts_at)) {
            return false;
        }

        // التحقق من تاريخ الانتهاء
        if ($this->expires_at && now()->gt($this->expires_at)) {
            return false;
        }

        // التحقق من حد الاستخدام
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * حساب قيمة الخصم
     */
    public function calculateDiscount($totalAmount): float
    {
        if ($this->type === 'fixed') {
            $discount = $this->value;
        } else {
            $discount = $totalAmount * ($this->value / 100);
        }

        // التحقق من أقصى خصم
        if ($this->maximum_discount && $discount > $this->maximum_discount) {
            $discount = $this->maximum_discount;
        }

        return min($discount, $totalAmount);
    }

    /**
     * التحقق من إمكانية تطبيق الكوبون على المبلغ
     */
    public function canApplyToAmount($totalAmount): bool
    {
        if ($this->minimum_amount && $totalAmount < $this->minimum_amount) {
            return false;
        }

        return true;
    }

    /**
     * زيادة عدد مرات الاستخدام
     */
    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }

    /**
     * التحقق من أن الكوبون للعملاء الجدد فقط
     */
    public function isFirstTimeOnly(): bool
    {
        return $this->is_first_time_only;
    }

    /**
     * التحقق من أن المنتج قابل للتطبيق
     */
    public function isApplicableToProduct($productId): bool
    {
        if (!$this->applicable_products) {
            return true; // ينطبق على جميع المنتجات
        }

        return in_array($productId, $this->applicable_products);
    }

    /**
     * التحقق من أن الفئة قابلة للتطبيق
     */
    public function isApplicableToCategory($categoryId): bool
    {
        if (!$this->applicable_categories) {
            return true; // ينطبق على جميع الفئات
        }

        return in_array($categoryId, $this->applicable_categories);
    }
}
