$(document).ready(function() {
  const NAME_ERROR_FIELD_TEXT = 'Введите имя';
  const PHONE_ERROR_FIELD_TEXT = 'Введите номер телефона';
  const EMAIL_ERROR_FIELD_TEXT = 'Введите e-mail';
  const AMOUNT_ERROR_FIELD_TEXT = 'Выберите сумму пожертвования';

  const NAME_ERROR_FIELD = $('.js-name-error');
  const PHONE_ERROR_FIELD = $('.js-phone-error');
  const EMAIL_ERROR_FIELD = $('.js-email-error');
  const AMOUNT_ERROR_FIELD = $('.js-amount-error');

  let fieldName = $('.js-name-field');
  let fieldPhone = $('.js-phone-field');
  let fieldEmail = $('.js-email-field');
  let fieldComment = $('.js-comment-field');

  let donationFrequency = $('.js-donation-frequency');
  let donationAmount = $('.js-donation-amount');
  let donationCustomAmount = $('.js-donation-amount-custom');
  let donationFormBtn = $('.js-donation-form-btn');
  let donationInfoLabel = $('.js-info-label');

  let isRecurring = false;
  let requiredFieldsFilled = false;
  let donationAmountChosen = true;

  fieldPhone.inputmask({
    mask: '+79999999999',
    placeholder: '',
    showMaskOnHover: false,
    showMaskOnFocus: true,
  });

  const declOfNum = function(n, text_forms) {
    n = Math.abs(n) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) {
      return text_forms[2];
    }
    if (n1 > 1 && n1 < 5) {
      return text_forms[1];
    }
    if (n1 == 1) {
      return text_forms[0];
    }
    return text_forms[2];
  }

  const getDonationDateDifference = function(time) {
    let daysText, hoursText, minutesText, secondsText;
    let formattedTime = time.replace(/\s/, 'T');
    let donationDate = new Date(`${formattedTime}+0300`);
    let currentDate = new Date();
    let differenceMiliseconds = (currentDate - donationDate);

    let days = Math.floor(differenceMiliseconds / 86400000);
    let hours = Math.floor((differenceMiliseconds % 86400000) / 3600000);
    let minutes = Math.round(((differenceMiliseconds % 86400000) % 3600000) / 60000);

    if (days > 0) {
      daysText = `${days} ${declOfNum(days, ['день', 'дня', 'дней'])}`;
    } else {
      daysText = '';
    }

    if (hours > 0) {
      hoursText = `${hours} ${declOfNum(hours, ['час', 'часа', 'часов'])}`;
    } else {
      hoursText = '';
    }

    minutesText = `${minutes} ${declOfNum(minutes, ['минуту', 'минуты', 'минут'])}`;
    
    return `${daysText} ${hoursText} ${minutesText} назад`;
  }

  const checkFrequency = function() {
    if ($(this).attr('data-frequency') == 'monthly') {
      donationFrequency.removeClass('selected');
      $(this).addClass('selected')
      isRecurring = true;
    } else if ($(this).attr('data-frequency') == 'once') {
      donationFrequency.removeClass('selected');
      $(this).addClass('selected')
      isRecurring = false;
    }
  }


  const checkAmount = function() {
    donationAmount.removeClass('selected');
    $(this).addClass('selected');

    if ($(this).hasClass('js-donation-amount-custom') && $(this).val() == '') {
      $(this).removeClass('selected');
    }
    
    if ($(this).attr('data-amount') == '169') {
    donationInfoLabel.text('169р помощь Кузнечиками по цене подписки Spotify');
    } else if ($(this).attr('data-amount') == '500') {
         donationInfoLabel.text('Час работы тренера');
    } else if ($(this).attr('data-amount') == '1500') {
      donationInfoLabel.text('Час аренды спортивного зала');
    }
  }

  const focusAmountInput = function() {
    if ($(this).val() == '') {
      $(this).removeClass('selected');
    } else {
      $(this).addClass('selected');
    }
  }


  const fieldErrorsCheck = function(field, errorField, errorText, type) {
    const EMAIL_VAILDATOR = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (type == 'email' && !EMAIL_VAILDATOR.test(String(field.val()).toLowerCase())) {
      errorField.text(errorText);
      errorField.show();

      return false;
    } else {
      if (field.val() == '') {
        errorField.text(errorText);
        errorField.show();
        return false;
      } else {
        return true;
      }
    }

    setTimeout(function() {
      errorField.hide();
    }, 2000);
  }

  const donationAmountCheck = function() {
    if ($('.js-donation-amount.selected').length == 0 || $('.js-donation-amount.selected').length == undefined) {
      AMOUNT_ERROR_FIELD.show();
      AMOUNT_ERROR_FIELD.text(AMOUNT_ERROR_FIELD_TEXT);
      donationAmountChosen = false;
    } else if ($('.js-donation-amount.selected').length == 1) {
      donationAmountChosen = true;
    }

    setTimeout(function() {
      AMOUNT_ERROR_FIELD.hide();
    }, 2000);
  }

  const pasteDataFromSheet = function(data) {
    let donationList = $('.js-donation-list');

    for (let i = 0; i < data.length; i++) {
      let donationItem = `<li class="donation__item">
      <div class="donation__item-header">
        <p class="donation__item-name">${data[i].Имя}</p>
        <p class="donation__item-amount">${data[i].Total_amount}₽</p>
      </div>
      <div class="donation__item-line"></div>
      <p class="donation__item-time">
        ${getDonationDateDifference(data[i].sent)}
      </p>
    </li>`;
      donationList.prepend(donationItem);

      // if (i > 3) {
      //   break;
      // }
    }
  }

  const getDataFromSheet = function() {
    let url = 'https://script.google.com/macros/s/AKfycbzu5377jWfey9y6YEuveiWeDh1BghzM4WOU7rCLRW-ZQVDvND-QSBkjLezve4VB6TrV/exec';
    jQuery.ajax({
      crossDomain: true,
      url: url,
      method: 'GET',
      dataType: 'jsonp',
      success: function(data) {
        console.log(data)
        pasteDataFromSheet(data.records);
      },
    });
  }

  const sendDataToCart = function() {
    let cartInputName = $('.t706 input[name="Имя"]');
    let cartInputPhone = $('.t706 input[name="Телефон"]');
    let cartInputEmail = $('.t706 input[name="Почта"]');
    let cartInputComment = $('.t706 input[name="Комментарий"]');
    let cartPaymentType = $('.t706 input[name="Тип_оплаты"]');
    let cartDonationAmount;

    if ($('.js-donation-amount.selected').attr('data-amount') == 'custom') {
      cartDonationAmount = $('.js-donation-amount.selected').val();
    } else {
      cartDonationAmount = $('.js-donation-amount.selected').attr('data-amount');
    }
    
    if (isRecurring) {
        $('.t706 .cloud-recurrent').parent().click();
        cartPaymentType.val('Рекуррентный платёж CloudPayments');
    } else {
        $('.t706 .cloud-one-time').parent().click();
        cartPaymentType.val('Разовый платёж CloudPayments');
    }

    let donationProduct = {
      name: 'Пожертвование',
      amount: cartDonationAmount,
      price: cartDonationAmount
    };

    localStorage.removeItem('tcart');
    tcart__init();

    cartInputName.val(fieldName.val());
    cartInputPhone.val(fieldPhone.val());
    cartInputEmail.val(fieldEmail.val());
    cartInputComment.val(fieldComment.val());

    tcart__addProduct(donationProduct);

    $('.t706 button[type="submit"]').trigger('click');
  }


  // Get data from Google Sheets
  getDataFromSheet();


  // Events
  donationFrequency.each(function() {
    $(this).on('click', checkFrequency);
  });

  donationAmount.each(function() {
    $(this).on('click', checkAmount);
  });
  donationCustomAmount.on('input', focusAmountInput);


  donationFormBtn.on('click', function() {
    fieldErrorsCheck(fieldName, NAME_ERROR_FIELD, NAME_ERROR_FIELD_TEXT);
    fieldErrorsCheck(fieldPhone, PHONE_ERROR_FIELD, PHONE_ERROR_FIELD_TEXT);
    fieldErrorsCheck(fieldEmail, EMAIL_ERROR_FIELD, EMAIL_ERROR_FIELD_TEXT, 'email');
    donationAmountCheck();


    if (fieldErrorsCheck(fieldName, NAME_ERROR_FIELD, NAME_ERROR_FIELD_TEXT) && fieldErrorsCheck(fieldPhone, PHONE_ERROR_FIELD, PHONE_ERROR_FIELD_TEXT) && fieldErrorsCheck(fieldEmail, EMAIL_ERROR_FIELD, EMAIL_ERROR_FIELD_TEXT, 'email')) {
      requiredFieldsFilled = true;
    }

    if (requiredFieldsFilled) {
      if (donationAmountChosen) {
        sendDataToCart();
      }
    }
  })
});
this.pay = function () {
var widget = new cp.CloudPayments();
  widget.pay('auth', // или 'charge'
      { //options
          publicId: 'pk_e8e765af966f938a24d85a856d619', //id из личного кабинета
          description: 'Оплата товаров в example.com', //назначение
          amount: 100, //сумма
          currency: 'RUB', //валюта
          accountId: 'user@example.com', //идентификатор плательщика (необязательно)
          invoiceId: '1234567', //номер заказа  (необязательно)
          email: 'user@example.com', //email плательщика (необязательно)
          skin: "mini", //дизайн виджета (необязательно)
          data: {
              myProp: 'myProp value'
          }
      },
      {
          onSuccess: function (options) { // success
              //действие при успешной оплате
          },
          onFail: function (reason, options) { // fail
              //действие при неуспешной оплате
          },
          onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
              //например вызов вашей аналитики Facebook Pixel
          }
      }
  )
};
$('.js-donation-form-btn').click(pay);