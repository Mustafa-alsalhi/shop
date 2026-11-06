<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'store_name',
        'description',
        'avatar',
        'avatar_image',
        'rating',
        'reviews_count',
        'status',
        'is_verified',
        'address',
        'city',
        'latitude',
        'longitude',
        'type',
        'cover_image',
        'is_open',
        'accepting_orders',
        'preparation_time',
        'min_order_amount',
        'working_hours',
        'cuisine_type',
        'id_card_image',
        'commercial_register_image',
        'signed_contract_image',
        'kuraimi_account_name',
        'kuraimi_account_number',
        'alt_network_name',
        'alt_recipient_name',
        'alt_recipient_phone'
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_open' => 'boolean',
        'accepting_orders' => 'boolean',
        'min_order_amount' => 'decimal:2',
        'working_hours' => 'array',
    ];

    public function isRestaurant(): bool
    {
        return $this->type === 'restaurant';
    }

    public function isStore(): bool
    {
        return $this->type === 'store' || empty($this->type);
    }

    public function isActivity(): bool
    {
        return !$this->isStore();
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class, 'type', 'slug');
    }

    public function scopeRestaurants($query)
    {
        return $query->where('type', 'restaurant');
    }

    public function scopeStores($query)
    {
        return $query->where('type', 'store')->orWhereNull('type');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function sellerCategories()
    {
        return $this->hasMany(SellerCategory::class);
    }

    public function approvedProducts()
    {
        return $this->products()->where('is_approved', true);
    }

    public function getAvatarAttribute($value)
    {
        $img = $value ?: ($this->attributes['avatar_image'] ?? null);
        if (empty($img)) {
            return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200';
        }
        if (filter_var($img, FILTER_VALIDATE_URL)) {
            return $img;
        }
        if (str_starts_with($img, '/storage/')) {
            return url(ltrim($img, '/'));
        }
        if (str_starts_with($img, '/images/')) {
            return url(ltrim($img, '/'));
        }
        if (str_starts_with($img, 'storage/')) {
            return url($img);
        }
        if (str_starts_with($img, 'images/')) {
            return url($img);
        }
        if (str_starts_with($img, '/')) {
            return url($img);
        }
        if (file_exists(public_path('storage/images/sellers/' . $img))) {
            return url('storage/images/sellers/' . $img);
        }
        if (file_exists(public_path('images/sellers/' . $img))) {
            return url('images/sellers/' . $img);
        }
        return url('storage/images/sellers/' . $img);
    }

    public function getCoverImageAttribute($value)
    {
        if (empty($value)) {
            return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200';
        }
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        if (str_starts_with($value, '/storage/')) {
            return url(ltrim($value, '/'));
        }
        if (str_starts_with($value, '/images/')) {
            return url(ltrim($value, '/'));
        }
        if (str_starts_with($value, 'storage/')) {
            return url($value);
        }
        if (str_starts_with($value, 'images/')) {
            return url($value);
        }
        if (str_starts_with($value, '/')) {
            return url($value);
        }
        return url('storage/' . $value);
    }
}
