(function() {
  /**********************************************
   * 1. Dodaj style i UI (menu + checkbox)
   **********************************************/
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

  // Przycisk do otwierania/zamykania menu
  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  // Kontener menu
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

  // Logika otwierania/zamykania
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  /**********************************************
   * 2. Zmienne i pomocnicze funkcje
   **********************************************/
  let originalSanitizeMessage = null;
  let originalFetch = null;

  // Wstaw \u200B pomiędzy każdą literę
  function insertZeroWidthSpaces(str) {
    return [...str].join('\u200B');
  }

  // (Opcjonalnie) Zdebuguj, czy w body jest pole "text"
  // i tam wstaw \u200B:
  function patchRequestBody(bodyString) {
    /*
      To TYLKO PRZYKŁAD, liczymy że body to JSON
      i jest w nim "text": "...". 
      Ale MSP może używać AMF/binarnego. 
      Dla testu: 
    */
    try {
      const json = JSON.parse(bodyString);

      // np. poszukaj klucza "text" i spatchuj
      if (json.text) {
        json.text = insertZeroWidthSpaces(json.text);
        console.log('[MSP2:fetchHook] Oryginalny text:', bodyString, ' => patched:', json.text);
      }
      return JSON.stringify(json);

    } catch (err) {
      // body nie jest JSON-em → spróbujmy formData?
      // Tu można spróbować parse'ować `text=...` itp.
      // Poniżej mini hack: 
      if (bodyString.includes('text=')) {
        // text=Hello+world -> text=H&#x200B;e&#x200B;l&#x200B;l&#x200B;o ...
        // UWAGA: to jest x-www-form-urlencoded, plusy, itp.
        const newBody = bodyString.replace(
          /(text=)([^&]+)/,
          (match, prefix, val) => {
            // decode e.g. "Hi+test" => "Hi test"
            let decoded = decodeURIComponent(val.replace(/\+/g, ' '));
            let patched = insertZeroWidthSpaces(decoded);
            // re-encode
            let reencoded = encodeURIComponent(patched).replace(/%20/g, '+');
            return prefix + reencoded;
          }
        );
        console.log('[MSP2:fetchHook] Patching formData body:\n', bodyString, '\n=>\n', newBody);
        return newBody;
      }

      // W innym wypadku - nic nie robimy
      console.warn('[MSP2:fetchHook] Nie udało się zpatchować body. (nie JSON / nie formData)', err);
      return bodyString;
    }
  }

  /**********************************************
   * 3. Instalacja bypass (cenzura off + fetchHook)
   **********************************************/
  function installBypass() {
    console.log('[MSP2] installBypass');

    // A) Wyłącz cenzurę w kliencie (o ile window.sanitizeMessage istnieje)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        // cenzura kliencka OFF
        console.log('[MSP2] sanitizeMessage => brak cenzury, oryginal:', text);
        return text;
      };
      console.log('[MSP2] sanitizeMessage spatchowany (cenzura OFF).');
    }

    // B) Hook fetch → szukaj wywołań do SendChatMessageWithModerationCall
    if (!originalFetch && typeof window.fetch === 'function') {
      originalFetch = window.fetch;
      window.fetch = async function(input, init) {
        try {
          // Jeżeli widzimy endpoint do Gateway.aspx z param method=SendChatMessage...
          let url = (typeof input === 'string') ? input : (input.url || '');
          if (url.includes('Gateway.aspx') && url.match(/SendChatMessageWithModerationCall/i)) {
            console.log('[MSP2:fetchHook] Detekcja endpointu czatu:', url);

            if (init && init.method === 'POST' && init.body) {
              // Musimy skopiować body, żeby je przerobić:
              // body może być np. string, URLSearchParams, itp.
              if (typeof init.body === 'string') {
                // prosto - w stringu
                init.body = patchRequestBody(init.body);
              } else if (init.body instanceof Blob) {
                // trudniej... moglibyśmy ewentualnie odczytać text z Bloba,
                // ale to asynchroniczne. Dla uproszczenia - skip.
                console.warn('[MSP2:fetchHook] Body jest Blobem - nie patchuję');
              } else if (init.body instanceof URLSearchParams) {
                // np. text=coś tam
                const raw = init.body.toString();
                init.body = new URLSearchParams(patchRequestBody(raw));
              } else {
                // Inne formy - skip
                console.warn('[MSP2:fetchHook] Nieobsługiwana forma body:', init.body);
              }
            }
          }
        } catch (err) {
          console.warn('[MSP2:fetchHook] Błąd patchowania fetch:', err);
        }
        // wywołaj oryginał
        return originalFetch.apply(this, arguments);
      };
      console.log('[MSP2] fetch zahookowany (dodawanie \\u200B).');
    }
  }

  /**********************************************
   * 4. Deinstalacja (przywróć sanitize + fetch)
   **********************************************/
  function uninstallBypass() {
    console.log('[MSP2] uninstallBypass');

    // A) Przywróć sanitizeMessage
    if (originalSanitizeMessage) {
      window.sanitizeMessage = originalSanitizeMessage;
      originalSanitizeMessage = null;
      console.log('[MSP2] Przywrócono oryginalne sanitizeMessage.');
    }

    // B) Przywróć fetch
    if (originalFetch) {
      window.fetch = originalFetch;
      originalFetch = null;
      console.log('[MSP2] Przywrócono oryginalne window.fetch.');
    }
  }

  /**********************************************
   * 5. Checkbox -> włącz/wyłącz
   **********************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
