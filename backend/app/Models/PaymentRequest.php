<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'payment_method',
        'payment_method_name',
        'payer_name',
        'reference_number',
        'phone_number',
        'payment_notes',
        'payment_image_path',
        'payment_amount',
        'payment_fee',
        'status',
        'admin_notes',
        'payment_date',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'payment_fee' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getStatusColorAttribute()
    {
        return [
            'pending' => 'warning',
            'approved' => 'success',
            'rejected' => 'danger',
        ][$this->status] ?? 'secondary';
    }

    public function getStatusTextAttribute()
    {
        return [
            'pending' => 'قيد الانتظار',
            'approved' => 'موافق عليه',
            'rejected' => 'مرفوض',
        ][$this->status] ?? 'غير معروف';
    }
}
