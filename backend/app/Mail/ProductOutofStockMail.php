<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProductOutofStockMail extends Mailable
{
    use Queueable, SerializesModels;

    public $product;
    public $ownerName;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($product, $ownerName)
    {
        $this->product = $product;
        $this->ownerName = $ownerName;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('تنبيه هام: نفاذ كمية منتج ⚠️ - ' . $this->product->name)
            ->view('emails.product_out_of_stock');
    }
}
