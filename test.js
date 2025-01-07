(function () {
  /*************************************
   * 1. Dodanie menu UI w stylu Primordial
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #primordialMenu {
      display: none;
      width: 500px;
      padding: 30px;
      background-color: #181818;
      border: 1px solid #333333;
      border-radius: 12px;
      position: fixed;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      color: #f5f5f5;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
    }

    #primordialMenu h3 {
      color: #c0c0c0;
      font-size: 1.8em;
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #333333;
      padding-bottom: 12px;
    }

    #primordialMenu label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 10px 0;
      padding: 10px;
      background-color: #222222;
      border-radius: 6px;
      border: 1px solid #333333;
    }

    #primordialMenu input[type="checkbox"] {
      margin-left: 10px;
      width: 24px;
      height: 24px;
      accent-color: #ff007a; /* Customowy kolor */
    }

    #primordialToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 15px 20px;
      background-color: #6e00ff; /* Fiolet */
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
      transition: background-color 0.4s, transform 0.2s;
    }

    #primordialToggleBtn:hover {
      background-color: #5200b2; /* Ciemniejszy fiolet */
      transform: scale(1.05);
    }

    #primordialCloseBtn {
      margin-top: 20px;
      padding: 14px 20px;
      background-color: #ff007a;
      border: none;
      color: white;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      width: 100%;
      transition: background-color 0.4s;
    }

    #primordialCloseBtn:hover {
      background-color: #b2005d;
    }

    .menu-section {
      border: 1px solid #444444;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .menu-section h4 {
      margin-bottom: 12px;
      font-size: 1.4em;
      color: #b0b0b0;
      text-align: center;
    }
  `;
  document.head.appendChild(style);

  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'primordialToggleBtn';
  toggleMenuBtn.textContent = '⚙️ Otwórz menu';
  document.body.appendChild(toggleMenuBtn);

  const menu = document.createElement('div');
  menu.id = 'primordialMenu';
  menu.innerHTML = `
    <h3>⚙️ Primordial Menu</h3>
    <div class="menu-section">
      <h4>Ustawienia Widoku</h4>
      <label>
        <span>Render FOV (Kąt widzenia)</span>
        <input type="range" id="fovSlider" min="0" max="180" step="5" value="90"/>
      </label>
      <label>
        <span>Viewmodel Offset</span>
        <input type="checkbox" id="viewOffsetToggle"/>
      </label>
    </div>
    <div class="menu-section">
      <h4>Usuwanie efektów</h4>
      <label>
        <span>Usuń Dym</span>
        <input type="checkbox" id="removeSmokeToggle"/>
      </label>
      <label>
        <span>Usuń Flash</span>
        <input type="checkbox" id="removeFlashToggle"/>
      </label>
    </div>
    <div class="menu-section">
      <h4>Efekty Wizualne</h4>
      <label>
        <span>Zmniejszone światło</span>
        <input type="checkbox" id="dimLightsToggle"/>
      </label>
      <label>
        <span>Tryb klauna (kolorowe efekty)</span>
        <input type="checkbox" id="clownModeToggle"/>
      </label>
    </div>
    <button id="primordialCloseBtn">Zamknij Menu</button>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  const closeMenuBtn = document.getElementById('primordialCloseBtn');
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

