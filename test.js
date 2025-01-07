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
      Wyłącz cenzurę
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
      // Włączamy "wyłączenie" cenzury
      console.log('[MSP2] Checkbox zaznaczony - wyłączamy filtr (cenzurę).');

      // Sprawdzamy, czy istnieje jakaś domniemana funkcja sanitizeMessage
      if (typeof window.sanitizeMessage === 'function') {
        // Zapisz oryginalną funkcję, aby móc ją przywrócić
        window._originalSanitizeMessage = window.sanitizeMessage;

        // Nadpisz funkcję tak, by zwracała oryginalny tekst
        window.sanitizeMessage = function(text) {
          console.log('[MSP2] Cenzura wyłączona, zwracam oryginalny tekst:', text);
          return text;
        };
      }
    } else {
      // Przywracamy cenzurę, jeśli była wcześniej wyłączona
      console.log('[MSP2] Checkbox odznaczony - przywracamy oryginalny filtr.');

      if (window._originalSanitizeMessage) {
        window.sanitizeMessage = window._originalSanitizeMessage;
        delete window._originalSanitizeMessage; // Usuwamy tymczasową zmienną
      }
    }
  });
})();
