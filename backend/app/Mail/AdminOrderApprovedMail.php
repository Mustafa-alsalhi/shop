<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminOrderApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $seller;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($order, $seller)
    {
        $this->order = $order;
        $this->seller = $seller;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('قبول طلب من التاجر - الطلب رقم ' . $this->order->order_number)
            ->view('emails.admin_order_approved');
    }
}
