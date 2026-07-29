<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tax extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'rate',
        'type',
        'is_active',
        'is_default',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Scope to get only active taxes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get default tax
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Check if tax is currently valid based on dates
     */
    public function isValid()
    {
        $now = now();
        
        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }
        
        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }
        
        return true;
    }

    /**
     * Calculate tax amount for a given price
     */
    public function calculateTax($price)
    {
        if ($this->type === 'percentage') {
            return ($price * $this->rate) / 100;
        }
        
        return $this->rate;
    }
}
