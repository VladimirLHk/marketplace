import helper from "./helper";
import technicalHelper from "./technicalHelper";
// объект для взаимодействия с параметрами Marketplace
let widgetSettingsManager = undefined;
// функция для построение верстки из шаблона
let templateBuilder = undefined;
// постоянные параметры для формы ввода контактной информации
let buyFormParams =  {
  form_title: "Заполните данные для выставления счета",
  submit_button_title:"Отправить",
  not_complete_error_message:"Вы заполнили не все поля формы!",
  success_message: "Информация отправлена менеджеру."+"<br/>"+"В ближайшее время Вам выставят счет.",
  contact_fields: {
    last_name: {
      title: "Контактное лицо: ",
      name: "last_name",
      type: "text",
      placeholder: "Введите фамилию и имя",
    },
    phone: {
      title: "Контактный телефон: ",
      name: "phone",
      pattern: "[0-9]{10,}",
      placeholder: "Введите номер телефона",
    },
    email:{
      title: "E-mail: ",
      name: "email",
      type: "email",
      placeholder: "Введите адрес электронной почты",
    },
  },
};

let modalWindowElement;
let billRequestWidgetCode;
let modalOpened = false;

// устанавливает значение переменных доступа к глобальным обхектам
let setProviders = function () {
  if (!widgetSettingsManager) {
    widgetSettingsManager = helper.getWidgetSettingsManager()
  }

  if (!templateBuilder) {
    templateBuilder = helper.getTemplateBuilder()
  }
};

// проверяет корректность данных формы
let validateFormData = function(data) {
  let checkOK = true;
  data.forEach((item)=>{
    if (!item.value) {
      checkOK = false
    }
  });
  return checkOK
};

// выводит инфорамцию об ошибке
let showErrorMessage = function(errorMessage) {
  let infoBlock = $('.marketplace-widget-buy-form__info');
  infoBlock.empty();
  infoBlock.addClass('marketplace-widget-buy-form__info--error');
  infoBlock.append(errorMessage);
  setTimeout(() => {
    infoBlock.empty();
    infoBlock.removeClass('marketplace-widget-buy-form__info--error');
  }, 2500);
};

// дополняет объект параметров для отрисовки шаблона
let getParams = function() {
  buyFormParams.contact_fields.last_name.value = AMOCRM.constant('user').name;
  buyFormParams.contact_fields.phone.value = AMOCRM.constant('user').personal_mobile ? AMOCRM.constant('user').personal_mobile : '';
  buyFormParams.contact_fields.email.value = AMOCRM.constant('user').login;
  buyFormParams.wCode = billRequestWidgetCode;
  return buyFormParams
};

let billRequestModalHandler = {
  show(widgetCode) {
    if (modalOpened) {
      return
    }
    modalOpened = true;
    setProviders();
    billRequestWidgetCode = widgetCode;
    technicalHelper.blindItem($('div.widget-settings'), $('.widget-settings__blocked-descripion'));

    templateBuilder('marketplace_buy_form', function(data) {
      modalWindowElement = $(data.render(getParams()));
      modalWindowElement.appendTo('body');
    });
  },

  destroyWindow: function() {
    if (!modalOpened) {
      return
    }
    modalOpened = false;
    $('.widget-settings__blocked-descripion').addClass('hidden');
    modalWindowElement.remove();
  },

  sendBillRequest() {
    let button = $(this);
    let form = $('.marketplace-widget-buy-form__body-person');
    let data = form.serializeArray();
    if (!validateFormData(data)) {
      showErrorMessage('Надо заполнить все поля');
      return
    }
    button.addClass('loader');
    let code = form.attr('code');

    data = technicalHelper.parseFormData(data);

    function doneCallback() {
      $('.marketplace-widget-buy-form.modal-body.modal-body-relative').css("top","100px");
      $('.marketplace-widget-buy-form__body').remove();
      $('.marketplace-widget-buy-form__info--success').removeClass('hidden');
    };

    function failCallback() {
      button.removeClass('loader');
      showErrorMessage('Произошла ошбика. Попробуйте позже.');
    };

    widgetSettingsManager.sendBillRequest(code, data, doneCallback, failCallback);
  },
};

export default billRequestModalHandler