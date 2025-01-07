(function() {
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
      Włącz Unicode dla wiadomości tekstowych
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  let bypassEnabled = false;

  function toUnicode(str) {
    return str.split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
  }

  const OldWebSocket = window.WebSocket;

  // Proxy WebSocket - zamiast zmieniać prototyp
  window.WebSocket = class extends OldWebSocket {
    constructor(url, protocols) {
      super(url, protocols);
      this.addEventListener('message', (event) => {
        console.log('[MSP2] Otrzymano wiadomość:', event.data);
      });
    }

    send(data) {
      if (bypassEnabled && typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.message && typeof parsed.message === 'string') {
            parsed.message = toUnicode(parsed.message);
          }
          if (parsed.data && typeof parsed.data === 'object') {
            for (const key in parsed.data) {
              if (typeof parsed.data[key] === 'string' && key.toLowerCase().includes('message')) {
                parsed.data[key] = toUnicode(parsed.data[key]);
              }
            }
          }
          data = JSON.stringify(parsed);
        } catch (e) {
          data = toUnicode(data);
        }
        console.log('[MSP2] Wysłano zmodyfikowaną wiadomość:', data);
      }
      super.send(data);
    }
  };

  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });
})();
