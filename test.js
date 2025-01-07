(function() {
  /***************************************************
   * 1. UI - styl i checkbox w menu
   ***************************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 220px;
      padding: 10px;
      background-color: #f5f5f5;
      border: 2px solid #ccc;
      border-radius: 4px;
      position: fixed;
      top: 50px;
      left: 50px;
      z-index: 9999;
      font-family: sans-serif;
    }
    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 5px 10px;
      cursor: pointer;
      font-family: sans-serif;
    }
    #msp2Menu h3 {
      margin: 0 0 10px 0;
    }
    #msp2Menu label {
      display: block;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);

  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij MSP2 Menu';
  document.body.appendChild(toggleMenuBtn);

  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>MSP2 Hooks</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass" />
      Wstaw \\u200B + wyłącz cenzurę
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  /***************************************************
   * 2. Zmienne i helpery
   ***************************************************/
  let originalSanitizeMessage = null;
  let originalGameInstanceSendMessage = null;
  let originalPostMessageWrappers = {};
  let originalNavigatorSendBeacon = null;

  // Wstaw \u200B pomiędzy każdą literę
  function insertZeroWidthSpaces(str) {
    if (!str || typeof str !== 'string') return str;
    return [...str].join('\u200B');
  }

  // Spróbuj wykryć, czy param/string to chat/wiadomość i wstawić \u200B
  function maybePatchText(str) {
    // Możesz dodać dodatkowe heurystyki 
    return insertZeroWidthSpaces(str);
  }

  /***************************************************
   * 3. Hook (install) - włącz patch
   ***************************************************/
  function installBypass() {
    console.log('[MSP2] instaluję hooki: cenzura OFF + \u200B w message.');

    // A) Wyłącz cenzurę client-side (jeśli jest)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        console.log('[MSP2] sanitizeMessage => skip cenzura, oryginal:', text);
        return text; 
      };
      console.log('[MSP2] OK - sanitizeMessage spatchowany.');
    }

    // B) Hook gameInstance.SendMessage
    if (window.gameInstance && typeof window.gameInstance.SendMessage === 'function' && !originalGameInstanceSendMessage) {
      originalGameInstanceSendMessage = window.gameInstance.SendMessage;
      window.gameInstance.SendMessage = function(objName, methodName, param) {
        console.log('[MSP2] gameInstance.SendMessage intercept =>', objName, methodName, param);
        // jeśli param jest typowym stringiem i wygląda na chat:
        const patched = maybePatchText(param);
        return originalGameInstanceSendMessage.call(this, objName, methodName, patched);
      };
      console.log('[MSP2] OK - window.gameInstance.SendMessage spatchowany.');
    }

    // C) Hook postMessage w kilku miejscach
    // np. window.postMessage, window.top.postMessage, ...
    const targets = [
      { obj: window, key: 'postMessage' },
      { obj: window.self, key: 'postMessage' },
      { obj: window.frames, key: 'postMessage' },
      { obj: window.top, key: 'postMessage' },
      { obj: window.parent, key: 'postMessage' },
    ];
    targets.forEach(t => {
      if (!t.obj || !t.obj[t.key]) return;
      if (originalPostMessageWrappers[t.key + '_' + t.obj] != null) return; // juź spatchowane?

      const original = t.obj[t.key];
      originalPostMessageWrappers[t.key + '_' + t.obj] = original;

      t.obj[t.key] = function(message, targetOrigin, transfer) {
        console.log(`[MSP2] hooking postMessage =>`, message, targetOrigin);
        if (typeof message === 'string') {
          message = maybePatchText(message);
        } else if (message && typeof message.text === 'string') {
          message.text = maybePatchText(message.text);
        }
        return original.call(this, message, targetOrigin, transfer);
      };
      console.log('[MSP2] OK - spatchowano', t.key, 'w', t.obj);
    });

    // D) Hook navigator.sendBeacon
    if (navigator && typeof navigator.sendBeacon === 'function' && !originalNavigatorSendBeacon) {
      originalNavigatorSendBeacon = navigator.sendBeacon;
      navigator.sendBeacon = function(url, data) {
        console.log('[MSP2] hooking navigator.sendBeacon =>', url, data);
        if (typeof data === 'string') {
          data = maybePatchText(data);
        }
        return originalNavigatorSendBeacon.call(this, url, data);
      };
      console.log('[MSP2] OK - navigator.sendBeacon spatchowany.');
    }
  }

  /***************************************************
   * 4. Uninstall - przywróć oryginały
   ***************************************************/
  function uninstallBypass() {
    console.log('[MSP2] wyłączam hooki i przywracam oryginały.');

    // A) sanitizeMessage
    if (originalSanitizeMessage) {
      window.sanitizeMessage = originalSanitizeMessage;
      originalSanitizeMessage = null;
      console.log('[MSP2] Przywrócono sanitizeMessage.');
    }

    // B) gameInstance.SendMessage
    if (originalGameInstanceSendMessage) {
      window.gameInstance.SendMessage = originalGameInstanceSendMessage;
      originalGameInstanceSendMessage = null;
      console.log('[MSP2] Przywrócono gameInstance.SendMessage.');
    }

    // C) postMessage
    const keys = Object.keys(originalPostMessageWrappers);
    keys.forEach(k => {
      // k np. 'postMessage_[object Window]'
      const [methodName] = k.split('_'); 
      // poszukaj 'window', 'window.top', etc.
      // Niestety nie mamy 1:1 obiektu, więc w demie skip
      // Gdybyśmy przechowywali (t.obj) w kluczu? 
      // to dałoby się łatwiej przywrócić
      // Poniżej prosta wersja 
      // (z racji brak referencji do obiektu docelowego)
      try {
        window[methodName] = originalPostMessageWrappers[k];
      } catch(e) { /* no-op */ }
    });
    originalPostMessageWrappers = {};
    console.log('[MSP2] Przywrócono postMessage w window/top/parent/...');

    // D) navigator.sendBeacon
    if (originalNavigatorSendBeacon) {
      navigator.sendBeacon = originalNavigatorSendBeacon;
      originalNavigatorSendBeacon = null;
      console.log('[MSP2] Przywrócono navigator.sendBeacon.');
    }
  }

  /***************************************************
   * 5. Checkbox
   ***************************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
