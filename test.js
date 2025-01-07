(function () {
  /*************************************
   * 1. Dodanie menu i stylów w stylu ImGui
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 300px;
      padding: 20px;
      background-color: #1e1e1e; /* Ciemny szary */
      border: 1px solid #444;
      border-radius: 8px;
      position: fixed;
      top: 50px;
      left: 50px;
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #ffffff; /* Biały tekst */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    #msp2Menu h3 {
      color: #cccccc; /* Jasny szary */
      font-size: 1.5em;
      margin-bottom: 15px;
      text-align: center;
    }
    #msp2Menu label {
      display: flex;
      align-items: center;
      margin: 10px 0;
    }
    #msp2Menu input[type="checkbox"] {
      margin-right: 10px;
      width: 20px;
      height: 20px;
    }
    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 10px 15px;
      background-color: #007acc; /* Niebieski */
      border: none;
      border-radius: 4px;
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s;
    }
    #msp2ToggleBtn:hover {
      background-color: #005a9e; /* Ciemniejszy niebieski */
    }
    #msp2CloseBtn {
      margin-top: 15px;
      padding: 10px 15px;
      background-color: #007acc;
      border: none;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    #msp2CloseBtn:hover {
      background-color: #005a9e;
    }
  `;
  document.head.appendChild(style);

  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = '⚙️ Menu';
  document.body.appendChild(toggleMenuBtn);

  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>🛠️ Bypass Chat Filter</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass"/>
      <span>Włącz Unicode w wiadomościach</span>
    </label>
    <button id="msp2CloseBtn">Zamknij</button>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  const closeMenuBtn = document.getElementById('msp2CloseBtn');
  closeMenuBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    isMenuVisible = false;
  });

  let bypassEnabled = false;

  /*************************************
   * 2. Funkcja wstawiania znaków Unicode
   *************************************/
  function insertUnicode(text) {
    if (typeof text === 'string' && text.trim().length > 1) {
      return [...text].join('\u200B'); // Dodanie znaku zerowej szerokości między literami
    }
    return text;
  }

  /*************************************
   * 3. Modyfikacja WebSocket.send
   *************************************/
  const originalWebSocketSend = WebSocket.prototype.send;

  WebSocket.prototype.send = function (data) {
    console.log('[MSP2] WebSocket -> Oryginalne dane:', data);

    if (bypassEnabled && typeof data === 'string') {
      try {
        if (data.startsWith('42')) {
          const firstBracketIndex = data.indexOf('[');
          if (firstBracketIndex !== -1) {
            const payload = data.substring(firstBracketIndex);
            const parsed = JSON.parse(payload);
            const messageType = parsed[0];
            let messageContent = parsed[1];

            // Obsługa wiadomości "chatv2:send"
            if (messageType === 'chatv2:send' && messageContent && (messageContent.message || messageContent.messageContent)) {
              const originalMessage = messageContent.message || messageContent.messageContent;
              console.log('[MSP2] Wykryto wiadomość chat:', originalMessage);

              // Wstawienie Unicode tylko dla tekstowych wiadomości
              if (typeof originalMessage === 'string') {
                const modifiedMessage = insertUnicode(originalMessage);
                console.log('[MSP2] Po przekształceniu:', modifiedMessage);

                if (messageContent.message) {
                  messageContent.message = modifiedMessage;
                } else {
                  messageContent.messageContent = modifiedMessage;
                }
              }

              const newPayload = `42["${messageType}",${JSON.stringify(messageContent)}]`;
              console.log('[MSP2] WebSocket -> Zmodyfikowane dane:', newPayload);
              return originalWebSocketSend.call(this, newPayload);
            }
          }
        }
      } catch (e) {
        console.warn('[MSP2] Błąd parsowania danych:', e, data);
      }
    }

    console.log('[MSP2] WebSocket wysyła dane:', data);
    return originalWebSocketSend.call(this, data);
  };

  /*************************************
   * 4. Obsługa checkboxa
   *************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });
})();

