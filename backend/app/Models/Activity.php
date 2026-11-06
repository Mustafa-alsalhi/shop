<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $table = 'activities';

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'description',
        'banner_title',
        'banner_subtitle',
        'banner_bg',
        'banner_image',
        'place_label',
        'item_label',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * الأماكن / المتاجر التابعة لهذا النشاط (مثلاً: مطاعم، كافيهات، مخابز)
     */
    public function sellers()
    {
        return $this->hasMany(Seller::class, 'type', 'slug');
    }

    /**
     * الأماكن النشطة فقط
     */
    public function activeSellers()
    {
        return $this->sellers()->where('status', 'active');
    }

    /**
     * التصنيفات المرتبطة بهذا النشاط
     */
    public function categories()
    {
        return $this->hasMany(Category::class, 'type', 'slug');
    }

    /**
     * التصنيفات النشطة
     */
    public function activeCategories()
    {
        return $this->categories()->where('is_active', true);
    }

    /**
     * نطاق الأنشطة المفعلة
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order', 'asc');
    }
}
