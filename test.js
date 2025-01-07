(function() {
  // 1. Dodaj style
  const style = document.createElement('style');
  style.innerHTML = `
    /* Styl menu */
    #msp2Menu {
      display: none;              /* Domyślnie ukryte */
      width: 200px;
      padding: 10px;
      background-color: #f5f5f5;
      border: 2px solid #ccc;
      border-radius: 4px;
      position: fixed;            /* stałe położenie */
      top: 50px;
      left: 50px;
      z-index: 9999;             /* żeby przykrywało inne elementy */
      font-family: sans-serif;    /* przykład */
    }

    /* Przycisk otwierania/zamykania menu */
    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 5px 10px;
      cursor: pointer;
      font-family: sans-serif;    /* przykład */
    }

    /* Nagłówek w menu */
    #msp2Menu h3 {
      margin: 0 0 10px 0;
    }

    /* Przykładowe formatowanie etykiety od checkboxa */
    #msp2Menu label {
      display: block;
      margin-top: 10px;
    }
  `;
  document.head.appendChild(style);

  // 2. Stwórz przycisk do otwierania/zamykania
  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = 'Otwórz/Zamknij menu';
  document.body.appendChild(toggleMenuBtn);

  // 3. Stwórz kontener menu
  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>Moje Menu</h3>
    <label>
      <input type="checkbox" id="msp2Checkbox" />
      Wyłącz cenzurę + analytics
    </label>
  `;
  document.body.appendChild(menu);

  // 4. Logika otwierania/zamykania
  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  // 5. Obsługa checkboxa
  const myCheckbox = document.getElementById('msp2Checkbox');
  
  myCheckbox.addEventListener('change', () => {
    if (myCheckbox.checked) {
      console.log('[MSP2] Checkbox zaznaczony – wyłączamy filtr (cenzurę) i blokujemy analytics.');

      // ===== 5A: Wyłączanie cenzury (nadpisanie sanitizeMessage) =====
      if (typeof window.sanitizeMessage === 'function') {
        // Zapisz oryginalną funkcję, aby móc ją przywrócić
        window._originalSanitizeMessage = window.sanitizeMessage;

        // Nadpisz funkcję tak, by zwracała oryginalny tekst
        window.sanitizeMessage = function(text) {
          console.log('[MSP2] Cenzura wyłączona, zwracam oryginalny tekst:', text);
          return text;
        };
      }

      // ===== 5B: Blokowanie endpointu analytics (monkey-patching fetch) =====
      if (!window._originalFetch) {
        // Zachowaj oryginalne fetch
        window._originalFetch = window.fetch;
        
        window.fetch = async function(resource, config) {
          if (typeof resource === 'string' && resource.includes('analytics.eu.moviestarplanet.app')) {
            console.log('[MSP2] Blokuję żądanie do analytics:', resource);
            // Zwracamy "pustą" odpowiedź 200 OK
            return Promise.resolve(new Response('', {
              status: 200,
              statusText: 'OK',
            }));
          }
          // W innych przypadkach wykonuj oryginalny fetch
          return window._originalFetch.apply(this, arguments);
        };
      }
    } else {
      console.log('[MSP2] Checkbox odznaczony – przywracamy cenzurę i odblokowujemy analytics.');

      // ===== 5A: Przywracanie cenzury =====
      if (window._originalSanitizeMessage) {
        window.sanitizeMessage = window._originalSanitizeMessage;
        delete window._originalSanitizeMessage;
      }

      // ===== 5B: Przywracanie oryginalnego fetcha (odblokowanie analytics) =====
      if (window._originalFetch) {
        window.fetch = window._originalFetch;
        delete window._originalFetch;
      }
    }
  });
})();
