<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingCompany extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'cost',
        'is_active',
        'delivery_days',
        'tracking_url'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'is_active' => 'boolean',
        'delivery_days' => 'integer'
    ];
}
