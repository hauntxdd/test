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
    #sendTestMessageBtn {
      display: block;
      margin-top: 15px;
      padding: 8px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
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
    <button id="sendTestMessageBtn">Wyślij wiadomość testową</button>
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
  let originalWebSocketSend = WebSocket.prototype.send;

  function insertZeroWidthSpaces(str) {
    return [...str].join('\u200B'); // Wstawianie \u200B pomiędzy znaki
  }

  /*************************************
   * 3. Instalacja patchy
   *************************************/
  function installBypass() {
    console.log('[MSP2] Włączam bypass: wstawiam \\u200B + wyłączam cenzurę w kliencie.');

    // Wyłącz cenzurę kliencką (sanitizeMessage)
    if (typeof window.sanitizeMessage === 'function' && !originalSanitizeMessage) {
      originalSanitizeMessage = window.sanitizeMessage;
      window.sanitizeMessage = function(text) {
        return text; // cenzura OFF
      };
      console.log('[MSP2] sanitizeMessage spatchowany (cenzura OFF).');
    }

    // Patch sendChatMessage - wstaw \u200B
    if (typeof window.sendChatMessage === 'function' && !originalSendChatMessage) {
      originalSendChatMessage = window.sendChatMessage;
      window.sendChatMessage = function(text) {
        const patched = insertZeroWidthSpaces(text);
        console.log('[MSP2] sendChatMessage -> było:', text, '=> wysyłam:', patched);
        return originalSendChatMessage.call(this, patched);
      };
      console.log('[MSP2] sendChatMessage spatchowany (dodawanie \\u200B).');
    }

    // WebSocket.send patch
    if (WebSocket.prototype.send === originalWebSocketSend) {
      WebSocket.prototype.send = function(data) {
        let patchedData = data;
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            if (parsed.message) {
              parsed.message = insertZeroWidthSpaces(parsed.message);
            }
            if (parsed.data && typeof parsed.data === 'object') {
              for (const key in parsed.data) {
                if (typeof parsed.data[key] === 'string' && key.toLowerCase().includes('message')) {
                  parsed.data[key] = insertZeroWidthSpaces(parsed.data[key]);
                }
              }
            }
            patchedData = JSON.stringify(parsed);
          } catch (e) {
            patchedData = insertZeroWidthSpaces(data);
          }
        }
        console.log('[MSP2] WebSocket -> było:', data, '=> wysyłam:', patchedData);
        return originalWebSocketSend.call(this, patchedData);
      };
      console.log('[MSP2] WebSocket.send spatchowany (dodawanie \\u200B).');
    }
  }

  /*************************************
   * 4. Deinstalacja patchy
   *************************************/
  function uninstallBypass() {
    console.log('[MSP2] Wyłączam bypass: przywracam oryginalne funkcje.');

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

    // Przywróć WebSocket.send
    if (WebSocket.prototype.send !== originalWebSocketSend) {
      WebSocket.prototype.send = originalWebSocketSend;
      console.log('[MSP2] Przywrócono oryginalne WebSocket.send.');
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

  /*************************************
   * 6. Testowe wysyłanie wiadomości
   *************************************/
  const sendTestMessageBtn = document.getElementById('sendTestMessageBtn');
  sendTestMessageBtn.addEventListener('click', () => {
    const testMessage = 'To jest wiadomość testowa!';
    if (window.sendChatMessage) {
      window.sendChatMessage(testMessage);
      console.log('[MSP2] Testowa wiadomość wysłana przez sendChatMessage.');
    } else {
      console.warn('[MSP2] sendChatMessage nie jest dostępny.');
    }
  });
})();
