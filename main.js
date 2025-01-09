// main.js
import { createMenu } from './utils/menu.js';
import { modifyWebSocket } from './features/bypass_chat_filters.js';

(function () {
  let bypassEnabled = false;

  const menu = createMenu();
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');

  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
    modifyWebSocket(bypassEnabled);
  });
})();
