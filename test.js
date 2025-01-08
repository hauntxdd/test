(function() {
    async function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  
    async function initialize() {
      try {
        console.log('[MSP2] Ładowanie modułów...');
  
        // Ładowanie plików skryptów z repozytorium lub lokalnych ścieżek
        await loadScript('https://raw.githubusercontent.com/hauntxdd/test/main/utils/menu.js');
        await loadScript('https://raw.githubusercontent.com/hauntxdd/test/main/features/bypassfilterchat.js');
  
        console.log('[MSP2] Tworzenie menu...');
        window.msp2Menu.createMenu();
  
        console.log('[MSP2] Włączanie bypassu WebSocket...');
        window.msp2BypassFilter.overrideWebSocketSend();
  
        console.log('[MSP2] Gotowe!');
      } catch (err) {
        console.error('[MSP2] Błąd podczas ładowania modułów:', err);
      }
    }
  
    initialize();
  })();