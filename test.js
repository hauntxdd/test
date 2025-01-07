(function() {
  /*************************************
   * 1. Dodaj style
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    /* Styl menu */
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
    /* Przycisk otwierania/zamykania menu */
    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 5px 10px;
      cursor: pointer;
      font-family: sans-serif;
    }
    /* Nagłówek w menu */
    #msp2Menu h3 {
      margin: 0 0 10px 0;
    }
    /* Etykiety od checkboxów */
    #msp2Menu label {
      display: block;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);

  /*************************************
   * 2. Stwórz przycisk do otwierania menu
   *************************************/
  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  /*************************************
   * 3. Kontener menu
   *************************************/
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
    <label>
      <input type="checkbox" id="msp2CheckboxZws" />
      Wstaw \\u200B między litery
    </label>
  `;
  document.body.appendChild(menu);

  /*************************************
   * 4. Pokaż/ukryj menu
   *************************************/
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  /*************************************
   * 5. Wyłączenie cenzury klienckiej (sanitizeMessage)
   *************************************/
  const checkboxCensor = document.getElementById('msp2CheckboxCensor');

  checkboxCensor.addEventListener('change', () => {
    if (checkboxCensor.checked) {
      console.log('[MSP2] Wyłączanie cenzury w kliencie (sanitizeMessage).');
      if (typeof window.sanitizeMessage === 'function') {
        window._originalSanitizeMessage = window.sanitizeMessage;
        window.sanitizeMessage = function(text) {
          console.log('[MSP2] Cenzura OFF (client-side), zwracam oryginał:', text);
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

  /*************************************
   * 6. Patch do czatu (wysyłanie + wyświetlanie)
   *************************************/
  const checkboxPatchChat = document.getElementById('msp2CheckboxPatchChat');
  const checkboxZws       = document.getElementById('msp2CheckboxZws');

  // Pamięć lokalna: klucz -> oryginalny tekst
  const myLocalMessages = {};
  let originalSendChatMessage = null;
  let originalDisplayChatMessage = null;

  // Funkcja do wstawiania znaków \u200B
  function insertZeroWidthSpaces(text) {
    return [...text].join('\u200B');
  }

  function installChatPatches() {
    console.log('[MSP2] Instalujemy patch czatu...');

    // --- Patch wysyłania (sendChatMessage) ---
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;

      window.sendChatMessage = function(text) {
        console.log('[MSP2] Patch sendChatMessage - oryginalny text:', text);

        // Jeśli checkbox "Wstaw \u200B" jest włączony, to modyfikujemy wysyłany tekst
        if (checkboxZws.checked) {
          const patched = insertZeroWidthSpaces(text);
          console.log('[MSP2] Dodaję \\u200B. Było:', text, '=> wysyłam:', patched);
          text = patched;
        }

        // Zakładamy, że serwer zamieni wulgaryzmy na '#####', 
        // więc mapujemy '#####' => oryginalny text
        myLocalMessages['#####'] = text;

        // Wywołujemy oryginalną funkcję
        return originalSendChatMessage.call(this, text);
      };
      console.log('[MSP2] sendChatMessage spatchowany.');
    } else {
      console.warn('[MSP2] Nie znaleziono (lub już spatchowane) sendChatMessage.');
    }

    // --- Patch wyświetlania (displayChatMessage) ---
    if (typeof window.displayChatMessage === 'function' && !originalDisplayChatMessage) {
      originalDisplayChatMessage = window.displayChatMessage;

      window.displayChatMessage = function(userName, message) {
        // Jeśli to '#####', sprawdź, czy jest w pamięci
        if (message === '#####') {
          const original = myLocalMessages['#####'];
          if (original) {
            console.log('[MSP2] displayChatMessage -> Zamieniam ##### na:', original);
            message = original;
          }
        }
        return originalDisplayChatMessage.call(this, userName, message);
      };
      console.log('[MSP2] displayChatMessage spatchowany.');
    } else {
      console.warn('[MSP2] Nie znaleziono (lub już spatchowane) displayChatMessage.');
    }
  }

  function uninstallChatPatches() {
    console.log('[MSP2] Usuwamy patch czatu...');

    // Przywróć sendChatMessage
    if (originalSendChatMessage) {
      window.sendChatMessage = originalSendChatMessage;
      originalSendChatMessage = null;
      console.log('[MSP2] Oryginalne sendChatMessage przywrócone.');
    }

    // Przywróć displayChatMessage
    if (originalDisplayChatMessage) {
      window.displayChatMessage = originalDisplayChatMessage;
      originalDisplayChatMessage = null;
      console.log('[MSP2] Oryginalne displayChatMessage przywrócone.');
    }
  }

  // Obsługa checkboxa PatchChat (instalacja/deinstalacja patchy)
  checkboxPatchChat.addEventListener('change', () => {
    if (checkboxPatchChat.checked) {
      installChatPatches();
    } else {
      uninstallChatPatches();
    }
  });
})();
