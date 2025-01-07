(function() {
  // 1. Dodaj style
  const style = document.createElement('style');
  style.innerHTML = `
    /* Styl menu */
    #msp2Menu {
      display: none;              /* Domyślnie ukryte */
      width: 200px;
      padding: 10px;
      background-color: #f5f5f5;
      border: 2px solid #ccc;
      border-radius: 4px;
      position: fixed;            /* stałe położenie */
      top: 50px;
      left: 50px;
      z-index: 9999;             /* żeby przykrywało inne elementy */
      font-family: sans-serif;    /* przykład */
    }

    /* Przycisk otwierania/zamykania menu */
    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 5px 10px;
      cursor: pointer;
      font-family: sans-serif;    /* przykład */
    }

    /* Nagłówek w menu */
    #msp2Menu h3 {
      margin: 0 0 10px 0;
    }

    /* Przykładowe formatowanie etykiety od checkboxa */
    #msp2Menu label {
      display: block;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);

  // 2. Stwórz przycisk do otwierania/zamykania
  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  // 3. Stwórz kontener menu
  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>Moje Menu</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxCensor" />
      Wyłącz cenzurę (client-side)
    </label>
    <label>
      <input type="checkbox" id="msp2CheckboxPatchChat" />
      Patch czatu (wysyłanie + wyświetlanie)
    </label>
  `;
  document.body.appendChild(menu);

  // 4. Logika otwierania/zamykania
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  // ========== 5. Wyłączanie cenzury w kliencie (sanitizeMessage) ==========
  const checkboxCensor = document.getElementById('msp2CheckboxCensor');

  checkboxCensor.addEventListener('change', () => {
    if (checkboxCensor.checked) {
      console.log('[MSP2] Wyłączanie cenzury w kliencie (sanitizeMessage).');

      if (typeof window.sanitizeMessage === 'function') {
        window._originalSanitizeMessage = window.sanitizeMessage;
        window.sanitizeMessage = function(text) {
          console.log('[MSP2] Zwracam oryginalny tekst (cenzura OFF):', text);
          return text;
        };
      } else {
        console.warn('[MSP2] Nie znaleziono window.sanitizeMessage w kliencie.');
      }
    } else {
      console.log('[MSP2] Przywracanie cenzury w kliencie.');
      if (window._originalSanitizeMessage) {
        window.sanitizeMessage = window._originalSanitizeMessage;
        delete window._originalSanitizeMessage;
      }
    }
  });

  // ========== 6. Patch czatu (wysyłanie + wyświetlanie) ==========
  const checkboxPatchChat = document.getElementById('msp2CheckboxPatchChat');

  // Pamięć lokalna: mapuje ID lub "#####"/cokolwiek -> oryginalny tekst
  const myLocalMessages = {};

  // Oryginalne referencje
  let originalSendChatMessage = null;
  let originalDisplayChatMessage = null;

  function installChatPatches() {
    console.log('[MSP2] Instalujemy patch czatu...');

    // --- Patch wysyłania (sendChatMessage) ---
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;

      window.sendChatMessage = function(text) {
        console.log('[MSP2] Patch sendChatMessage - zapamiętuję oryginalny text:', text);

        // Przyjmijmy, że serwer zwróci '#####' za każde wulgarne słowo.
        // Zapisz do lokalnej mapy:
        // kluczem będzie np. '#####' (jeśli serwer zawsze tak cenzuruje)
        // ALE: to działa tylko dla Twoich własnych wiadomości.
        // Wersja prosta: "#####": text
        myLocalMessages['#####'] = text; 

        // Wywołaj oryginał
        return originalSendChatMessage.apply(this, arguments);
      };
      console.log('[MSP2] sendChatMessage spatchowany.');
    } else {
      console.warn('[MSP2] Nie znaleziono sendChatMessage lub już spatchowane?');
    }

    // --- Patch wyświetlania (displayChatMessage) ---
    if (typeof window.displayChatMessage === 'function' && !originalDisplayChatMessage) {
      originalDisplayChatMessage = window.displayChatMessage;

      window.displayChatMessage = function(userName, message) {
        // Jesli serwer odesłał "#####", sprawdź, czy to nasza wiadomość
        if (message === '#####') {
          // Zamień na oryginał, jeśli mamy w myLocalMessages
          const original = myLocalMessages['#####'];
          if (original) {
            console.log('[MSP2] Patch: Zastępujemy ##### ->', original);
            message = original;
          }
        }
        // Wywołaj oryginalną funkcję
        return originalDisplayChatMessage.call(this, userName, message);
      };
      console.log('[MSP2] displayChatMessage spatchowany.');
    } else {
      console.warn('[MSP2] Nie znaleziono displayChatMessage lub już spatchowane?');
    }
  }

  function uninstallChatPatches() {
    console.log('[MSP2] Usuwamy patch czatu...');

    // Przywróć sendChatMessage
    if (originalSendChatMessage) {
      window.sendChatMessage = originalSendChatMessage;
      originalSendChatMessage = null;
      console.log('[MSP2] Przywrócono oryginalne sendChatMessage.');
    }

    // Przywróć displayChatMessage
    if (originalDisplayChatMessage) {
      window.displayChatMessage = originalDisplayChatMessage;
      originalDisplayChatMessage = null;
      console.log('[MSP2] Przywrócono oryginalne displayChatMessage.');
    }
  }

  checkboxPatchChat.addEventListener('change', () => {
    if (checkboxPatchChat.checked) {
      installChatPatches();
    } else {
      uninstallChatPatches();
    }
  });
})();
