(function() {
    "use strict";
    function email$utils$utils$$submit(options, email, callback) {
      if (options.destination == 'email' && options.email) {
        email$utils$utils$$submitFormspree(options, email, callback);
      } else if (options.destination == 'service') {
        if (options.account.service == 'mailchimp') {
          email$utils$utils$$submitMailchimp(options, email, callback);
        } else if (options.account.service == 'constant-contact') {
          email$utils$utils$$submitConstantContact(options, email, callback);
        }
      }
    }

    function email$utils$utils$$submitFormspree(options, email, cb) {
      var url, xhr, params;

      url = '//formspree.io/' + options.email;
      xhr = new XMLHttpRequest();

      params = 'email=' + encodeURIComponent(email);

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        var jsonResponse = {};
        if (xhr.status < 400) {
          try {
            jsonResponse = JSON.parse(xhr.response);
          } catch (err) {}

          if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
            cb('Formspree has sent an email to ' + options.email + ' for verification.');
          } else {
            cb(true);
          }
        } else {
          cb(false);
        }
      }

      xhr.send(params);
    }function email$utils$utils$$submitMailchimp(options, email, cb) {
      var cbCode, url, script;

      cbCode = 'eagerFormCallback' + Math.floor(Math.random() * 100000000000000);

      window[cbCode] = function(resp) {
        cb(resp && resp.result === 'success');

        delete window[cbCode];
      }

      url = options.list;
      if (!url) {
        return cb(false);
      }

      url = url.replace('http', 'https');
      url = url.replace(/list-manage[0-9]+\.com/, 'list-manage.com');
      url = url.replace('?', '/post-json?');
      url = url + '&EMAIL=' + encodeURIComponent(email);
      url = url + '&c=' + cbCode;

      script = document.createElement('script');
      script.src = url;
      document.head.appendChild(script);
    }function email$utils$utils$$submitConstantContact(options, email, cb) {
      if (!options.form || !options.form.listId) {
        return cb(false);
      }

      var xhr, body;

      xhr = new XMLHttpRequest();

      body = {
        email: email,
        ca: options.form.campaignActivity,
        list: options.form.listId
      };

      xhr.open('POST', 'https://visitor2.constantcontact.com/api/signup');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        cb(xhr && xhr.status < 400);
      };

      xhr.send(JSON.stringify(body));
    }

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
        email$utils$utils$$submit(options, email, callback);

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
}).call(this);