(function () {
  /*************************************
   * 1. Dodanie menu i stylów w stylu Primordial UI z zakładkami i drzewkami
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 500px;
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

    .tabs {
      display: flex;
      border-bottom: 1px solid #2a2a2a;
      margin-bottom: 20px;
    }

    .tab {
      flex: 1;
      text-align: center;
      padding: 10px;
      cursor: pointer;
      color: #d1d1d1;
      background-color: #1c1c1c;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    .tab.active {
      background-color: #007acc;
      color: white;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .tree-column {
      display: inline-block;
      width: 48%;
      vertical-align: top;
      padding: 10px;
      background-color: #1c1c1c;
      border-radius: 6px;
      margin: 10px 1%;
      border: 1px solid #2a2a2a;
    }

    .tree-item {
      margin: 10px 0;
      padding: 10px;
      background-color: #2b2b2b;
      border-radius: 6px;
      border: 1px solid #3a3a3a;
    }

    .tree-item label {
      display: flex;
      align-items: center;
    }

    .tree-item input[type="checkbox"] {
      margin-right: 10px;
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
    <div class="tabs">
      <div class="tab active" data-tab="misc">Misc</div>
      <div class="tab" data-tab="profile">Profile</div>
      <div class="tab" data-tab="autoquiz">AutoQuiz</div>
    </div>
    <div class="tab-content active" id="misc">
      <div class="tree-column">
        <h4>Opcje Misc 1</h4>
        <div class="tree-item">
          <label><input type="checkbox" /> Opcja 1</label>
        </div>
        <div class="tree-item">
          <label><input type="checkbox" /> Opcja 2</label>
        </div>
      </div>
      <div class="tree-column">
        <h4>Opcje Misc 2</h4>
        <div class="tree-item">
          <label><input type="checkbox" /> Opcja A</label>
        </div>
        <div class="tree-item">
          <label><input type="checkbox" /> Opcja B</label>
        </div>
      </div>
    </div>
    <div class="tab-content" id="profile">
      <div class="tree-column">
        <h4>Opcje Profilu 1</h4>
        <div class="tree-item">
          <label><input type="checkbox" /> Opcja 1</label>
        </div>
      </div>
      <div class="tree-column">
        <h4>Opcje Profilu 2</h4>
        <div class="tree-item">
          <label><input type="checkbox" /> Opcja X</label>
        </div>
      </div>
    </div>
    <div class="tab-content" id="autoquiz">
      <div class="tree-column">
        <h4>Opcje AutoQuiz 1</h4>
        <div class="tree-item">
          <label><input type="checkbox" /> Pytanie 1</label>
        </div>
      </div>
      <div class="tree-column">
        <h4>Opcje AutoQuiz 2</h4>
        <div class="tree-item">
          <label><input type="checkbox" /> Pytanie X</label>
        </div>
      </div>
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

  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
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
