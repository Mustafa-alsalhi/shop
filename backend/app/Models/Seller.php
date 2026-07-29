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
        'is_verified' => 'boolean'
    ];

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
}
