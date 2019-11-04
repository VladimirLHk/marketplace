// описание кодов этапов "жизненого" цикла подписки на виджеты, не входящие во Free-Pack;
// описания даны в порядке нумерации кодов; могут не отражать порядок следования этапов!!!
import helper from "./helper";
import technicalHelper from "./technicalHelper";
import billRequestModalHandler from "./billRequestModalHandler";

const COMMERCIAL_MODE_DESCRIPTIONS = [
  'before start',
  'trial period',
  'after trial period; not purchase',
  'subscription ok',
  'subscription expired',
  'widget purchased'
];
// перечень этапов цикла подписки, на которых в настройках должен показываться блок кнопок покупки и демо
const PURCHASE_SECTION_MODE = [0, 1, 2, 4];
// перечень этапов цикла подписки, на которых в модальном окне настройки дложны отражаться, н обыть блокированы
const SETTINGS_DECORATION_MODE = [2, 4];
// объект для взаимодействия с параметрами Marketplace
let widgetSettingsManager = undefined;
// объект для взаимодействия с коллекцией версток кнопок включения/отключения виджета
let switchButtonManager  = undefined;
// объект для взаимодействия с меню
let marketplaceMenuManager  = undefined;
// функция для построение верстки из шаблона
let templateBuilder = undefined;

let formatter = new Intl.NumberFormat("ru");

let widgetCode = undefined;
let modalOpened = false;
let disabledCard;
let savingWidget = false;

// устанавливает значение переменных доступа к глобальным обхектам
let setProviders = function () {
  if (!widgetSettingsManager) {
    widgetSettingsManager = helper.getWidgetSettingsManager()
  }

  if (!templateBuilder) {
    templateBuilder = helper.getTemplateBuilder()
  }

  if (!switchButtonManager) {
    switchButtonManager = helper.getSwitchButtonManager()
  }

  if (!marketplaceMenuManager) {
    marketplaceMenuManager = helper.getMarketplaceMenuManager()
  }
};

//определяет на каком этапе коммерческого жизненного цикла находится виджет
let getWidgetCommercialMode = function() {
  let is_no_start = widgetSettingsManager.isNotUsed(widgetCode);
  let is_test_period = widgetSettingsManager.isTestPeriod(widgetCode);
  let is_expired = widgetSettingsManager.isTimeExpired(widgetCode);
  let is_purchased = widgetSettingsManager.isPurchased(widgetCode);

  if (is_no_start) {
    return 0
  }
  if (is_purchased) {
    return 5
  }
  if (is_test_period) {
    return  is_expired ? 2 : 1
  }
  return  is_expired ? 4 : 3
};

// формирует строку о цене покупки виджета
let getPurchaseText = function() {
  let price = widgetSettingsManager.getWidgetPurchasePrice(widgetCode);
  if (price && price > 0) {
    return "Купить за <span class ='widget_settings_block__purchase-price-text'>"+formatter.format(price)+"</span> руб."
  }
  return ""
};

// формирует строку о цене подписки виджета
let getSubscriptionText = function() {
  let sum = widgetSettingsManager.getWidgetSubscriptionSum(widgetCode);
  let period = widgetSettingsManager.getWidgetSubscriptionPeriod(widgetCode);

  if (sum && sum > 0 && period && period > 0) {
    return "Подписка <span class ='widget_settings_block__purchase-price-text'>"+formatter.format(sum)+"</span> руб./"+period+" мес."
  }
  return ""
};

// формирует строку в блок покупки виджета
let getPriceText = function() {
  return widgetSettingsManager.isSubscription(widgetCode) ?
    getSubscriptionText(widgetCode) :
    getPurchaseText(widgetCode)
};

// выдает верстку кнопки "включеить/отключить" для конкретного виджета в модальном окне (если не должно быть => пустая строка)
let getSwitchButtonInModal = function() {
  switch (getWidgetCommercialMode(widgetCode)) {
    case 1:
    case 3:
    case 5: if (widgetSettingsManager.isWidgetSwitchOn(widgetCode)) {
      return switchButtonManager.getButton('switch_off');
    } else {
      return switchButtonManager.getButton('switch_on');
    }
    default: return ""
  }
};

