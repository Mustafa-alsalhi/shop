<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $statusType; // 'processing' or 'shipped'

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($order, $statusType)
    {
        $this->order = $order;
        $this->statusType = $statusType;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $subject = '';
        if ($this->statusType === 'processing') {
            $subject = 'طلبك قيد التجهيز 📦 - الطلب رقم ' . $this->order->order_number;
        } elseif ($this->statusType === 'shipped') {
            $subject = 'طلبك في الطريق إليك 🚚! - الطلب رقم ' . $this->order->order_number;
        }

        return $this->subject($subject)
            ->view('emails.order_status_updated');
    }
}
