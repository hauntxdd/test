(function () {
  /*************************************
   * 1. Dodanie menu i stylów w stylu Primordial UI z zakładkami i przesuwaniem
   *************************************/
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 600px;
      height: 700px;
      padding: 25px;
      background-color: #121212;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #f0f0f0;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
      cursor: move;
      overflow: auto;
    }

    #msp2Menu h3 {
      text-align: center;
      margin-bottom: 20px;
    }

    .tabs {
      display: flex;
      justify-content: center;
      border-bottom: 1px solid #2a2a2a;
    }

    .tab {
      padding: 10px 15px;
      cursor: pointer;
      background-color: #1c1c1c;
      color: #d1d1d1;
      border-radius: 6px 6px 0 0;
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
      gap: 20px;
    }

    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 10px 16px;
      background-color: #007acc;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    #msp2ToggleBtn:hover {
      background-color: #005a9e;
    }

    #msp2CloseBtn {
      margin-top: 15px;
      padding: 10px 16px;
      background-color: #007acc;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }

    #msp2CloseBtn:hover {
      background-color: #005a9e;
    }
  `;
  document.head.appendChild(style);

  /*************************************
   * 2. Tworzenie menu i przycisku
   *************************************/
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
        </div>
        <div class="tree-column">
          <h4>Misc Options - Right</h4>
          <div class="tree-item">
            <label><input type="checkbox" /> Misc Option 2</label>
          </div>
        </div>
      </div>
    </div>
    <div class="tab-content" id="profile">
      <h4>Profile Options</h4>
      <div class="tree-item">
        <label><input type="checkbox" /> Profile Option 1</label>
      </div>
    </div>
    <div class="tab-content" id="autoquiz">
      <h4>AutoQuiz Options</h4>
      <div class="tree-item">
        <label><input type="checkbox" /> AutoQuiz Question 1</label>
      </div>
    </div>
    <button id="msp2CloseBtn">Zamknij</button>
  `;
  document.body.appendChild(menu);

  /*************************************
   * 3. Funkcje zarządzania menu
   *************************************/
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  menu.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
      isDragging = true;
      offsetX = e.clientX - menu.getBoundingClientRect().left;
      offsetY = e.clientY - menu.getBoundingClientRect().top;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      const maxX = window.innerWidth - menu.offsetWidth;
      const maxY = window.innerHeight - menu.offsetHeight;
      menu.style.left = `${Math.max(0, Math.min(maxX, newX))}px`;
      menu.style.top = `${Math.max(0, Math.min(maxY, newY))}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  toggleMenuBtn.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('msp2CloseBtn').addEventListener('click', () => {
    menu.style.display = 'none';
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

  /*************************************
   * 4. WebSocket modyfikacja
   *************************************/
  let bypassEnabled = false;
  const originalWebSocketSend = WebSocket.prototype.send;

  WebSocket.prototype.send = function (data) {
    if (bypassEnabled && typeof data === 'string' && data.startsWith('42')) {
      try {
        const parsed = JSON.parse(data.substring(data.indexOf('[')));
        if (parsed[0] === 'chatv2:send' && parsed[1]?.message) {
          parsed[1].message = [...parsed[1].message].join('\u200B');
          data = `42${JSON.stringify(parsed)}`;
        }
      } catch (e) {
        console.error('[MSP2] Błąd parsowania:', e);
      }
    }
    originalWebSocketSend.call(this, data);
  };

  document.getElementById('msp2CheckboxBypass').addEventListener('change', (e) => {
    bypassEnabled = e.target.checked;
  });
})();
