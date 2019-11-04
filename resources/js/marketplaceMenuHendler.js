import helper from "./helper";

// объект для взаимодействия с параметрами Marketplace
let widgetSettingsManager = undefined;
// объект для взаимодействия с коллекцией версток кнопок включения/отключения виджета
let switchButtonManager  = undefined;
// объект для взаимодействия с коллекцией версток кнопок включения/отключения виджета
let widgetModalManager  = undefined;
// элемент, ПЕРЕД которым будет вставляться меню
let menuHolder = undefined;
// функция для построение верстки из шаблона
let templateBuilder = undefined;
// верстка меню
let marketplaceMenuWrapper = $('<div class="marketplace-wrapper" style="margin-left: 20px"></div>');
let marketplaceMenuTitleBlock = $('<div class="marketplace-title-block"><div class="marketplace-title"><span>AlarmCRM Marketplace</span><hr></div></div>');

// выдает верстку кнопки "установить/настроить" для конкретного виджета в иконке меню
let getSwitchButtonInMenu = function(widgetCode) {
  if (widgetSettingsManager.isFreePackWidget(widgetCode)) {
    return widgetSettingsManager.isWidgetSwitchOn(widgetCode) ?
      switchButtonManager.getButton('set_settings') :
      switchButtonManager.getButton('install')
  }
  return widgetSettingsManager.isNotUsed(widgetCode) ?
    switchButtonManager.getButton('install') :
    switchButtonManager.getButton('set_settings')
};

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

  if (!widgetModalManager) {
    widgetModalManager = helper.getWidgetModalManager()
  }
};

// формирует объект коллекции настроек - распределяет по разделам
let paramsForMenu = function() {
  // let menuCollection = widgetSettingsManager.getWidgetCodes();
  let menu_widgets = {free_pack:[], marketplace: []};
  widgetSettingsManager.getWidgetCodes().map((widgetCode)=>{
    let widgetBlockName = widgetSettingsManager.isFreePackWidget(widgetCode) ? 'free_pack' : 'marketplace';
    menu_widgets[widgetBlockName].push(marketPlaceMenuHandler.paramsForWidget(widgetCode));
  });

  let params = {
    marketplaceBlocks: {}
  };
  function setMarketplaceBlock (blockName) {
    if (menu_widgets[blockName].length) {
      params.marketplaceBlocks[blockName] = {
        title: blockName === 'marketplace' ? 'AlarmCRM Marketplace' : 'AlarmCRM FreePack',
        widgets: menu_widgets[blockName],
      }
    }
  }
  setMarketplaceBlock('free_pack');
  setMarketplaceBlock('marketplace');
  return params;
};

let buildMenu = function() {
  marketplaceMenuWrapper.insertBefore(menuHolder);
  marketplaceMenuTitleBlock.remove();
  marketplaceMenuWrapper.append(marketplaceMenuTitleBlock);
  marketplaceMenuTitleBlock.addClass('loader');

  function buildMenuDoneCallback(data) {
    widgetSettingsManager.setMarketplaceParams(data);
    templateBuilder('marketplace_menu', function (data) {
      marketplaceMenuTitleBlock.remove();
      let html = data.render(paramsForMenu());
      $(html).appendTo(marketplaceMenuWrapper);
      //Инициируем событие "Меню MarketPlace загружено"
      $(document).trigger('MarketplaceWidgetsLoaded');
    });
  };

  function buildMenuFailCallback() {
    marketplaceMenuWrapper.remove();
    return false;
  };

  widgetSettingsManager.updateMarketplaceWidgetSettings(buildMenuDoneCallback, buildMenuFailCallback);
};

let marketPlaceMenuHandler = {

  // формирует для коллекции настроек набор настроек конкретного виджета
  paramsForWidget: function (widgetCode) {
    return {
      wCode: widgetCode,
      // title: widget_item.title ? widget_item.title : 'Widget title',
      image_url: widgetSettingsManager.getWidgetImageUrl(widgetCode),
      description_name: widgetSettingsManager.getWidgetDescriptionName(widgetCode),
      description_text: widgetSettingsManager.getWidgetDescriptionText(widgetCode),
      right_side: widgetSettingsManager.getWidgetRightSide(widgetCode),
      trial_period: widgetSettingsManager.getTrialPeriod(),
      menuButton: getSwitchButtonInMenu(widgetCode),
    };
  },

  showMenu(elementInsertBefore) {
    menuHolder = elementInsertBefore;
    setProviders();
    if (widgetSettingsManager.isWidgetSettingsCollectionEmpty()) {
      buildMenu()
    } else {
      marketplaceMenuWrapper.insertBefore(menuHolder);
    }

  },

  changeSwitchButton(widgetCode) {
    let rootElement = $('div#'+widgetCode).find('.marketplace-widget-card-button[data-code="'+widgetCode+'"]');
    if (rootElement.length === 0) {
      return
    };
    let buttonElement = $(rootElement).find('.marketplace-widget-install');
    let isInstallButton = !!buttonElement.length;
    if (isInstallButton) {
      $(rootElement).empty().append(switchButtonManager.getButton('set_settings'));
    }
  },
};

export default marketPlaceMenuHandler;