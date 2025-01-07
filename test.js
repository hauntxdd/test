(function () {
  /*************************************
   * 1. Dodanie menu i stylów w stylu Primordial UI z checkboxami po lewej stronie
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 400px;
      padding: 25px;
      background-color: #121212; /* Głęboki czarny odcień */
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      position: fixed;
      top: 50px;
      left: 50px;
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #f0f0f0; /* Jasno biały tekst */
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
    }

    #msp2Menu h3 {
      color: #d1d1d1; /* Szary odcień */
      font-size: 1.7em;
      margin-bottom: 20px;
      text-align: center;
      border-bottom: 1px solid #2a2a2a;
      padding-bottom: 10px;
    }

    #msp2Menu label {
      display: flex;
      align-items: center;
      margin: 15px 0;
      padding: 10px;
      background-color: #1c1c1c;
      border-radius: 6px;
      border: 1px solid #2a2a2a;
    }

    #msp2Menu label span {
      margin-left: 10px;
      font-size: 1.1em;
    }

    #msp2Menu input[type="checkbox"] {
      margin-right: 10px;
      width: 20px;
      height: 20px;
      accent-color: #007acc; /* Niebieski odcień */
    }

    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 12px 18px;
      background-color: #007acc; /* Niebieski */
      border: none;
      border-radius: 8px;
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
      transition: background-color 0.3s, transform 0.2s;
    }

    #msp2ToggleBtn:hover {
      background-color: #005a9e; /* Ciemniejszy niebieski */
      transform: scale(1.05);
    }

    #msp2CloseBtn {
      margin-top: 20px;
      padding: 12px 18px;
      background-color: #007acc;
      border: none;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      width: 100%;
      transition: background-color 0.3s;
    }

    #msp2CloseBtn:hover {
      background-color: #005a9e;
    }

    .menu-section {
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .menu-section h4 {
      margin: 0 0 10px 0;
      font-size: 1.2em;
      color: #d1d1d1;
      text-align: center;
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
    <div class="menu-section">
      <h4>Opcje</h4>
      <label>
        <input type="checkbox" id="msp2CheckboxBypass"/>
        <span>Włącz Unicode w wiadomościach</span>
      </label>
    </div>
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