// true если виджет находится в состоянии, когда пользователю в настройках надо показывать кнопки покупки и/или демо
let isNeedPurchaseSection = function() {
  let mode = getWidgetCommercialMode(widgetCode);
  return PURCHASE_SECTION_MODE.indexOf(mode) !== -1
};

// true если виджет находится в состоянии, когда пользователю в настройках надо показывать кнопку демо
let isNeedDemoButton = function() {
  return getWidgetCommercialMode(widgetCode) === 0
};

// true если виджет находится в состоянии, когда блок настроек должен быть виден, но заблокирован
let isDecorateSettingsBlock = function() {
  let mode = getWidgetCommercialMode(widgetCode);
  return SETTINGS_DECORATION_MODE.indexOf(mode) !== -1
};

// true если в блоке покупки / демо нужен запрос на согласие с пользовательсикм соглашением
let isLicenseAgreementBlock = function() {
  return getWidgetCommercialMode(widgetCode) === 0 || widgetSettingsManager.isAskLicenseAgreement(widgetCode)
};

// устанавливает фиксирвоанную ширину для правой части модального окна настроек;
// сделано, чтобы весртка настроек не растягивалась за пределы модального окна
let setWidgetSettingsOptionsWidth = function() {
  let rightSideTextWidth =
    parseInt($('.widget-settings').css('width')) -
    parseInt($('.widget-settings__base-space').css('width')) -
    parseInt($('.widget-settings__wrap-desc-space').css('padding-left')) -
    parseInt($('.widget-settings__wrap-desc-space').css('padding-right'));
  $('.widget-settings__options').css('width', rightSideTextWidth);
};

// отолбражает ситуацию, когда не выбран чек-бокс согласия с пользовательским соглашением
let noLicenseCheckBoxPressed = function(buttonName) {
  let infoBlockClassName = buttonName === 'buy' ? '.widget-settings_block__purchase-buy-message' : '.widget-settings_block__purchase-demo-message';
  let infoBlock = $(infoBlockClassName);
  infoBlock.text('Примите Соглашение');
  let licenseLable = $('.marketplace-widget-full-description-wrapper label.widget_settings_block__license-agreement');
  licenseLable.addClass('red_border');
  setTimeout(() => {
    infoBlock.empty().append('');
    licenseLable.removeClass('red_border');
  }, 2500);
};

// проверят, выполнены ли условия для обработки нажатия клавиш в левой части модального окна
let isButtonConditionOK = function(buttonName) {
  switch (buttonName) {
    case 'demo':
    case 'buy': let licenseAgreementCheckBox = $('#licenseAgreement');
      if (licenseAgreementCheckBox.length !== 0 && !licenseAgreementCheckBox.prop('checked')) {
        noLicenseCheckBoxPressed(buttonName);
        return false
      }
    default: return true
  }
};

// запускает loader около выбранной кнопки
let loaderSwitchOn = function (buttonName) {
  switch (buttonName) {
    case 'buy': $('.widget_settings_block__purchase-buy-subsection-wrap').addClass('loader'); break;
    case 'demo': $('.widget_settings_block__purchase-demo-subsection-wrap').addClass('loader'); break;
    case 'install-widget':
    case 'uninstall-widget': $('.marketplace-widget-card-button[data-code="'+widgetCode+'"]')
      .find('.marketplace-widget__switch-button-wrapper').addClass('loader');
      break;
    default: return true
  }
};

// убирвает запущенный около кнопок loader
let loaderSwitchOff = function (buttonName) {
  switch (buttonName) {
    case 'install-widget':
    case 'uninstall-widget':
      $('.marketplace-widget__switch-button-wrapper').removeClass('loader');
      break;
    default: $('.widget_settings_block__top-margin').removeClass('loader');
  }
};

// заменяет кнопку включения/отключения виджета на новую после её нажатия
let changeSwitchButton = function (switchButton) {
  let rootElement = $(switchButton).parent();
  let isInstallButton = !!$(switchButton).find('.marketplace-widget-install').length;
  let newButtonName = isInstallButton ? 'switch_off' : 'switch_on';
  $(rootElement).empty().append(switchButtonManager.getButton(newButtonName));
};

