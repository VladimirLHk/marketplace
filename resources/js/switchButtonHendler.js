import helper from "./helper";
// коллекция версток кнопок включения/отключения видежта
let button_constants = [];
// функция для построение верстки из шаблона
let templateBuilder = undefined;

let setTemplateBuilder = function() {
  if (!templateBuilder) {
    templateBuilder = helper.getTemplateBuilder()
  }
};

// формирует массив версток кнопок установки/включения и отключения виджета
let setButton = function(button_name, html) {
  if (!button_constants[button_name]) {
    button_constants[button_name] = html;
  }
};

let switchButtonHandler = {

  // формирование HTML-разметки кнопок "Установить", "Включить", "Настроить" и "Отключить".
  setSwitchButtonCollection() {
    setTemplateBuilder();
    templateBuilder('marketplace_widget_button', function(data) {
      setButton('install', data.render({
        switch_on: true,
        plus: true,
        button_name: 'Установить'
      }));
      setButton('switch_on', data.render({
        switch_on: true,
        plus: false,
        button_name: 'Включить'
      }));
      setButton('set_settings', data.render({
        switch_on: false,
        plus: false,
        button_name: 'Настроить'
      }));
      setButton('switch_off', data.render({
        switch_on: false,
        plus: false,
        button_name: 'Отключить'
      }));
    })
  },

  // выдает верстку конкретной кнопки из коллекции версток кнопок включения/отключения виджета
  getButton: function(buttonName) {
    return  button_constants[buttonName] ? button_constants[buttonName] : "";
  },

  // по специфическому классу определяет последнее завено в пути к контроллеру, который обрабатывает нажатие этой кнопки
  whatButtonPressed: function(targetElement) {
    if (!!$(targetElement).closest('.marketplace-widget-install').length) {
      return ('install-widget')
    }
    if (!!$(targetElement).closest('.marketplace-widget-uninstall').length) {
      return ('uninstall-widget')
    }
    if (!!$(targetElement).closest('.marketplace-widget-buy').length) {
      return ('buy')
    }
    if (!!$(targetElement).closest('.marketplace-widget-demo').length) {
      return ('demo')
    }
    return false
  },
};

export default switchButtonHandler;