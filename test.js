(function() {
  /*************************************
   * 1. Dodaj style i menu
   *************************************/
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
    <h3>Bypass MSP2</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass"/>
      Wstaw \\u200B + Wyłącz cenzurę kliencką
    </label>
  `;
  document.body.appendChild(menu);

  // Pokaż/ukryj menu
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  /*************************************
   * 2. Zmienne i pomocnicze funkcje
   *************************************/
  let originalSanitizeMessage = null;
  let originalSendChatMessage = null;

  // Funkcja wstawiająca \u200B pomiędzy każdą literę
  function insertZeroWidthSpaces(str) {
    // Rozbij tekst na pojedyncze ‘znaki’ i między każdą parę wstaw \u200B
    return [...str].join('\u200B');
  }

  /*************************************
   * 3. Instalacja patchy
   *************************************/
  function installBypass() {
    console.log('[MSP2] Włączam bypass: wstawiam \\u200B + wyłączam cenzurę w kliencie.');

    // A) Wyłącz cenzurę kliencką (sanitizeMessage)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        // cenzura kliencka OFF
        return text;
      };
      console.log('[MSP2] sanitizeMessage spatchowany (cenzura OFF).');
    }

    // B) Patch sendChatMessage - wstaw \u200B
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;

      window.sendChatMessage = function(text) {
        // Zawsze rozbijaj na \u200B
        const patched = insertZeroWidthSpaces(text);
        console.log('[MSP2] sendChatMessage -> było:', text, '=> wysyłam:', patched);

        return originalSendChatMessage.call(this, patched);
      };
      console.log('[MSP2] sendChatMessage spatchowany (dodawanie \\u200B).');
    }
  }

  /*************************************
   * 4. Deinstalacja patchy
   *************************************/
  function uninstallBypass() {
    console.log('[MSP2] Wyłączam bypass: przywracam oryginalne funkcje.');

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
  }

  /*************************************
   * 5. Obsługa checkboxa
   *************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
