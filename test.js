(function() {
  /************************************************
   * 1. Dodaj styl i UI (menu z checkbox)
   ************************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 200px;
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
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>MSP2 Bypass</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass" />
      Wstaw \\u200B + wyłącz cenzurę (client-side)
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  /************************************************
   * 2. Zmienne i helpery
   ************************************************/
  let originalSanitizeMessage = null;    // do patchowania window.sanitizeMessage
  let originalSendChatMessage = null;    // do patchowania window.sendChatMessage
  let originalFetch = null;              // do patchowania fetch

  // Wstaw \u200B pomiędzy każdą literę
  function insertZeroWidthSpaces(str) {
    return [...str].join('\u200B');
  }

  // Patch JSON / formData, by w polu "text", "message" itp. wstawić \u200B
  function patchBodyString(bodyString) {
    // 1) Spróbuj JSON
    try {
      const data = JSON.parse(bodyString);
      let changed = false;

      // Spróbujmy klucze: text, message, ...
      // (ew. można dodać "actorName" itd. – cokolwiek chcesz)
      const possibleKeys = ['text', 'message'];

      for (const k of possibleKeys) {
        if (typeof data[k] === 'string') {
          const oldVal = data[k];
          data[k] = insertZeroWidthSpaces(oldVal);
          console.log(`[MSP2] Patching JSON field '${k}' =>`, oldVal, '->', data[k]);
          changed = true;
        }
      }
      if (changed) {
        return JSON.stringify(data);
      } else {
        // nic nie zmieniliśmy
        return bodyString;
      }
    } catch (err) {
      // body to nie JSON – idź dalej
    }

    // 2) Spróbuj x-www-form-urlencoded
    if (bodyString.includes('=') && (bodyString.includes('&') || bodyString.includes('text=') || bodyString.includes('message='))) {
      // prosta logika
      const re = /(text|message)=([^&]+)/g;
      let newBody = bodyString.replace(re, (match, key, val) => {
        const decoded = decodeURIComponent(val.replace(/\+/g, ' '));
        const patched = insertZeroWidthSpaces(decoded);
        const reencoded = encodeURIComponent(patched).replace(/%20/g, '+');
        console.log(`[MSP2] Patching formData '${key}' =>`, decoded, '->', patched);
        return `${key}=${reencoded}`;
      });
      if (newBody !== bodyString) {
        return newBody;
      }
    }

    // 3) Inne formy (np. AMF binarny) – nic nie zrobimy
    return bodyString;
  }

  // Patch obiekt 'init.body' w fetch
  function patchRequestBody(init) {
    if (!init || !init.method || init.method.toUpperCase() !== 'POST' || !init.body) {
      return;
    }

    if (typeof init.body === 'string') {
      init.body = patchBodyString(init.body);
    } else if (init.body instanceof URLSearchParams) {
      const raw = init.body.toString();
      const newRaw = patchBodyString(raw);
      init.body = new URLSearchParams(newRaw);
    } else if (init.body instanceof Blob) {
      console.warn('[MSP2] Body jest Blobem – skip (może AMF?).');
    } else {
      console.warn('[MSP2] Nieznany typ body – skip:', init.body);
    }
  }

  /************************************************
   * 3. Funkcja instalująca patch
   ************************************************/
  function installBypass() {
    console.log('[MSP2] installBypass() – wstawiam \\u200B + wyłączam cenzurę kliencką.');

    // A) Patch sanitizeMessage
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        console.log('[MSP2] sanitizeMessage => brak cenzury, oryginal:', text);
        return text; // nic nie cenzurujemy
      };
      console.log('[MSP2] sanitizeMessage spatchowany (cenzura OFF).');
    }

    // B) Patch sendChatMessage (starsze MSP?)
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;
      window.sendChatMessage = function(text) {
        const patched = insertZeroWidthSpaces(text);
        console.log('[MSP2] sendChatMessage => patched:', text, '->', patched);
        return originalSendChatMessage.call(this, patched);
      };
      console.log('[MSP2] sendChatMessage spatchowany (dodawanie \\u200B).');
    }

    // C) Patch fetch → nasłuchujemy Endpointy MSP (SendChatMessage..., PostToWall..., itp.)
    if (!originalFetch && typeof window.fetch === 'function') {
      originalFetch = window.fetch;
      window.fetch = async function(input, init) {
        // detekcja:
        try {
          let url = '';
          if (typeof input === 'string') {
            url = input;
          } else if (input && input.url) {
            url = input.url;
          }
          // sprawdź, czy to jest Gateway.aspx z metodą ...
          if (url.includes('Gateway.aspx') &&
              (url.match(/SendChatMessageWithModerationCall/i) ||
               url.match(/PostToWallWithModerationCall/i) ||
               url.match(/ProfileService/i) )) {
            console.log('[MSP2:fetchHook] Wykryto endpoint chat/wall:', url);
            patchRequestBody(init);
          }
        } catch (err) {
          console.warn('[MSP2:fetchHook] Błąd patchowania:', err);
        }
        // oryginalne
        return originalFetch.apply(this, arguments);
      };
      console.log('[MSP2] fetch zahookowany (patch text).');
    }
  }

  /************************************************
   * 4. Funkcja usuwająca patch
   ************************************************/
  function uninstallBypass() {
    console.log('[MSP2] uninstallBypass() – przywracam oryginały.');

    // A) sanitizeMessage
    if (originalSanitizeMessage) {
      window.sanitizeMessage = originalSanitizeMessage;
      originalSanitizeMessage = null;
      console.log('[MSP2] Przywrócono sanitizeMessage.');
    }

    // B) sendChatMessage
    if (originalSendChatMessage) {
      window.sendChatMessage = originalSendChatMessage;
      originalSendChatMessage = null;
      console.log('[MSP2] Przywrócono sendChatMessage.');
    }

    // C) fetch
    if (originalFetch) {
      window.fetch = originalFetch;
      originalFetch = null;
      console.log('[MSP2] Przywrócono window.fetch.');
    }
  }

  /************************************************
   * 5. Checkbox
   ************************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });

})();
