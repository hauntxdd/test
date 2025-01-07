(function () {
  /*************************************
   * 1. Dodanie menu i stylów
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
      Włącz Unicode w wiadomościach
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
