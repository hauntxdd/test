import { createMenu } from './menu.js';
import { modifyWebSocket } from './features/chatfilter.js';

document.addEventListener('DOMContentLoaded', () => {
  let bypassEnabled = false;

  createMenu();
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });

  modifyWebSocket(() => bypassEnabled);
});
