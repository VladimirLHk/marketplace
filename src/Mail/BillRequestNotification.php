<?php

namespace AlarmCRM\Marketplace\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class BillRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $bill_request_info;

    /**
     * Create a new message instance.
     *
     * @param $bill_request_info
     */
    public function __construct($bill_request_info)
    {
        $this->bill_request_info = $bill_request_info;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $subjectMessage = 'Новая заявка на покупку виджета "'
            .$this->bill_request_info->bill_request_widget_name.'" ('
            .$this->bill_request_info->bill_request_widget_code.')';
        return $this
            ->from(config('marketplace.from'))
            ->subject($subjectMessage)
            ->view('marketplace::bill-request');
    }
}
