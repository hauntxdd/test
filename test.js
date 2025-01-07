(function() {
  /*************************************
   * 1. Stwórz style i kontener menu
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    /* Styl menu */
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
    /* Checkbox + label */
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
    <h3>MSP2 - Wyłącz cenzurę</h3>
    <label>
      <input type="checkbox" id="msp2CensorBypass" />
      Włącz bypass (wyłącz cenzurę + patch czatu)
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  /*************************************
   * 2. Funkcja wstawiająca \u200B (ZWS)
   *************************************/
  function insertZeroWidthSpaces(text) {
    // Wstawia \u200B między każdy znak
    return [...text].join('\u200B');
  }

  /**********************************************************
   * 3. Jedna tablica na wszystkie ocenzurowane wiadomości
   *    - Każde wysłanie wulgarnego słowa -> push do tablicy
   *    - Każde przyjście "#####" -> shift z tablicy
   **********************************************************/
  const myLocalMessages = [];

  /*************************************
   * 4. Zmienna do przechowywania oryginałów funkcji
   *************************************/
  let originalSanitizeMessage = null;
  let originalSendChatMessage = null;
  let originalDisplayChatMessage = null;

  /*************************************
   * 5. Funkcja instalująca cały bypass
   *************************************/
  function installBypass() {
    console.log('[MSP2] Instaluję bypass cenzury...');

    // A) Nadpisanie sanitizeMessage (wyłącz cenzurę kliencką)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        // Po prostu zwracamy oryginał
        console.log('[MSP2] Cenzura client-side -> wyłączona dla:', text);
        return text;
      };
      console.log('[MSP2] sanitizeMessage spatchowany - cenzura off (client-side).');
    }

    // B) Nadpisanie sendChatMessage (wstaw \u200B + zapisz oryginał do tablicy)
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;
      window.sendChatMessage = function(text) {
        // 1) Wstawiamy znaki zero-width
        const zwsText = insertZeroWidthSpaces(text);

        // 2) Zapisujemy oryginał w tablicy
        myLocalMessages.push(text);

        console.log('[MSP2] Patch sendChatMessage -> Wysyłam:', zwsText, '| zapamiętuję oryginał:', text);
        return originalSendChatMessage.call(this, zwsText);
      };
      console.log('[MSP2] sendChatMessage spatchowany (ZWS + localMessages).');
    }

    // C) Nadpisanie displayChatMessage (zamiana "#####" na oryginał z tablicy)
    if (typeof window.displayChatMessage === 'function' && !originalDisplayChatMessage) {
      originalDisplayChatMessage = window.displayChatMessage;
      window.displayChatMessage = function(userName, message) {
        if (message === '#####') {
          // Ściągamy pierwszy oryginał z kolejki
          const original = myLocalMessages.shift();
          if (original) {
            console.log('[MSP2] Patch displayChatMessage -> "#####" zamieniam na:', original);
            message = original;
          }
        }
        return originalDisplayChatMessage.call(this, userName, message);
      };
      console.log('[MSP2] displayChatMessage spatchowany (odcenzurowywanie w locie).');
    }
  }

  /*************************************
   * 6. Funkcja usuwająca cały bypass
   *************************************/
  function uninstallBypass() {
    console.log('[MSP2] Usuwam bypass cenzury...');

    // Przywróć sanitizeMessage
    if (originalSanitizeMessage) {
      window.sanitizeMessage = originalSanitizeMessage;
      originalSanitizeMessage = null;
      console.log('[MSP2] Przywrócono oryginalne sanitizeMessage.');
    }

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

    // Wyczyść tablicę
    myLocalMessages.length = 0;
  }

  /*********************************************************
   * 7. Jedyny checkbox do włączania/wyłączania bypassu
   *********************************************************/
  const bypassCheckbox = document.getElementById('msp2CensorBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
