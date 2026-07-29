<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'detailed_description',
        'price',
        'sale_price',
        'currency',
        'tax_id',
        'condition',
        'sale_start_date',
        'sale_end_date',
        'compare_at_price',
        'sku',
        'image_url',
        'images',
        'gallery_images',
        'variants',
        'category_id',
        'seller_id',
        'seller_name',
        'seller_avatar',
        'seller_rating',
        'seller_reviews_count',
        'is_approved',
        'seller_category_id',
        'is_active',
        'is_featured',
        'stock',
        'sold_count',
        'rating',
        'reviews_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'images' => 'array',
        'gallery_images' => 'array',
        'variants' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_approved' => 'boolean',
        'rating' => 'decimal:2',
        'sale_start_date' => 'datetime',
        'sale_end_date' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function sellerCategory()
    {
        return $this->belongsTo(SellerCategory::class, 'seller_category_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * العلاقة مع العروض (Many to Many)
     * المنتج الواحد يمكن أن يدخل في أكثر من عرض
     */
    public function offers()
    {
        return $this->belongsToMany(Offer::class, 'offer_products')
            ->withPivot('special_price', 'sort_order')
            ->withTimestamps()
            ->orderBy('offer_products.sort_order');
    }

    /**
     * الحصول على العروض النشطة للمنتج
     */
    public function activeOffers()
    {
        return $this->offers()->where('status', 'active')
            ->where(function ($query) {
                $now = now();
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', $now);
            })
            ->where(function ($query) {
                $now = now();
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', $now);
            });
    }

    protected static function booted()
    {
        static::updated(function ($product) {
            // If stock dropped to 0 (or less) and it was previously > 0
            if ($product->wasChanged('stock') && $product->stock <= 0 && $product->getOriginal('stock') > 0) {
                
                try {
                    // Determine who to notify
                    $email = null;
                    $ownerName = '';

                    if ($product->seller_id && $product->seller && $product->seller->user) {
                        $email = $product->seller->user->email;
                        $ownerName = $product->seller->store_name ?? $product->seller->user->name;
                    } else {
                        // Admin's product
                        $admin = \App\Models\User::where('role', 'admin')->first();
                        if ($admin) {
                            $email = $admin->email;
                            $ownerName = 'الإدارة العامة';
                        }
                    }

                    if ($email) {
                        \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\ProductOutofStockMail($product, $ownerName));
                    }

                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send ProductOutofStockMail: ' . $e->getMessage());
                }

            }
        });
    }
}
