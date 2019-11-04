<?php

namespace AlarmCRM\Marketplace;

use AlarmCRM\Platform\Platform;
use AlarmCRM\Platform\PlatformEventListener;
use AlarmCRM\Platform\Events\ServingPlatform;
use Illuminate\Support\ServiceProvider;

class WidgetServiceProvider extends ServiceProvider
{
    protected $templates = [
        'marketplace_menu',
        'widget_full_description',
        'marketplace_buy_form',
        'marketplace_widget_button',
        ];
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $widgetName = 'marketplace';
        PlatformEventListener::serving(function (ServingPlatform $event) use ($widgetName) {
            Platform::script($widgetName, __DIR__.'/../dist/js/script.js');
            Platform::style($widgetName, __DIR__.'/../dist/css/styles.css');
            foreach ($this->templates as $template) {
                Platform::template(
                    $widgetName.'.'.$template.'.twig',
                    __DIR__.'/../resources/templates/'.$template.'.twig'
                );
            };
        });

        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'marketplace');
        $this->publishes([
            __DIR__ . '/../config/marketplace.php' => config_path('marketplace.php'),
        ]);
        $this->publishes([
            __DIR__.'/../resources/views' => resource_path('views/vendor/marketplace'),
        ]);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
