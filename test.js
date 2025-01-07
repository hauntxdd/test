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

  let originalWebSocketSend = WebSocket.prototype.send;

  // Funkcja zamieniająca string na Unicode escape (np. "abc" -> "\u0061\u0062\u0063")
  function toUnicode(str) {
    return str.split('').map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
  }

  function installBypass() {
    console.log('[MSP2] Bypass Unicode aktywowany.');
    
    WebSocket.prototype.send = function(data) {
      let patchedData = data;

      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);

          // Obsługuj tylko pola, które wyglądają na wiadomości użytkownika
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

          patchedData = JSON.stringify(parsed);
        } catch (e) {
          patchedData = toUnicode(data); // Jeżeli to nie JSON, traktuj jako zwykły tekst
        }
      }

      console.log('[MSP2] WebSocket -> było:', data, '=> wysyłam jako Unicode:', patchedData);
      return originalWebSocketSend.call(this, patchedData);
    };
  }

  function uninstallBypass() {
    WebSocket.prototype.send = originalWebSocketSend;
    console.log('[MSP2] Bypass Unicode wyłączony, przywrócono oryginalny WebSocket.');
  }

  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    if (bypassCheckbox.checked) {
      installBypass();
    } else {
      uninstallBypass();
    }
  });
})();
