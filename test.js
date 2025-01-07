(function () {
  /*************************************
   * 1. Dodanie menu UI w stylu Primordial z zakładkami i przeniesieniem checkboxów
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

    .tab-container {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
    }

    .tab {
      padding: 10px 20px;
      background-color: #222222;
      border-radius: 8px;
      cursor: pointer;
      color: white;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .tab:hover {
      background-color: #444444;
    }

    .tab.active {
      background-color: #6e00ff;
    }

    .menu-section {
      display: none;
      border: 1px solid #444444;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .menu-section.active {
      display: block;
    }

    .menu-section h4 {
      margin-bottom: 12px;
      font-size: 1.4em;
      color: #b0b0b0;
      text-align: center;
    }

    .menu-label {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 10px 0;
      padding: 10px;
      background-color: #222222;
      border-radius: 6px;
      border: 1px solid #333333;
    }

    .menu-label span {
      margin-left: 10px;
    }

    .menu-label input[type="checkbox"] {
      margin-right: 10px;
      width: 24px;
      height: 24px;
      accent-color: #ff007a;
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
  `;
  document.head.appendChild(style);

  const menu = document.createElement('div');
  menu.id = 'primordialMenu';
  menu.innerHTML = `
    <h3>⚙️ Bypass Chat Filter</h3>
    <div class="tab-container">
      <div class="tab active" data-tab="profile">Profile</div>
      <div class="tab" data-tab="misc">Misc</div>
      <div class="tab" data-tab="autoquiz">Autoquiz</div>
    </div>
    <div class="menu-section active" id="profile">
      <h4>Profile Settings</h4>
      <label class="menu-label">
        <input type="checkbox" id="bypassChatToggle" />
        <span>Bypass chat filter</span>
      </label>
      <label class="menu-label">
        <input type="checkbox" id="autoSaveProfileToggle" />
        <span>Auto-save profile settings</span>
      </label>
    </div>
    <div class="menu-section" id="misc">
      <h4>Misc Options</h4>
      <label class="menu-label">
        <input type="checkbox" id="removeSmokeToggle" />
        <span>Remove smoke effects</span>
      </label>
      <label class="menu-label">
        <input type="checkbox" id="removeFlashToggle" />
        <span>Remove flash effects</span>
      </label>
    </div>
    <div class="menu-section" id="autoquiz">
      <h4>Autoquiz Settings</h4>
      <label class="menu-label">
        <input type="checkbox" id="autoQuizToggle" />
        <span>Enable auto quiz hints</span>
      </label>
      <label class="menu-label">
        <input type="checkbox" id="notifyCorrectAnswersToggle" />
        <span>Notify correct answers</span>
      </label>
    </div>
    <button id="primordialCloseBtn">Zamknij Menu</button>
  `;
  document.body.appendChild(menu);

  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.menu-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
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

