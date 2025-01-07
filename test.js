(function() {
  // 1. Dodaj style
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
    /* Nagłówek menu */
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

  // 3. Kontener menu
  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>MSP2 Bypass</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass" />
      Wyłącz cenzurę
    </label>
  `;
  document.body.appendChild(menu);

  // 4. Logika otwierania/zamykania menu
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  // --- Zmienne do przechowywania oryginalnych funkcji ---
  let originalSanitizeMessage = null;
  let originalSendChatMessage = null;
  let originalDisplayChatMessage = null;

  // --- Kolejka do przechowywania **oryginalnych** wiadomości ---
  //   Gdy serwer ocenzuruje na "#####", przywrócimy je z kolejki
  const myLocalQueue = [];

  // Funkcja wstawiająca \u200B między każdą literę (np. "kurwa" => "k\u200Bu\u200Br\u200Bw\u200Ba")
  function insertZeroWidthSpaces(str) {
    // Można też: return str.replace(/(.)/g, '$1\u200B').trim();
    return [...str].join('\u200B');
  }

  // 5. Funkcja włączająca bypass
  function installBypass() {
    console.log('[MSP2] Instaluję bypass (wyłączenie cenzury + \\u200B).');

    // A) Wyłącz cenzurę w kliencie (sanitizeMessage)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        // Zwracamy tekst 1:1 (bez cenzury)
        console.log('[MSP2] Cenzura client-side wyłączona, oryginał:', text);
        return text;
      };
      console.log('[MSP2] sanitizeMessage spatchowany (cenzura OFF).');
    } else {
      console.warn('[MSP2] Nie znaleziono sanitizeMessage lub już spatchowane?');
    }

    // B) Patch sendChatMessage - wstaw \u200B
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;

      window.sendChatMessage = function(text) {
        // Zapisujemy oryginalną wiadomość w kolejce
        myLocalQueue.push(text);

        // Dodajemy niewidoczne spacje
        const patched = insertZeroWidthSpaces(text);

        console.log('[MSP2] Patch sendChatMessage -> było:', text, '=> wysyłam:', patched);

        // Wywołanie oryginalnej funkcji z przerobionym tekstem
        return originalSendChatMessage.call(this, patched);
      };
      console.log('[MSP2] sendChatMessage spatchowany (dodaję \\u200B).');
    } else {
      console.warn('[MSP2] Nie znaleziono sendChatMessage lub już spatchowane?');
    }

    // C) Patch displayChatMessage - przywracaj oryginał, jeśli serwer zwróci "#####"
    if (typeof window.displayChatMessage === 'function' && !originalDisplayChatMessage) {
      originalDisplayChatMessage = window.displayChatMessage;

      window.displayChatMessage = function(userName, message) {
        if (message === '#####') {
          const original = myLocalQueue.shift();
          if (original) {
            console.log('[MSP2] Otrzymaliśmy "#####", przywracam oryginał:', original);
            message = original;
          }
        }
        return originalDisplayChatMessage.call(this, userName, message);
      };
      console.log('[MSP2] displayChatMessage spatchowany (przywracanie oryginału).');
    } else {
      console.warn('[MSP2] Nie znaleziono displayChatMessage lub już spatchowane?');
    }
  }

  // 6. Funkcja wyłączająca bypass
  function uninstallBypass() {
    console.log('[MSP2] Wyłączam bypass, przywracam oryginalne funkcje.');

    // A) Przywróć sanitizeMessage
    if (originalSanitizeMessage) {
      window.sanitizeMessage = originalSanitizeMessage;
      originalSanitizeMessage = null;
      console.log('[MSP2] Przywrócono oryginalne sanitizeMessage.');
    }

    // B) Przywróć sendChatMessage
    if (originalSendChatMessage) {
      window.sendChatMessage = originalSendChatMessage;
      originalSendChatMessage = null;
      console.log('[MSP2] Przywrócono oryginalne sendChatMessage.');
    }

    // C) Przywróć displayChatMessage
    if (originalDisplayChatMessage) {
      window.displayChatMessage = originalDisplayChatMessage;
      originalDisplayChatMessage = null;
      console.log('[MSP2] Przywrócono oryginalne displayChatMessage.');
    }

    // Wyczyść kolejkę
    myLocalQueue.length = 0;
  }

  // 7. Checkbox do włączania/wyłączania bypassu
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
