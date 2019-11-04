<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix'=>'marketplace', 'middleware' => 'auth.api-key'], function(){
    Route::get('get-widgets', 'AlarmCRM\Marketplace\Http\Controllers\UserWidgetController@get');
    Route::post('install-widget', 'AlarmCRM\Marketplace\Http\Controllers\UserWidgetController@install');
    Route::post('uninstall-widget', 'AlarmCRM\Marketplace\Http\Controllers\UserWidgetController@uninstall');
    Route::post('demo', 'AlarmCRM\Marketplace\Http\Controllers\UserWidgetController@demo');
    Route::post('buy', 'AlarmCRM\Marketplace\Http\Controllers\UserWidgetController@buy');
});

