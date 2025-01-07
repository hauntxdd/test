document.addEventListener('DOMContentLoaded', () => {
  let bypassEnabled = false;

  window.createMenu();
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });

  window.modifyWebSocket(() => bypassEnabled);
});