//callback на неудачное завершение запроса после нажатия кнопки
let ajaxFail = function(buttonName) {
  loaderSwitchOff(buttonName);
  let infoBlock = undefined;
  switch (buttonName) {
    case 'buy':
      infoBlock = $('.marketplace-widget-full-description-wrapper .widget-settings_block__purchase-buy-message');
      break;
    case 'demo':
      infoBlock = $('.marketplace-widget-full-description-wrapper .widget-settings_block__purchase-demo-message');
      break;
    case 'install-widget':
    case 'uninstall-widget':
      infoBlock = $('.marketplace-widget-full-description-wrapper .widget-settings__switch-button-message');
      break;
    default:
  }
  if (infoBlock) {
    infoBlock.text('Ошибка :( Повторите позже');
    setTimeout(() => {
      infoBlock.empty().append('');
    }, 2500);
  }
};

//callback на удачное завершение запроса после нажатия кнопки
let ajaxDone = function(buttonName, data) {
  switch (buttonName) {
    case 'buy': break;
    case 'demo':
      switchOnWidgetSettings();
      $('.widget_settings_block__purchase-demo-subsection-wrap').remove();
      $('.widget-settings_block__purchase-demo-message').remove();
      $('.widget_settings_block__license-agreement').remove();
      $('.marketplace-widget-full-description-wrapper .marketplace-widget-card-button')
        .append(
          '<div class="widget_settings_block__top-margin">'+
          switchButtonManager.getButton('switch_off')+
          '</div>');
      $('#widget-settings__base-space__top-block')
        .after()
        .append(
          '<p class="widget_settings_block__top-margin">'+
          getExpiredInfo()+
          '</p>');
      marketplaceMenuManager.changeSwitchButton(widgetCode);
      break;
    case 'install-widget':
    case 'uninstall-widget':
      marketplaceMenuManager.changeSwitchButton(widgetCode);
      changeSwitchButton($('.marketplace-widget-full-description-wrapper .marketplace-widget__switch-button-wrapper'));
      break;
    default:
  }
  loaderSwitchOff(buttonName);
};

// отрисовывает насторйки виджета (если они есть) в модальном окне
let switchOnWidgetSettings = function() {
  if(alarmCrmPlatform.widgets[widgetCode] && alarmCrmPlatform.widgets[widgetCode].renderSettings && typeof alarmCrmPlatform.widgets[widgetCode].renderSettings === 'function') {
    alarmCrmPlatform.widgets[widgetCode].renderSettings((settings) => {
      $('.widget-settings__form').removeClass('hidden');
      let pointForAppend = $('.widget-settings__options');
      if (!pointForAppend.children().length) {
        setWidgetSettingsOptionsWidth();
        pointForAppend.append(settings);
        decorateSettingsBlock(widgetCode);
      }
    });
  }
};

// добавляет в верстку модального окна элемент, блокирующий доступ к настрокам виджета
let decorateSettingsBlock = function() {
  if (widgetSettingsManager.isFreePackWidget(widgetCode) || !isDecorateSettingsBlock(widgetCode)) {
    return false
  }
  technicalHelper.blindItem( $('form.widget-settings__form'), $('.widget-settings__blocked-settings'));
};

// формирует инфорамционую строку о дате окончания периода подписки или пробного периода
let getExpiredInfo = function() {
  let mode = getWidgetCommercialMode();
  let expired = widgetSettingsManager.getWidgetExpired(widgetCode);
  if (expired !== null) {
    let [year, month, day] = expired.split('-');
    var formattedDate = day+"."+month+"."+year;
  }
  switch (mode) {
    case 1: return "Окончание пробного периода " + formattedDate;
    case 2: return "Пробный период истек " + formattedDate + ". <br/> Приобретите виджет.";
    case 3: return "Окончание подписки " + formattedDate;
    case 4: return "Период подписки истек " + formattedDate + ". <br/> Продлите подписку";
    default: return ""
  }
};

// формирует для коллекции настроек набор настроек конкретного виджета
let paramsForModal= function() {
  let params = marketplaceMenuManager.paramsForWidget(widgetCode);

  if (widgetSettingsManager.isFreePackWidget(widgetCode)) {
    params.modalButton = widgetSettingsManager.isWidgetSwitchOn(widgetCode) ?
      switchButtonManager.getButton('switch_off') : switchButtonManager.getButton('install');
    return params;
  }

  params.purchase = isNeedPurchaseSection(widgetCode);
  if (params.purchase) {
    params.price_text = getPriceText(widgetCode);
    params.demo = isNeedDemoButton(widgetCode);
    params.ask_license_agreement = isLicenseAgreementBlock(widgetCode);
  }
  params.expired_info = getExpiredInfo();
  params.modalButton = getSwitchButtonInModal(widgetCode);
  return params
};

