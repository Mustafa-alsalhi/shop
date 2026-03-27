<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // Check if the image is a URL (starts with http)
            if (filter_var($this->image, FILTER_VALIDATE_URL)) {
                return $this->image;
            }
            
            // Check if the image is already a full path
            if (str_starts_with($this->image, '/')) {
                return $this->image;
            }
            
            // Otherwise, assume it's stored in public/storage/images
            return url('storage/images/categories/' . $this->image);
        }
        
        // Return default placeholder image
        return 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=' . urlencode($this->name);
    }
}
