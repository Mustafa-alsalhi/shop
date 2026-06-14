<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'banner',
        'thumbnail',
        'discount_type',
        'discount_value',
        'start_date',
        'end_date',
        'status',
        'show_in_home',
        'sort_order',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'show_in_home' => 'boolean',
        'discount_value' => 'decimal:2',
    ];

    /**
     * العلاقة مع المنتجات (Many to Many)
     * العرض الواحد يحتوي على منتجات متعددة
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'offer_products')
            ->withPivot('special_price', 'sort_order')
            ->withTimestamps()
            ->orderBy('offer_products.sort_order');
    }

    /**
     * التحقق من أن العرض نشط حالياً
     */
    public function isActive()
    {
        if ($this->status !== 'active') {
            return false;
        }

        $now = now();
        
        if ($this->start_date && $this->start_date > $now) {
            return false;
        }

        if ($this->end_date && $this->end_date < $now) {
            return false;
        }

        return true;
    }

    /**
     * الحصول على السعر بعد الخصم للمنتج
     */
    public function getDiscountedPrice($product)
    {
        // إذا كان هناك سعر خاص للمنتج في العرض
        $pivot = $this->products()->where('product_id', $product->id)->first()?->pivot;
        if ($pivot && $pivot->special_price) {
            return $pivot->special_price;
        }

        // حساب الخصم بناءً على نوع الخصم
        $originalPrice = $product->price;

        switch ($this->discount_type) {
            case 'percentage':
                return $originalPrice - ($originalPrice * ($this->discount_value / 100));
            case 'fixed':
                return max(0, $originalPrice - $this->discount_value);
            case 'free_shipping':
                return $originalPrice; // الشحن مجاني، السعر الأصلي لا يتغير
            default:
                return $originalPrice;
        }
    }

    /**
     * الحصول على نسبة الخصم
     */
    public function getDiscountPercentage($product)
    {
        $originalPrice = $product->price;
        $discountedPrice = $this->getDiscountedPrice($product);

        if ($originalPrice <= 0) {
            return 0;
        }

        return round((($originalPrice - $discountedPrice) / $originalPrice) * 100);
    }
}
