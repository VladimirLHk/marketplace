let backendConnectHandler = {
  // запрос на информацию для работы в Marketplace
  getMarketplaceMenuParams(doneCallback, failCallback) {
    $.ajax(window.alarmCrmPlatform.domain + '/marketplace/get-widgets', {
      method: "GET",
      async: true
    }).done(doneCallback).fail(failCallback);
  },

  // запрос на сохранение настроек виджета: data в JSON формате
  saveWidgetSettings(code, data, doneCallback, failCallback) {
    $.ajax(alarmCrmPlatform.domain + '/api/widgets/settings', {
      method: "POST",
      data: {
        'settings': data,
        'code': code
      },
      async: true
    }).done(doneCallback).fail(failCallback);
  },

  // передача контактной инорфмации для выставления счета
  sendBillRequest(data, doneCallback, failCallback) {
    $.ajax(alarmCrmPlatform.domain + '/marketplace/buy', {
      method: "POST",
      data: data,
      async: true
    }).done(doneCallback).fail(failCallback);
  },

  // запрос на включение / отключенеи виджета и влключение демо-режима
  switchOnDemoOrWidget(code, controllerName, doneCallback, failCallback) {

    $.ajax(alarmCrmPlatform.domain + '/marketplace/' + controllerName, {
      method: "POST",
      async: true,
      data:{widget_code_to_change: code}
    }).done(doneCallback).fail(failCallback);

  },

};

export default backendConnectHandler;