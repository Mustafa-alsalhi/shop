<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'slug',
        'description',
        'image',
        'image_url',
        'is_active',
        'show_on_homepage',
        'sort_order',
        'parent_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_on_homepage' => 'boolean',
    ];

    public function scopeStores($query)
    {
        return $query->where('type', 'store')->orWhereNull('type');
    }

    public function scopeRestaurants($query)
    {
        return $query->where('type', 'restaurant');
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    protected $appends = [
        'image_url',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getImageAttribute($value)
    {
        return $this->resolveCategoryImageUrl($value);
    }

    public function getImageUrlAttribute($value = null)
    {
        $val = $value ?: ($this->attributes['image'] ?? null);
        return $this->resolveCategoryImageUrl($val);
    }

    protected function resolveCategoryImageUrl($image)
    {
        if (empty($image)) {
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300';
        }

        // Already a full URL
        if (filter_var($image, FILTER_VALIDATE_URL)) {
            return $image;
        }

        // Starts with /storage/ or /images/
        if (str_starts_with($image, '/storage/')) {
            return url(ltrim($image, '/'));
        }
        if (str_starts_with($image, '/images/')) {
            return url(ltrim($image, '/'));
        }

        // Starts with storage/ or images/
        if (str_starts_with($image, 'storage/')) {
            return url($image);
        }
        if (str_starts_with($image, 'images/')) {
            return url($image);
        }

        // Check if file exists in public/storage/images/categories/
        if (file_exists(public_path('storage/images/categories/' . $image))) {
            return url('storage/images/categories/' . $image);
        }

        // Check if file exists in public/images/categories/
        if (file_exists(public_path('images/categories/' . $image))) {
            return url('images/categories/' . $image);
        }

        // Default path for category uploads
        return url('storage/images/categories/' . $image);
    }
}
