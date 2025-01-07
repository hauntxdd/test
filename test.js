(function () {
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
      Wstaw Unicode tylko do wiadomości tekstowych
    </label>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  let bypassEnabled = false;

  // Wstawia Unicode tylko do tekstów czatu
  function insertUnicode(text) {
    if (typeof text === 'string' && text.trim().length > 1) {
      return [...text].join('\u200B'); // Wstaw Unicode między każdą literą
    }
    return text;
  }

  const OldWebSocket = window.WebSocket;

  window.WebSocket = class extends OldWebSocket {
    constructor(url, protocols) {
      super(url, protocols);
      this.addEventListener('message', (event) => {
        console.log('[MSP2] Odebrano wiadomość WebSocket:', event.data);
      });
    }

    send(data) {
      if (bypassEnabled && typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);

          // Modyfikujemy tylko pola messageContent lub teksty czatu
          if (parsed[1] && typeof parsed[1] === 'object' && parsed[1].messageContent) {
            console.log('[MSP2] Przetwarzanie wiadomości tekstowej: ', parsed[1].messageContent);
            parsed[1].messageContent = insertUnicode(parsed[1].messageContent);
          }

          data = JSON.stringify(parsed);
        } catch (e) {
          console.warn('[MSP2] Nie można sparsować wiadomości:', e);
        }
      }
      console.log('[MSP2] Wysyłana wiadomość WebSocket:', data);
      super.send(data);
    }
  };

  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });
})();
