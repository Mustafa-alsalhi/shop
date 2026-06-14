<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'fee',
        'is_active',
        'config',
        'icon'
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'is_active' => 'boolean',
        'config' => 'array'
    ];
}
