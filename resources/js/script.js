import helper from "./helper";
import marketplaceWidgetsParamsHandler from "./marketplaceWidgetsParamsHendler";
import switchButtonHandler from "./switchButtonHendler";
import marketplaceMenuHandler from "./marketplaceMenuHendler";
import widgetSettingsModalHandler from "./widgetSettingsModalHendler";
import billRequestModalHandler from "./billRequestModalHandler";

let MarketplaceWidget = function() {
  let widget = this;
  this.AlarmCRMDomain = window.alarmCrmPlatform.domain;
  this.code = null;
  let recommended_wraper; //узел, перед которым будет вставляться раздел
  new CustomEvent('MarketplaceWidgetsLoaded');
  new CustomEvent('closeAllModalWindows');

  this.bind_actions = function() {
    //вывод всплывающего окна настроек виджета
    $(document).on('click', '.marketplace-widget-card__wrapper', function(e){
      widgetSettingsModalHandler.showWindow($(this).attr('code'),  $(this));
    });

    //закрытие всплывающего окна настроек виджета при потере фокуса (click в пределах рабочей области, но не левого меню)
    $(document).on('mouseup', '.marketplace-widget-full-description-wrapper', widgetSettingsModalHandler.closeWindow);

    //сохранение настроек виджета
    $(document).on('click', '.marketplace-widget-save', widgetSettingsModalHandler.saveSettings);

    //нажатие кнопок в левом блоке модального окна настроек виджета
    $(document).on(
      'click',
      '.marketplace-widget-full-description-wrapper  .marketplace-widget-card-button',
      widgetSettingsModalHandler.operateLeftButtonsPress);

    //отправка данных для выставления счета
    $(document).on('click', '.marketplace-widget-buy-form__submit-button-wrapper', billRequestModalHandler.sendBillRequest);

    //закрытие по "крестику" окна с формой запроса счета
    $(document).on('click', '.marketplace-widget-buy-form__close', function () {
      billRequestModalHandler.destroyWindow();
    });

    //закрытие всплывающих окон при потере фокуса (click в пределах левого меню)
    $(document).on('mouseup', '#left_menu', function() {
      $(document).trigger('closeAllModalWindows');
    });

    //автоматическое / принудительное закрытие всплывающих окон
    $(document).on('closeAllModalWindows', function() {
      widgetSettingsModalHandler.destroyModalWindow();
      billRequestModalHandler.destroyWindow();
    });
  };

  this.render = function() {
    widget.system = AMOCRM.widgets.system;
    if (AMOCRM.data.current_entity === "widgetsSettings") {
      //ищем блок "Рекомендованные виджеты" и вставляем перед ним свой блок
      recommended_wraper = $('.widget-box__header');
      if (recommended_wraper === 0) {
        return
      }
      marketplaceMenuHandler.showMenu(recommended_wraper);
    }
  };

  this.init = function() {
  };

  this.boot = function() {
    $('head').append($('<link rel="stylesheet" href="' + widget.AlarmCRMDomain + '/alarmcrm-platform/loader/' + widget.code + '/styles.css?v=1.0.4" type="text/css" media="screen" />'));
    try {
      widget.settings = alarmCrmPlatform.widgetsValues[widget.code].settings;
      if (widget.settings === null) {
        widget.settings = {};
      }
    } catch (e) {}
    try {
      widget.getTemplate = alarmCrmPlatform.widgets.widgets_helper.getTemplate;
    } catch (e) {
      console.log(e)
      widget.getTemplate = function (template, widgetCode, callback) {
        let data = {render: (data) => {return '';}}
        if (typeof callback === 'function') {
          callback(data);
          return true;
        }
      }
    }
    helper.setMarketplaceMenuManager(marketplaceMenuHandler);
    helper.setWidgetModalManager(widgetSettingsModalHandler);
    helper.setWidgetSettingsManager(marketplaceWidgetsParamsHandler);
    helper.setSwitchButtonManager(switchButtonHandler);
    helper.setTemplateBuilder(widget.getTemplate);
    switchButtonHandler.setSwitchButtonCollection();
  };

  this.bootstrap = function(code) {
    widget.code = code;
    console.log(code + ' loaded');
    // если frontend_status не задан, то считаем что виджет выключен
    let status = false;
    try {
      status = alarmCrmPlatform.widgetsStatuses[code] === 1;
    } catch (e) {}

    if (status) {
      widget.boot();
      widget.render();
      widget.init();
      widget.bind_actions();
      $(document).on('widgets:load', function () {
        widget.render();
      });
    }
  }
};
if (window.alarmCrmPlatform === undefined) {
  window.alarmCrmPlatform = {
    widgets: []
  };
}
window.alarmCrmPlatform.widgets['marketplace'] = new MarketplaceWidget();
window.alarmCrmPlatform.widgets['marketplace'].bootstrap('marketplace');
