import {submit} from 'email-utils/utils.js';

(function(){
  if (!window.addEventListener || !document.documentElement.setAttribute || !document.querySelector || !document.documentElement.classList || !window.localStorage) {
    return
  }

  var options, isPreview, optionsString, colorStyle, htmlStyle, el, lastElHeight, show, hide, setHTMLStyle, setOptions, update, updateColors, updateCopy;

  options = INSTALL_OPTIONS;
  isPreview = INSTALL_ID == 'preview';

  optionsString = JSON.stringify(options);
  if (!isPreview && localStorage.topShelfShownWithOptions === optionsString) {
    return;
  }

  setOptions = function(opts) {
    options = opts;

    update();
  };

  update = function() {
    document.documentElement.setAttribute('eager-top-shelf-goal', options.goal);

    updateColors();
    updateCopy();

    setHTMLStyle();
  };

  updateColors = function() {
    colorStyle.innerHTML = '' +
      '.eager-top-shelf {' +
        'background: ' + options.color + ' !important' +
      '}' +
      '.eager-top-shelf .eager-top-shelf-button {' +
        'color: ' + options.color + ' !important' +
      '}' +
    '';
  };

  updateCopy = function() {
    var textEl, buttonEl, linkEl;

    el.innerHTML = '' +
      '<div class="eager-top-shelf-close-button"></div>' +
      '<div class="eager-top-shelf-content">' +
        '<div class="eager-top-shelf-text"></div>' +
        (options.goal === 'announcement' ? '' :
        '<' + (options.goal === 'signup' ? 'form' : 'div') + ' class="eager-top-shelf-form">' +
          (options.goal !== 'signup' ? '' :
          '<input name="email" class="eager-top-shelf-input" type="email" placeholder="'+ options.signupInputPlaceholder + '" spellcheck="false" required>') +
          (options.goal === 'cta' ?
          '<a target="_blank" class="eager-top-shelf-link">' : '') +
            '<button ' + (options.goal === 'signup' ? 'type="submit" ' : '') + 'class="eager-top-shelf-button"></button>' +
          (options.goal === 'cta' ?
          '</a>' : '') +
        '</' + (options.goal === 'signup' ? 'form' : 'div') + '>') +
      '</div>' +
      '<div class="eager-top-shelf-branding">' +
        '<a class="eager-top-shelf-branding-link" href="https://eager.io?utm_source=eager_top_shelf_powered_by_link" target="_blank">Powered by Eager</a>' +
      '</div>' +
    '';

    textEl = el.querySelector('.eager-top-shelf-text')
    textEl.innerHTML = options[options.goal + 'Text'];

    buttonEl = el.querySelector('.eager-top-shelf-button')
    if (options.goal !== 'announcement') {
      buttonEl.innerHTML = options[options.goal + 'ButtonText'] || '&nbsp;';
    } else if (buttonEl) {
      buttonEl.innerHTML = '';
    }

    if (options.goal === 'cta') {
      linkEl = el.querySelector('.eager-top-shelf-link')
      linkEl.setAttribute('href', options.ctaLinkAddress);
    }

    el.querySelector('.eager-top-shelf-close-button').addEventListener('click', hide);
    if (options.goal == 'cta') {
      linkEl.addEventListener('click', hide);
    }
  }

  colorStyle = document.createElement('style');
  document.head.appendChild(colorStyle);

  el = document.createElement('eager-top-shelf');
  el.addEventListener('touchstart', function(){}, false); // iOS :hover CSS hack
  el.className = 'eager-top-shelf';

  el.addEventListener('submit', function(event) {
    event.preventDefault();

    var form, button, email, callback;

    form = el.querySelector('form');
    button = el.querySelector('button[type="submit"]');

    if (isPreview) {
      el.querySelector('.eager-top-shelf-text').innerHTML = options.signupSuccessText + ' (Form submissions are simulated during the Eager preview.)';
      document.documentElement.setAttribute('eager-top-shelf-goal', 'announcement');
      setHTMLStyle();
      return;
    }

    callback = function(ok) {
      var message;

      button.removeAttribute('disabled');

      if (ok){
        document.documentElement.setAttribute('eager-top-shelf-goal', 'announcement');
        setHTMLStyle();

        if (typeof ok == 'string'){
          message = ok;
        } else {
          message = options.signupSuccessText;
        }

        form.parentNode.removeChild(form);
        setTimeout(hide, 3000);
      } else {
        message = 'Whoops, something didn’t work. Please try again:';
      }

      el.querySelector('.eager-top-shelf-text').innerHTML = message;
      setHTMLStyle();
    };

    email = el.querySelector('input[type="email"]').value;

    options.destination = options.signupDestination;
    options.email = options.signupEmail;
    submit(options, email, callback);

    button.setAttribute('disabled', 'disabled');
  });

  htmlStyle = document.createElement('style');
  document.head.appendChild(htmlStyle);

  show = function() {
    document.documentElement.setAttribute('eager-top-shelf-show', 'true');

    if (!htmlStyle.parentNode){
      document.head.appendChild(htmlStyle);
    }
  };
  show();

  hide = function() {
    document.documentElement.setAttribute('eager-top-shelf-show', 'false');
    document.head.removeChild(htmlStyle);
    try {
      localStorage.topShelfShownWithOptions = optionsString;
    } catch (e) {}
  };

  lastElHeight = 0;
  setHTMLStyle = function() {
    var elHeight;

    if (!document.body) {
      return;
    }

    elHeight = el.clientHeight;
    if (lastElHeight !== elHeight) {
      htmlStyle.innerHTML = '' +
        'html {' +
          '-webkit-transform: translate3d(0, ' + elHeight + 'px, 0) !important;' +
          'transform: translate3d(0, ' + elHeight + 'px, 0) !important' +
        '}' +
      '';
    }
    lastElHeight = elHeight;
  };
  window.addEventListener('resize', setHTMLStyle);

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(el);

    update();

    setTimeout(setHTMLStyle, 0);
  });

  INSTALL_SCOPE = {
    setOptions: setOptions,
    show: show,
    hide: hide
  };
})();
