// main.js
(async function () {
  try {
    // Dynamically import `menu.js`
    const menuModule = await import('https://cdn.jsdelivr.net/gh/hauntxdd/test@main/utils/menu.js');
    const featuresModule = await import('https://cdn.jsdelivr.net/gh/hauntxdd/test@main/features/bypasschatfilters.js');

    const createMenu = menuModule.createMenu;
    const modifyWebSocket = featuresModule.modifyWebSocket;

    let bypassEnabled = false;

    // Tworzenie menu
    const menu = createMenu();
    const bypassCheckbox = document.getElementById('msp2CheckboxBypass');

    bypassCheckbox.addEventListener('change', () => {
      bypassEnabled = bypassCheckbox.checked;
      console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
      modifyWebSocket(bypassEnabled);
    });
  } catch (error) {
    console.error('[MSP2] Błąd podczas importu modułów:', error);
  }
})();
