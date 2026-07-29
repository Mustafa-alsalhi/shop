<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SellerOrderNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $seller;
    public $items;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($order, $seller, $items)
    {
        $this->order = $order;
        $this->seller = $seller;
        $this->items = $items;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('طلب جديد لمنتجاتك! - الطلب رقم ' . $this->order->order_number)
            ->view('emails.seller_order_notification');
    }
}
