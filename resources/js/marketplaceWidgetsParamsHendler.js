import ajaxEngine from "./backendConnectHendler";
// продолжительность пробного периода
let trial_period = 7;
// коллекция "плоских" объектов для формирвоания версток меню и модального окна настроек
let widgetSettingsCollection = {};

// на основании данных с бэка формирует массив плоских объектов для подготовки парамтеров в шаблоны
let setWidgetSettingsCollection = function (data) {
  let widgets_data = {};
  $.each(data, (key, item) => {
    widgets_data[item.code] = {
      // title: item.code,
      code: item.code,
      description_name: item.name,
      description_text: item.annotation,
      description_right_side: item.description,
      image_url: item.image_url,
      free_pack: !!(item.free_pack),
      price: item.price,
      extension_period: item.extension_period,
      subscription_price: item.subscription_price,
      is_subscription: item.is_subscription,
      is_no_pivot: item.pivot ? item.pivot.expired === null : true,
      installed: item.pivot ? item.pivot.enabled === 1 : false,
      is_test_period: item.pivot ? !!(item.pivot.is_test_period) : false,
      is_purchased: item.pivot ? item.pivot.is_purchased === 1 : false,
      expired: item.pivot ? item.pivot.expired : null,
    }
  });

  widgetSettingsCollection.widgets = widgets_data;
};

// устанавливает продолжительность периода пробного использования виджетов
let setTrialPeriod = function(trialPeriod) {
  trial_period = trialPeriod !== undefined ? trialPeriod : trial_period;
};

let marketplaceWidgetsParamsHandler = {

  // устанавливает trial_period и данные по виджетам Marketplace
  setMarketplaceParams(data) {
    if ( data === null || typeof data !=='object' || $.isEmptyObject(data)) {
      return
    }
    setWidgetSettingsCollection(data.widgets);
    setTrialPeriod(data.trial_period);
  },

  // получает с бэка параметры виджетов Marketplace для конкретного пользователя
  updateMarketplaceWidgetSettings(doneCallback, failCallback) {
    ajaxEngine.getMarketplaceMenuParams(doneCallback, failCallback);
  },

  // сохраняет настройки виджета
  saveWidgetSettings(code, data, doneCallback, failCallback) {
    ajaxEngine.saveWidgetSettings(
      code,
      data,
      () => {
        window.alarmCrmPlatform.widgets[code].settings = data;
        window.alarmCrmPlatform.widgetsValues[code].settings = data;
        doneCallback();
      },
      failCallback);
  },

  // отпарвляет контактные данные для выставления счета на покупку или подписку
  sendBillRequest(code, data, doneCallback, failCallback) {
    data.bill_request_widget_name = marketplaceWidgetsParamsHandler.getWidgetDescriptionName(code);
    data.bill_request_widget_code = code;
    ajaxEngine.sendBillRequest(data, doneCallback, failCallback)
  },

  // отправляет запрос на включение/отключение виджета или включение пробного периода
  switchOnDemoOrWidget(code, controllerName, doneCallback, failCallback) {
    ajaxEngine.switchOnDemoOrWidget(
      code,
      controllerName,
      (data) => {
        switch (controllerName) {
          case 'buy':
            break;
          case 'demo':
            marketplaceWidgetsParamsHandler.switchOnDemo(code, data.expired);
            break;
          case 'install-widget':
          case 'uninstall-widget':
            marketplaceWidgetsParamsHandler.changeInstalledParam(code);
            break;
          default:
        }
        doneCallback(data);
      },
      failCallback)
    },

  //--------------------------------------------------------------------------
  // МЕТОДЫ ПРОВЕРКИ СВОЙСТВ

  // true если код принадлежит виджету, входящему во Free-Pack
  isAskLicenseAgreement: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].is_no_pivot;
  },

  // true если код принадлежит виджету, входящему во Free-Pack
  isFreePackWidget: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].free_pack;
  },

  // true если виджет ещё ни разу не использовался
  isNotUsed: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].is_no_pivot;
  },

  // true если виджет куплен
  isPurchased: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].is_purchased;
  },

  // true если на виджет оформлена подписка
  isSubscription: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].is_subscription;
  },

  // true если виджет находится в статусе пробного использования
  isTestPeriod: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].is_test_period;
  },

  // true если истек срок подписки или пробного периода
  isTimeExpired: function(widgetCode) {
    let params = widgetSettingsCollection.widgets[widgetCode];
    let expired = params.expired ? params.expired : null;
    if (expired === null) {
      return false
    }
    let expiredDate = new Date (expired);
    return expiredDate.valueOf() < Date.now();
  },

  // true если объект коллекции пустой
  isWidgetSettingsCollectionEmpty: function () {
    return $.isEmptyObject(widgetSettingsCollection);
  },

  // true если виджет включен
  isWidgetSwitchOn: function(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].installed;
  },

  //--------------------------------------------------------------------------
  // ГЕТТЕРЫ СВОЙСТВ

  // возвращает значение пробного периода
  getTrialPeriod() {
    return trial_period
  },

  //возвращает массив кодов виджетов
  getWidgetCodes() {
    return Object.keys(widgetSettingsCollection.widgets);
  },

  // возвращает краткое описание виджета
  getWidgetDescriptionName(widgetCode) {
    let description_name = widgetSettingsCollection.widgets[widgetCode].description_name;
    return description_name ? description_name : 'Widget name'
  },

  // возвращает полное описание виджета
  getWidgetDescriptionText(widgetCode) {
    let description_text = widgetSettingsCollection.widgets[widgetCode].description_text;
    return description_text ? description_text : 'Widget makes good job!'
  },

  // возвращает строку с датой окончания пробного периода
  getWidgetExpired(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].expired
  },

  // возвращает адрес к иконке виджета
  getWidgetImageUrl(widgetCode) {
    let image_url = widgetSettingsCollection.widgets[widgetCode].image_url;
    return image_url ? image_url : alarmCrmPlatform.domain + '/images/logo_main.svg'
  },

  // возвращает цену покупки
  getWidgetPurchasePrice(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].price
  },

  // возвращает верстку презентации видежта в окне настроек
  getWidgetRightSide(widgetCode) {
    let right_side = widgetSettingsCollection.widgets[widgetCode].description_right_side;
    return right_side ? right_side : 'Nothing more to say!'
  },

  // возвращает стоимость подписки
  getWidgetSubscriptionSum(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].subscription_price;
  },

  // возвращает минимальный период подписки
  getWidgetSubscriptionPeriod(widgetCode) {
    return widgetSettingsCollection.widgets[widgetCode].extension_period;
  },

  //--------------------------------------------------------------------------
  // МЕТОДЫ ИЗМЕНЕНИЯ СВОЙСТВ

  // в объекте коллекции настроек меняет значение параметра "Виджет установлен" после нажатия кнопки включения/отключения виджета
  changeInstalledParam: function (widgetCode) {
    widgetSettingsCollection.widgets[widgetCode].installed = !widgetSettingsCollection.widgets[widgetCode].installed;
  },

  // в объекте коллекции настроек меняет значение параметров после включеняи режима демо (чтобы не перезагружаться)
  switchOnDemo: function (widgetCode, expiredDate) {
    widgetSettingsCollection.widgets[widgetCode].is_test_period = true;
    widgetSettingsCollection.widgets[widgetCode].expired = expiredDate;
    widgetSettingsCollection.widgets[widgetCode].is_no_pivot = false
  },
};

export default marketplaceWidgetsParamsHandler;