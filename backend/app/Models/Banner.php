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
        'position',
        'type'
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
        if ($position === 'home') {
            return $query->where(function ($q) {
                $q->where('position', 'home')
                  ->orWhereNull('position')
                  ->orWhere('position', '');
            });
        }

        return $query->where('position', $position);
    }

    /**
     * Scope to get banners by activity type (e.g. store, restaurant, cafe, etc.)
     */
    public function scopeByType($query, $type)
    {
        if (!$type) {
            return $query;
        }

        if ($type === 'store' || $type === 'stores') {
            return $query->where(function ($q) {
                $q->whereIn('type', ['store', 'stores', 'all'])
                  ->orWhereNull('type')
                  ->orWhere('type', '');
            });
        }

        if ($type === 'restaurant' || $type === 'restaurants') {
            return $query->whereIn('type', ['restaurant', 'restaurants', 'all']);
        }

        return $query->whereIn('type', [$type, 'all']);
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

        // Use the application root URL
        $backendUrl = url('/');

        // If image_url starts with /storage/, prepend the backend URL
        if (str_starts_with($this->image_url, '/storage/')) {
            return $backendUrl . $this->image_url;
        }

        // If image_url starts with /, prepend the backend URL
        if (str_starts_with($this->image_url, '/')) {
            return $backendUrl . $this->image_url;
        }

        // Otherwise, prepend /storage/ and the backend URL
        return $backendUrl . '/storage/' . $this->image_url;
    }

    /**
     * Get active banners for a specific position and activity type
     */
    public static function getActiveBanners($position = 'home', $type = 'store')
    {
        return self::active()
            ->byPosition($position)
            ->byType($type)
            ->ordered()
            ->get();
    }
}
