<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $appends = ['full_image_url'];

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'link_url',
        'link_text',
        'is_active',
        'sort_order',
        'position'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Scope to get only active banners
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get banners by position
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Scope to order by sort order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Get the full image URL
     */
    public function getFullImageUrlAttribute()
    {
        if (!$this->image_url) {
            return null;
        }

        if (str_starts_with($this->image_url, 'http')) {
            return $this->image_url;
        }

        return url($this->image_url);
    }

    /**
     * Get active banners for a specific position
     */
    public static function getActiveBanners($position = 'home')
    {
        return self::active()
            ->byPosition($position)
            ->ordered()
            ->get();
    }
}
