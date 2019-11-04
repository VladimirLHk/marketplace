<?php

namespace AlarmCRM\Marketplace\Http\Controllers;

use AlarmCRM\Marketplace\Mail\BillRequestNotification;
use App\Models\User;
use App\Models\Widget;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Mail;

class UserWidgetController extends Controller
{
    /**
     * Вернуть информацию о виджетах для данного пользователя.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function get(Request $request)
    {
        //не мой код
    }

    /**
     * Изменить для данного пользователя у конкретного виджета один параметр в Pivot.
     *
     * @param string $widgetCode
     * @param $pivotAttributes
     * @return bool
     */
    private function setPivotAttribute($widgetCode, $pivotAttributes)
    {
        /** @var User $user */
        $user = auth()->user();

        $widget = $user->getWidgetByCode($widgetCode);

        if ($widget) {
            $user->widgets()->updateExistingPivot($widget->id, $pivotAttributes);
            return true;
        } else {
            $widget = Widget::where('code', $widgetCode)->first();

            if ($widget) {
                $user->widgets()->attach($widget->id, $pivotAttributes);
                return true;
            }
        }

        return false;
    }

    /**
     * Установить конкретный виджет для данного пользователя.
     *
     * @param Request $request
     * @return Response
     */
    public function install(Request $request)
    {
        $widgetCode = $request->input('widget_code_to_change');
        $this->setPivotAttribute($widgetCode, ['enabled' => 1]);

        return response()->json('Виджет установлен ', 200);
    }

    /**
     * Установить конкретный виджет для данного пользователя.
     *
     * @param Request $request
     * @return Response
     */
    public function uninstall(Request $request)
    {
        $widgetCode = $request->input('widget_code_to_change');
        $this->setPivotAttribute($widgetCode, ['enabled' => 0]);
        return response()->json('Виджет отключен', 200);
    }

    public function demo(Request $request)
    {
        $trialPeriod = config('marketplace.trial_period');
        $trialPeriodExpiredDate = Carbon::today()->addDay($trialPeriod);
        $widgetCode = $request->input('widget_code_to_change');
        $this->setPivotAttribute(
            $widgetCode,
            ['enabled' => 1, 'is_test_period' => 1,'expired'=> $trialPeriodExpiredDate]
        );
        return response()->json([
            'message'=>'Включен демо-режим',
            'expired'=>(string)$trialPeriodExpiredDate->format('Y-m-d')
        ], 200);
    }

    public function buy(Request $request)
    {
        Mail::to(config('marketplace.bill_request_notification_mail'))
            ->queue(new BillRequestNotification((object) $request->input()));
        return response()->json('Данные для выставления счета получены', 200);
    }
}
