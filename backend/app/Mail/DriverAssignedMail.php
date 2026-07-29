<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DriverAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $driver;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($order, $driver)
    {
        $this->order = $order;
        $this->driver = $driver;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('طلب جديد للتوصيل - الطلب رقم ' . $this->order->order_number)
            ->view('emails.driver_assigned');
    }
}
