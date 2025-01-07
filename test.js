(function () {
  /*************************************
   * 1. Dodanie menu i stylów w stylu Primordial UI z zakładkami, dwoma kolumnami i możliwością przesuwania
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 600px; /* Zwiększona szerokość */
      height: 700px; /* Większa wysokość */
      padding: 25px;
      background-color: #121212;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      position: absolute;
      top: 50px;
      left: 50px;
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #f0f0f0;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
      cursor: move;
      overflow: auto; /* Dodane przewijanie dla dużej wysokości */
    }

    #msp2Menu h3 {
      color: #d1d1d1;
      font-size: 1.4em;
      margin-bottom: 20px;
      text-align: center;
      border-bottom: 1px solid #2a2a2a;
      padding-bottom: 10px;
      user-select: none;
    }

    .tabs {
      display: flex;
      justify-content: center;
      border-bottom: 1px solid #2a2a2a;
      margin-bottom: 15px;
    }

    .tab {
      flex: 1;
      text-align: center;
      padding: 8px; /* Rozmiar zakładek */
      cursor: pointer;
      color: #d1d1d1;
      background-color: #1c1c1c;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      font-size: 0.9em;
    }

    .tab.active {
      background-color: #007acc;
      color: white;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: flex;
      justify-content: space-between;
      gap: 20px; /* Odstęp między kolumnami */
    }

    .tree-column-container {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      width: 100%;
    }

    .tree-column {
      flex: 1;
      padding: 10px; /* Zwiększony padding */
      background-color: #1c1c1c;
      border-radius: 6px;
      margin: 10px 0;
      border: 1px solid #2a2a2a;
    }

    .tree-item {
      margin: 10px 0;
      padding: 10px; /* Zwiększony padding dla opcji */
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
      padding: 10px 16px; /* Zmniejszony rozmiar przycisku */
      background-color: #007acc;
      border: none;
      border-radius: 8px;
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
      transition: background-color 0.3s, transform 0.2s;
    }

    #msp2ToggleBtn:hover {
      background-color: #005a9e;
      transform: scale(1.05);
    }

    #msp2CloseBtn {
      margin-top: 15px;
      padding: 10px 16px;
      background-color: #007acc;
      border: none;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 15px;
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
      <div class="tree-column-container">
        <div class="tree-column">
          <h4>Misc Options - Left</h4>
          <div class="tree-item">
            <label><input type="checkbox" id="msp2CheckboxBypass" /> Turn off chat filter</label>
          </div>
          <div class="tree-item">
            <label><input type="checkbox" /> Misc Option 1</label>
          </div>
        </div>
        <div class="tree-column">
          <h4>Misc Options - Right</h4>
          <div class="tree-item">
            <label><input type="checkbox" /> Misc Option 2</label>
          </div>
          <div class="tree-item">
            <label><input type="checkbox" /> Misc Option 3</label>
          </div>
        </div>
      </div>
    </div>
    <div class="tab-content" id="profile">
      <div class="tree-column-container">
        <div class="tree-column">
          <h4>Profile Options - Left</h4>
          <div class="tree-item">
            <label><input type="checkbox" /> Profile Option 1</label>
          </div>
        </div>
        <div class="tree-column">
          <h4>Profile Options - Right</h4>
          <div class="tree-item">
            <label><input type="checkbox" /> Profile Option 2</label>
          </div>
        </div>
      </div>
    </div>
    <div class="tab-content" id="autoquiz">
      <div class="tree-column-container">
        <div class="tree-column">
          <h4>AutoQuiz Options - Left</h4>
          <div class="tree-item">
            <label><input type="checkbox" /> AutoQuiz Question 1</label>
          </div>
        </div>
        <div class="tree-column">
          <h4>AutoQuiz Options - Right</h4>
          <div class="tree-item">
            <label><input type="checkbox" /> AutoQuiz Question 2</label>
          </div>
        </div>
      </div>
    </div>
    <button id="msp2CloseBtn">Zamknij</button>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  let offsetX, offsetY;
  let isDragging = false;

  menu.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
      isDragging = true;
      offsetX = e.clientX - menu.getBoundingClientRect().left;
      offsetY = e.clientY - menu.getBoundingClientRect().top;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      menu.style.left = `${e.clientX - offsetX}px`;
      menu.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

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
