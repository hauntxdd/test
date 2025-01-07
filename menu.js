export function createMenu() {
    const style = document.createElement('style');
    style.innerHTML = `
      #msp2Menu {
        display: none;
        width: 300px;
        padding: 20px;
        background-color: #1e1e1e;
        border: 1px solid #555;
        border-radius: 8px;
        position: fixed;
        top: 50px;
        left: 50px;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #fff;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      #msp2Menu h3 {
        color: #dcdcdc;
        font-size: 1.5em;
        margin-bottom: 15px;
      }
      #msp2Menu label {
        display: flex;
        align-items: center;
        margin: 10px 0;
      }
      #msp2Menu input[type="checkbox"] {
        margin-right: 10px;
        width: 18px;
        height: 18px;
      }
      #msp2ToggleBtn {
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        padding: 10px 15px;
        background-color: #007acc;
        border: none;
        border-radius: 4px;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s;
      }
      #msp2ToggleBtn:hover {
        background-color: #005a9e;
      }
    `;
    document.head.appendChild(style);
  
    const toggleMenuBtn = document.createElement('button');
    toggleMenuBtn.id = 'msp2ToggleBtn';
    toggleMenuBtn.textContent = '🛠️ Otwórz/Zamknij menu';
    document.body.appendChild(toggleMenuBtn);
  
    const menu = document.createElement('div');
    menu.id = 'msp2Menu';
    menu.innerHTML = `
      <h3>⚙️ made by @kokaina</h3>
      <label>
        <input type="checkbox" id="msp2CheckboxBypass"/>
        <span>wylacz filtr chatu</span>
      </label>
      <button id="closeMenuBtn" style="margin-top: 15px; padding: 8px 12px; background-color: #007acc; border: none; color: white; border-radius: 4px; cursor: pointer;">Zamknij</button>
    `;
    document.body.appendChild(menu);
  
    let isMenuVisible = false;
    toggleMenuBtn.addEventListener('click', () => {
      isMenuVisible = !isMenuVisible;
      menu.style.display = isMenuVisible ? 'block' : 'none';
    });
  
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    closeMenuBtn.addEventListener('click', () => {
      menu.style.display = 'none';
      isMenuVisible = false;
    });
  }
  