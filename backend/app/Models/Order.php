<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'subtotal',
        'tax',
        'shipping',
        'status',
        'payment_status',
        'payment_method',
        'shipping_company',
        'shipping_address',
        'billing_address',
        'notes',
        'latitude',
        'longitude',
        'formatted_address',
        'building_details',
        'driver_id',
        'driver_status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'shipping_address' => 'array',
        'billing_address' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentRequests()
    {
        return $this->hasMany(PaymentRequest::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    protected static function booted()
    {
        static::updated(function ($order) {
            if ($order->wasChanged('status')) {
                try {
                    $user = $order->user;
                    if ($user && $user->email) {
                        if ($order->status === 'delivered') {
                            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OrderDeliveredMail($order));
                        } elseif (in_array($order->status, ['processing', 'shipped'])) {
                            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OrderStatusUpdatedMail($order, $order->status));
                        }
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send Order Status Update Mail: ' . $e->getMessage());
                }
            }
        });
    }
}
