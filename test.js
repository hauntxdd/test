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
      position: fixed;
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

    /* Checkbox */
    #msp2Menu label {
      display: block;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);

  // 2. Stwórz przycisk do otwierania/zamykania menu
  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  // 3. Stwórz kontener menu
  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>MSP2 Bypass</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass" />
      Wyłącz cenzurę + wstaw \\u200B
    </label>
  `;
  document.body.appendChild(menu);

  // 4. Logika otwierania/zamykania
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  // ========== 5. Referencje do oryginalnych funkcji i kolejka wiadomości ==========

  // Oryginalna funkcja sanitizeMessage
  let originalSanitizeMessage = null;
  // Oryginalne sendChatMessage / displayChatMessage
  let originalSendChatMessage = null;
  let originalDisplayChatMessage = null;

  // Kolejka oryginalnych wiadomości (FIFO)
  const myLocalQueue = [];

  // Funkcja do wstawiania \u200B pomiędzy każdą literę
  function insertZeroWidthSpaces(str) {
    return [...str].join('\u200B');
  }

  // ========== 6. Funkcja włączająca "bypass" ==========

  function installBypass() {
    console.log('[MSP2] Instaluję bypass...');

    // A) Wyłącz cenzurę client-side (sanitizeMessage)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        console.log('[MSP2] Cenzura OFF - zwracam oryginalny text:', text);
        return text;
      };
      console.log('[MSP2] sanitizeMessage spatchowany.');
    }

    // B) Patch sendChatMessage (wstaw \u200B i odkładaj oryginał do kolejki)
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;

      window.sendChatMessage = function(text) {
        // Odkładamy oryginalny (niezmieniony) tekst do kolejki
        myLocalQueue.push(text);

        // Tworzymy wersję z \u200B
        const patchedText = insertZeroWidthSpaces(text);
        console.log('[MSP2] Patch sendChatMessage: było:', text, '=> wysyłam:', patchedText);

        return originalSendChatMessage.call(this, patchedText);
      };
      console.log('[MSP2] sendChatMessage spatchowany.');
    }

    // C) Patch displayChatMessage (jeśli dostajemy "#####", to podmieniamy na pierwszy z kolejki)
    if (typeof window.displayChatMessage === 'function' && !originalDisplayChatMessage) {
      originalDisplayChatMessage = window.displayChatMessage;

      window.displayChatMessage = function(userName, message) {
        // Jeśli serwer odesłał "#####", pobierz pierwszy oryginał z kolejki
        if (message === '#####') {
          const original = myLocalQueue.shift(); // Zdejmujemy z kolejki
          if (original) {
            console.log('[MSP2] Patch displayChatMessage: Zastępuję "#####":', message, '=>', original);
            message = original;
          }
        }
        return originalDisplayChatMessage.call(this, userName, message);
      };
      console.log('[MSP2] displayChatMessage spatchowany.');
    }
  }

  // ========== 7. Funkcja wyłączająca "bypass" ==========

  function uninstallBypass() {
    console.log('[MSP2] Usuwam bypass...');

    // A) Przywróć sanitizeMessage
    if (originalSanitizeMessage) {
      window.sanitizeMessage = originalSanitizeMessage;
      originalSanitizeMessage = null;
      console.log('[MSP2] Przywrócono sanitizeMessage.');
    }

    // B) Przywróć sendChatMessage
    if (originalSendChatMessage) {
      window.sendChatMessage = originalSendChatMessage;
      originalSendChatMessage = null;
      console.log('[MSP2] Przywrócono sendChatMessage.');
    }

    // C) Przywróć displayChatMessage
    if (originalDisplayChatMessage) {
      window.displayChatMessage = originalDisplayChatMessage;
      originalDisplayChatMessage = null;
      console.log('[MSP2] Przywrócono displayChatMessage.');
    }

    // Wyczyść kolejkę (by nie przesuwała się dalej)
    myLocalQueue.length = 0;
  }

  // ========== 8. Checkbox, który włącza/wyłącza bypass ==========

  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
