export function createMenu() {
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
        Włącz Unicode w wiadomościach
      </label>
    `;
    document.body.appendChild(menu);
  
    let isMenuVisible = false;
    toggleMenuBtn.addEventListener('click', () => {
      isMenuVisible = !isMenuVisible;
      menu.style.display = isMenuVisible ? 'block' : 'none';
    });
  }