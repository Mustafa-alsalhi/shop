<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
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
     * العلاقة مع البائع
     */
    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

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
     * حساب قيمة الخصم بناءً على المنتجات المؤهلة
     */
    public function calculateDiscount($eligibleAmount): float
    {
        if ($this->type === 'fixed') {
            $discount = $this->value;
        } else {
            $discount = $eligibleAmount * ($this->value / 100);
        }

        // التحقق من أقصى خصم
        if ($this->maximum_discount && $discount > $this->maximum_discount) {
            $discount = $this->maximum_discount;
        }

        return min($discount, $eligibleAmount);
    }

    /**
     * التحقق من إمكانية تطبيق الكوبون على المبلغ المؤهل
     */
    public function canApplyToAmount($eligibleAmount): bool
    {
        if ($this->minimum_amount && $eligibleAmount < $this->minimum_amount) {
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
        // إذا لم يكن هناك منتجات محددة، ينطبق على جميع المنتجات
        if (empty($this->applicable_products)) {
            return true;
        }

        return in_array($productId, $this->applicable_products);
    }

    /**
     * التحقق من أن الفئة قابلة للتطبيق
     */
    public function isApplicableToCategory($categoryId): bool
    {
        // إذا لم يكن هناك فئات محددة، ينطبق على جميع الفئات
        if (empty($this->applicable_categories)) {
            return true;
        }

        return in_array($categoryId, $this->applicable_categories);
    }

    /**
     * التحقق من أن المنتج مؤهل للكوبون
     * يستخدم في السلة لتحديد المنتجات التي يمكن تطبيق الخصم عليها
     */
    public function isProductEligible($productId, $categoryId): bool
    {
        // إذا لم يكن هناك أي قيود، المنتج مؤهل
        if (empty($this->applicable_products) && empty($this->applicable_categories)) {
            return true;
        }

        // التحقق من المنتج
        if (!empty($this->applicable_products)) {
            if (in_array($productId, $this->applicable_products)) {
                return true;
            }
        }

        // التحقق من الفئة
        if (!empty($this->applicable_categories)) {
            if (in_array($categoryId, $this->applicable_categories)) {
                return true;
            }
        }

        return false;
    }

    /**
     * حساب المبلغ المؤهل للخصم من عناصر السلة
     */
    public function calculateEligibleAmount($cartItems): float
    {
        $eligibleAmount = 0;

        foreach ($cartItems as $item) {
            $productId = $item['product_id'] ?? $item['id'];
            $categoryId = $item['category_id'] ?? null;
            $quantity = $item['quantity'] ?? 1;
            $price = $item['price'] ?? $item['unit_price'] ?? 0;

            if ($this->isProductEligible($productId, $categoryId)) {
                $eligibleAmount += ($price * $quantity);
            }
        }

        return $eligibleAmount;
    }
}
