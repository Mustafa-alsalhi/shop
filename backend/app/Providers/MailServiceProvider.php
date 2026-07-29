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
        // Use environment variables for mail configuration (Gmail SMTP)
        Config::set('mail.default', env('MAIL_MAILER', 'smtp'));
        Config::set('mail.mailers.smtp.host', env('MAIL_HOST', 'smtp.gmail.com'));
        Config::set('mail.mailers.smtp.port', env('MAIL_PORT', 465));
        Config::set('mail.mailers.smtp.username', env('MAIL_USERNAME'));
        Config::set('mail.mailers.smtp.password', env('MAIL_PASSWORD'));
        Config::set('mail.mailers.smtp.encryption', env('MAIL_ENCRYPTION', 'ssl'));
        Config::set('mail.from.address', env('MAIL_FROM_ADDRESS'));
        Config::set('mail.from.name', env('MAIL_FROM_NAME', '${APP_NAME}'));
    }
}
