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
      Wstaw Unicode tylko do wiadomości czatu
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  let bypassEnabled = false;

  function insertUnicodeIfTextField(message) {
    if (typeof message === 'string' && message.length > 1 && !message.includes("pingId") && !message.includes("position")) {
      return [...message].join('\u200B');
    }
    return message;
  }

  const OldWebSocket = window.WebSocket;

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

          // Sprawdzamy tylko prawdziwe wiadomości tekstowe
          if (parsed[1] && typeof parsed[1] === 'object') {
            if (parsed[1].messageType && parsed[1].messageType === "chat") {
              parsed[1].messageContent = insertUnicodeIfTextField(parsed[1].messageContent);
            }
          }

          data = JSON.stringify(parsed);
        } catch (e) {
          data = insertUnicodeIfTextField(data);
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
