// utils/menu.js
export function createMenu() {
    const style = document.createElement('style');
    style.innerHTML = `
      #msp2Menu {
        display: none;
        width: 600px;
        height: 700px;
        padding: 25px;
        background-color: #121212;
        border: 1px solid #2a2a2a;
        border-radius: 10px;
        position: absolute;
        top: 50px;
        left: 50px;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #f0f0f0;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
        cursor: move;
        overflow: hidden;
      }
  
      #msp2Menu h3 {
        color: #d1d1d1;
        font-size: 1.4em;
        margin-bottom: 20px;
        text-align: center;
        border-bottom: 1px solid #2a2a2a;
        padding-bottom: 10px;
        user-select: none;
      }
  
      .tabs {
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #2a2a2a;
        margin-bottom: 15px;
      }
  
      .tab {
        flex: 1;
        text-align: center;
        padding: 8px;
        cursor: pointer;
        color: #d1d1d1;
        background-color: #1c1c1c;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        font-size: 0.9em;
      }
  
      .tab.active {
        background-color: #007acc;
        color: white;
      }
  
      .tab-content {
        display: none;
        height: calc(100% - 110px);
        padding-bottom: 50px;
        box-sizing: border-box;
      }
  
      .tab-content.active {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        height: calc(100% - 100px);
      }
  
      .tree-column-container {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #2a2a2a;
        background-color: #1a1a1a;
        border-radius: 8px;
        outline: 1px solid #2a2a2a;
      }
  
      .tree-column {
        flex: 1;
        padding: 10px;
        background-color: #1c1c1c;
        border-radius: 6px;
        border: 1px solid #2a2a2a;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        outline: 1px solid #2a2a2a;
        position: relative;
      }
  
      .tree-column h4 {
        font-size: 0.9em;
        font-weight: bold;
        padding: 2px 8px;
        background-color: #1c1c1c;
        color: #d1d1d1;
        position: relative;
        top: -10px;
        margin: 0;
        border: 1px solid #2a2a2a;
        border-radius: 4px;
        width: fit-content;
        text-align: center;
      }
  
      .tree-item {
        margin: 10px 0;
        padding: 10px;
        background-color: #2b2b2b;
        border-radius: 6px;
        border: 1px solid #3a3a3a;
      }
  
      .tree-item label {
        display: flex;
        align-items: center;
      }
  
      .tree-item input[type="checkbox"] {
        margin-right: 10px;
      }
  
      #msp2ToggleBtn {
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        padding: 10px 16px;
        background-color: #007acc;
        border: none;
        border-radius: 8px;
        color: #ffffff;
        font-size: 16px;
        cursor: pointer;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        transition: background-color 0.3s, transform 0.2s;
      }
  
      #msp2ToggleBtn:hover {
        background-color: #005a9e;
        transform: scale(1.05);
      }
  
      .footer {
        text-align: right;
        font-size: 0.8em;
        color: #888;
        position: absolute;
        bottom: 10px;
        right: 10px;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  
    const toggleMenuBtn = document.createElement('button');
    toggleMenuBtn.id = 'msp2ToggleBtn';
    toggleMenuBtn.textContent = '⚙️ Menu';
    document.body.appendChild(toggleMenuBtn);
  
    const menu = document.createElement('div');
    menu.id = 'msp2Menu';
    menu.innerHTML = `
      <h3>🛠️ Bypass Chat Filter</h3>
      <div class="tabs">
        <div class="tab active" data-tab="misc">Misc</div>
        <div class="tab" data-tab="profile">Profile</div>
        <div class="tab" data-tab="autoquiz">AutoQuiz</div>
      </div>
      <div class="tab-content active" id="misc">
        <div class="tree-column-container">
          <div class="tree-column">
            <h4>Settings</h4>
            <div class="tree-item">
              <label><input type="checkbox" id="msp2CheckboxBypass" /> Turn off chat filter</label>
            </div>
            <div class="tree-item">
              <label><input type="checkbox" /> Misc Option 1</label>
            </div>
          </div>
          <div class="tree-column">
            <h4>Additional Settings</h4>
            <div class="tree-item">
              <label><input type="checkbox" /> Misc Option 2</label>
            </div>
            <div class="tree-item">
              <label><input type="checkbox" /> Misc Option 3</label>
            </div>
          </div>
        </div>
      </div>
      <div class="tab-content" id="profile">
        <div class="tree-column-container">
          <div class="tree-column">
            <h4>Profile Settings</h4>
            <div class="tree-item">
              <label><input type="checkbox" /> Profile Option 1</label>
            </div>
          </div>
          <div class="tree-column">
            <h4>Other Profile Settings</h4>
            <div class="tree-item">
              <label><input type="checkbox" /> Profile Option 2</label>
            </div>
          </div>
        </div>
      </div>
      <div class="tab-content" id="autoquiz">
        <div class="tree-column-container">
          <div class="tree-column">
            <h4>Quiz Options</h4>
            <div class="tree-item">
              <label><input type="checkbox" /> AutoQuiz Question 1</label>
            </div>
          </div>
          <div class="tree-column">
            <h4>Other Quiz Options</h4>
            <div class="tree-item">
              <label><input type="checkbox" /> AutoQuiz Question 2</label>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">Made by kokaina</div>
    `;
    document.body.appendChild(menu);
  
    let isMenuVisible = false;
    let offsetX, offsetY;
    let isDragging = false;
  
    menu.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
        isDragging = true;
        offsetX = e.clientX - menu.getBoundingClientRect().left;
        offsetY = e.clientY - menu.getBoundingClientRect().top;
      }
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        menu.style.left = `${e.clientX - offsetX}px`;
        menu.style.top = `${e.clientY - offsetY}px`;
      }
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  
    toggleMenuBtn.addEventListener('click', () => {
      isMenuVisible = !isMenuVisible;
      menu.style.display = isMenuVisible ? 'block' : 'none';
    });
  
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
  
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  
    return menu;
  }