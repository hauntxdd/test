function loadStyle() {
  const style = document.createElement('style');
  style.innerHTML = `
    #msp2Menu {
      display: none;
      width: 350px;
      padding: 20px;
      background-color: #2b2b2b;
      border: 1px solid #555;
      border-radius: 8px;
      position: fixed;
      top: 50px;
      left: 50px;
      z-index: 9999;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #fff;
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
    }
    #msp2Menu h3 {
      color: #f0f0f0;
      font-size: 1.7em;
      margin-bottom: 20px;
      text-align: center;
    }
    #msp2Menu label {
      display: flex;
      align-items: center;
      margin: 15px 0;
    }
    #msp2Menu input[type="checkbox"] {
      margin-right: 12px;
      width: 20px;
      height: 20px;
    }
    #msp2ToggleBtn {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
      padding: 12px 18px;
      background-color: #007acc;
      border: none;
      border-radius: 5px;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2);
      transition: background-color 0.3s, transform 0.2s;
    }
    #msp2ToggleBtn:hover {
      background-color: #005a9e;
      transform: scale(1.05);
    }
    #msp2CloseBtn {
      margin-top: 20px;
      padding: 10px 15px;
      background-color: #007acc;
      border: none;
      color: white;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    #msp2CloseBtn:hover {
      background-color: #005a9e;
    }
  `;
  document.head.appendChild(style);
}

export function createMenu() {
  loadStyle();

  const toggleMenuBtn = document.createElement('button');
  toggleMenuBtn.id = 'msp2ToggleBtn';
  toggleMenuBtn.textContent = '⚙️ Menu MSP2';
  document.body.appendChild(toggleMenuBtn);

  const menu = document.createElement('div');
  menu.id = 'msp2Menu';
  menu.innerHTML = `
    <h3>🛠️ Bypass Chat Filter</h3>
    <label>
      <input type="checkbox" id="msp2CheckboxBypass"/>
      <span>Włącz Unicode w wiadomościach</span>
    </label>
    <button id="msp2CloseBtn">Zamknij</button>
  `;
  document.body.appendChild(menu);

  let isMenuVisible = false;
  toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;
    menu.style.display = isMenuVisible ? 'block' : 'none';
  });

  const closeMenuBtn = document.getElementById('msp2CloseBtn');
  closeMenuBtn.addEventListener('click', () => {
    menu.style.display = 'none';
    isMenuVisible = false;
  });
}