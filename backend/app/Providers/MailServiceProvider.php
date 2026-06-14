<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class MailServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Override mail configuration for all environments - Using SendGrid
        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', 'smtp.sendgrid.net');
        Config::set('mail.mailers.smtp.port', 587);
        Config::set('mail.mailers.smtp.username', 'apikey');
        Config::set('mail.mailers.smtp.password', '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');
        Config::set('mail.mailers.smtp.encryption', 'tls');
        Config::set('mail.from.address', 'mustafaalsalhi065@gmail.com');
        Config::set('mail.from.name', 'متجر أصالة');
    }
}
