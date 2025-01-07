(function () {
  /*************************************
   * 1. Dodaj styl i menu
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
  `;
  document.head.appendChild(style);

  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>Bypass MSP2</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass"/>
      Wstaw Unicode tylko do wiadomości tekstowych
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  let bypassEnabled = false;

  /*************************************
   * 2. Funkcja wstawiania Unicode do wiadomości
   *************************************/
  function insertUnicode(text) {
    if (typeof text === 'string' && text.trim().length > 1) {
      return [...text].join('\u200B'); // Wstaw Unicode (\u200B) między każdą literą
    }
    return text;
  }

  /*************************************
   * 3. Patch WebSocket
   *************************************/
  const originalWebSocketSend = WebSocket.prototype.send;

  WebSocket.prototype.send = function (data) {
    try {
      if (bypassEnabled && typeof data === 'string') {
        const parsed = JSON.parse(data);

        // Modyfikuj tylko wiadomości tekstowe
        if (parsed[1] && typeof parsed[1] === 'object' && parsed[1].messageContent) {
          console.log('[MSP2] Oryginalna wiadomość:', parsed[1].messageContent);
          parsed[1].messageContent = insertUnicode(parsed[1].messageContent);
          console.log('[MSP2] Zmieniona wiadomość:', parsed[1].messageContent);
        }

        data = JSON.stringify(parsed); // Przekształcenie z powrotem do JSON
      }
    } catch (e) {
      console.warn('[MSP2] Niepoprawny JSON lub inne dane:', data);
    }

    console.log('[MSP2] WebSocket wysyła dane:', data);
    return originalWebSocketSend.apply(this, arguments); // Wywołanie oryginalnej funkcji
  };

  /*************************************
   * 4. Obsługa checkboxa w menu
   *************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });
})();
