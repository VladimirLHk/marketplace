// объект для взаимодействия с параметрами Marketplace
let widgetSettingsManager = undefined;
// объект для взаимодействия с меню Marketplace
let marketplaceMenuManager  = undefined;
// объект для взаимодействия с модальным окном виджета
let widgetModalManager  = undefined;
// объект для взаимодействия с коллекцией версток кнопок включения/отключения виджета
let switchButtonManager  = undefined;
// функция для вывода шаблона из коллекции Marketplace
let templateBuilder  = undefined;

let helper = {
  setWidgetModalManager(widgetModalObject) {
    if (widgetModalManager === undefined) {
      widgetModalManager = widgetModalObject
    }
  },

  getWidgetModalManager() {
    if (widgetModalManager !== undefined) {
      return widgetModalManager
    }
  },

  setMarketplaceMenuManager(marketplaceMenuObject) {
    if (marketplaceMenuManager === undefined) {
      marketplaceMenuManager = marketplaceMenuObject
    }
  },

  getMarketplaceMenuManager() {
    if (marketplaceMenuManager !== undefined) {
      return marketplaceMenuManager
    }
  },

  setWidgetSettingsManager(widgetSettingsObject) {
    if (widgetSettingsManager === undefined) {
      widgetSettingsManager = widgetSettingsObject
    }
  },

  getWidgetSettingsManager() {
    if (widgetSettingsManager !== undefined) {
      return widgetSettingsManager
    }
  },

  setSwitchButtonManager(switchButtonObject) {
    if (switchButtonManager === undefined) {
      switchButtonManager = switchButtonObject
    }
  },

  getSwitchButtonManager() {
    if (switchButtonManager !== undefined) {
      return switchButtonManager
    }
  },

  setTemplateBuilder(getTemplateFunction) {
    if (templateBuilder === undefined) {
      templateBuilder = function (templateName, callback) {
        getTemplateFunction(templateName, 'marketplace', callback)
      }
    }
  },

  getTemplateBuilder() {
    if (templateBuilder !== undefined) {
      return templateBuilder
    }
  },

};

export default helper