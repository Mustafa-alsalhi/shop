<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'product_name',
        'price',
        'image_url',
        'sku',
        'weight',
        'dimensions',
        'category',
        'brand',
        'description',
        'short_description',
        'status',
        'featured',
        'variant_attributes',
        'currency',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
