<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'personal_photo',
        'emergency_contact_phone',
        'vehicle_type',
        'vehicle_plate_number',
        'id_card_image',
        'kuraimi_account',
        'is_verified'
    ];

    /**
     * Get the user that owns the driver profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
