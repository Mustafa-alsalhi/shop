<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $contact;
    public $reply;

    /**
     * Create a new message instance.
     *
     * @param  \App\Models\ContactUs  $contact
     * @param  string  $reply
     * @return void
     */
    public function __construct($contact, $reply)
    {
        $this->contact = $contact;
        $this->reply = $reply;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject('رد على رسالتك - متجر أصالة')
            ->markdown('emails.contact-reply')
            ->with([
                'customerName' => $this->contact->name,
                'originalSubject' => $this->contact->subject,
                'originalMessage' => $this->contact->message,
                'reply' => $this->reply,
                'replyDate' => now()->format('Y-m-d H:i:s')
            ]);
    }
}