// true если в модальном окне настроек не нужно ВООБЩЕ показывать настройки виджета
let isNotShowWidgetSettingsBlock = function() {
  if (widgetSettingsManager.isFreePackWidget(widgetCode)) {
    return false
  }
  return getWidgetCommercialMode(widgetCode) === 0
};


let widgetSettingsModalHandler = {
  showWindow(code, disabledCardElement) {
    widgetCode = code;
    setProviders();
    if (!modalOpened) {
      modalOpened = true;
      disabledCard = disabledCardElement;
      $(disabledCard).css('opacity', '0.5');
      templateBuilder('widget_full_description', function(data) {
        let html = data.render(paramsForModal());
        $(html).appendTo('body');
        if (isNotShowWidgetSettingsBlock()) {
          return
        }
        switchOnWidgetSettings();
      });
    }
  },

  destroyModalWindow() {
    if (!modalOpened) {
      return
    }
    modalOpened = false;
    disabledCard.css('opacity', '1');
    $('.marketplace-widget-full-description-wrapper').remove();
  },

  closeWindow(e) {
    //если нажали на кнопку закрытия окна
    if ($(e.target).hasClass('icon-modal-close') || $(e.target).hasClass('modal-body__close')) {
      widgetSettingsModalHandler.destroyModalWindow();
      return
    }
    let popupWindow = $('.widget-settings');
    if (popupWindow.length === 0 || e.which !== 1) {
      return
    }

    if (!popupWindow.is(e.target) && popupWindow.has(e.target).length === 0) {
      widgetSettingsModalHandler.destroyModalWindow();
    }
  },

  operateLeftButtonsPress(e) {
    // нужно ли реагировать на нажатие этого элемента?
    let buttonPressedName = switchButtonManager.whatButtonPressed(e.target);
    if (!buttonPressedName) {
      return
    }
    // выполнены ли условия для того, чтобы обрабатывать нажатие кнопки
    if (!isButtonConditionOK(buttonPressedName)) {
      return
    }
    let current_widget_code = $(this).attr('data-code');
    if (buttonPressedName === 'buy') {
      billRequestModalHandler.show(current_widget_code);
      return
    };

    loaderSwitchOn(buttonPressedName);
    widgetSettingsManager.switchOnDemoOrWidget(
      widgetCode,
      buttonPressedName,
      (data)=>{
        ajaxDone(buttonPressedName, data)},
      () => {
        ajaxFail(buttonPressedName);
        return false;
      });

  },

  saveSettings() {
    if(savingWidget) {
      return
    }
    savingWidget = true;
    let button = $('.marketplace-widget-save');
    button.addClass('button-input-disabled loader');
    let form = $('.widget-settings__form');
    let data = form.serializeArray();
    let code = form.attr('code');
    if (widgetSettingsManager.isTimeExpired(code)) {
      return
    }

    data = technicalHelper.parseFormData(data);

    let infoBlock = $('.widget-settings__response-info');

    function showResult(messageClass, messageText) {
      button.removeClass('button-input-disabled loader');
      infoBlock.empty();
      infoBlock.addClass(messageClass);
      infoBlock.append(messageText);
      setTimeout(() => {
        infoBlock.empty();
        infoBlock.removeClass(messageClass);
      }, 2500);
    };

    function doneCallback() {
      // window.alarmCrmPlatform.widgets[widgetCode].settings = data;
      // window.alarmCrmPlatform.widgetsValues[widgetCode].settings = data;
      showResult('widget-settings__response-info--success', 'Настройки успешно сохранены');
    };

    function failCallback() {
      showResult('widget-settings__response-info--error', 'При сохранении произошла ошибка');
      savingWidget = false;
    };

    widgetSettingsManager.saveWidgetSettings(code, JSON.stringify(data), doneCallback, failCallback);
  },

};

export default widgetSettingsModalHandler;