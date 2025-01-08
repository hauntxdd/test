(function () {
  /*************************************
   * 1. Dodanie menu i stylów w stylu Primordial UI z zakładkami, dwoma kolumnami i możliwością przesuwania
   *************************************/
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
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
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
      justify-content: center;
      gap: 20px;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid #2a2a2a;
      background-color: #1a1a1a;
      border-radius: 8px;
      outline: 1px solid #2a2a2a;
    }

    .autoquiz-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .autoquiz-controls input {
      padding: 6px;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      background-color: #1c1c1c;
      color: white;
      width: 100%;
      text-align: center;
    }

    .autoquiz-controls button {
      padding: 10px 20px;
      background-color: #007acc;
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .autoquiz-controls button:hover {
      background-color: #005a9e;
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
      </div>
    </div>
    <div class="tab-content" id="autoquiz">
      <div class="autoquiz-controls">
        <h4>Automatic Quiz Controls</h4>
        <input type="text" id="languageInput" placeholder="Enter language code (e.g., sv_SE)" />
        <button id="startQuizButton">Start Quiz</button>
        <p id="quizStatus">Status: Waiting to start...</p>
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

  let bypassEnabled = false;

  /*************************************
   * 2. Funkcja wstawiania znaków Unicode
   *************************************/
  function insertUnicode(text) {
    if (typeof text === 'string' && text.trim().length > 1) {
      return [...text].join('\u200B'); // Dodanie znaku zerowej szerokości między literami
    }
    return text;
  }

  /*************************************
   * 3. Modyfikacja WebSocket.send
   *************************************/
  const originalWebSocketSend = WebSocket.prototype.send;

  WebSocket.prototype.send = function (data) {
    console.log('[MSP2] WebSocket -> Oryginalne dane:', data);

    if (bypassEnabled && typeof data === 'string') {
      try {
        if (data.startsWith('42')) {
          const firstBracketIndex = data.indexOf('[');
          if (firstBracketIndex !== -1) {
            const payload = data.substring(firstBracketIndex);
            const parsed = JSON.parse(payload);
            const messageType = parsed[0];
            let messageContent = parsed[1];

            // Obsługa wiadomości "chatv2:send"
            if (messageType === 'chatv2:send' && messageContent && (messageContent.message || messageContent.messageContent)) {
              const originalMessage = messageContent.message || messageContent.messageContent;
              console.log('[MSP2] Wykryto wiadomość chat:', originalMessage);

              // Wstawienie Unicode tylko dla tekstowych wiadomości
              if (typeof originalMessage === 'string') {
                const modifiedMessage = insertUnicode(originalMessage);
                console.log('[MSP2] Po przekształceniu:', modifiedMessage);

                if (messageContent.message) {
                  messageContent.message = modifiedMessage;
                } else {
                  messageContent.messageContent = modifiedMessage;
                }
              }

              const newPayload = `42["${messageType}",${JSON.stringify(messageContent)}]`;
              console.log('[MSP2] WebSocket -> Zmodyfikowane dane:', newPayload);
              return originalWebSocketSend.call(this, newPayload);
            }
          }
        }
      } catch (e) {
        console.warn('[MSP2] Błąd parsowania danych:', e, data);
      }
    }

    console.log('[MSP2] WebSocket wysyła dane:', data);
    return originalWebSocketSend.call(this, data);
  };

  /*************************************
   * 4. Obsługa checkboxa
   *************************************/
  const bypassCheckbox = document.getElementById('msp2CheckboxBypass');
  bypassCheckbox.addEventListener('change', () => {
    bypassEnabled = bypassCheckbox.checked;
    console.log(`[MSP2] Bypass Unicode ${bypassEnabled ? 'włączony' : 'wyłączony'}`);
  });

  /*************************************
   * 5. Obsługa AutoQuiz
   *************************************/
  document.getElementById('startQuizButton').addEventListener('click', () => {
    const lang = document.getElementById('languageInput').value.trim();
    if (!lang) {
      alert('Please enter a valid language code.');
      return;
    }
    init(lang);
  });

  let sockets = [];
  let answers = {};
  let localization = {};

  function init(lang) {
    document.getElementById('quizStatus').textContent = `Status: Loading localization data...`;
    get(`https://msp2-static.mspcdns.com/translations/multiplayergames/quiz/${lang}/localization_data.txt`, 'text',
      function (err, data) {
        if (err !== null) {
          alert('Something went wrong: ' + err);
        } else {
          localization = {};
          data.split("\r").forEach(d => {
            if (d.includes("ANSWER")) {
              let match = /Q(\d{0,4})_ANSWER(\d)=(.+)/g.exec(d);
              let questionID = match[1];
              let answerIndex = match[2];
              let answerText = match[3];
              if (!localization.hasOwnProperty(questionID)) {
                localization[questionID] = {};
              }
              localization[questionID][answerIndex - 1] = answerText;
            }
          });
          get('https://raw.githubusercontent.com/LiterallyFabian/auto-starquiz/master/answers.json', 'json',
            function (err, data) {
              if (err !== null) {
                alert('Something went wrong: ' + err);
              } else {
                answers = data;
                sockets = [];
                const nativeWebSocket = window.WebSocket;
                window.WebSocket = function (...args) {
                  const socket = new nativeWebSocket(...args);
                  sockets.push(socket);
                  return socket;
                };
                document.getElementById('quizStatus').textContent = `Status: Waiting for game...`;
                checkSockets();
              }
            });
        }
      });
  }

  function checkSockets() {
    if (sockets.length === 0) {
      window.setTimeout(checkSockets, 100);
    } else {
      document.getElementById('quizStatus').textContent = `Status: Game found. Listening...`;
      runGame(sockets[0]);
    }
  }

  function runGame(ws) {
    ws.addEventListener('message', function (event) {
      let match = /42.+quiz:chal.+QUIZ_.+Q(\d{0,3})_QUESTION/gm.exec(event.data);
      if (match != null) {
        let id = match[1];
        let ans = answers[id];
        const answerText = localization[id] ? localization[id][ans] : 'No answer available';
        document.getElementById('quizStatus').textContent = `Answer: ${answerText}`;
        console.log(`%cAnswer: ${answerText}`, "color: red; font-size: 1.5em;");
      }
    });
  }

  function get(url, responseType, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = responseType;
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(null, xhr.response);
      } else {
        callback(xhr.status, xhr.response);
      }
    };
    xhr.send();
  }
})();
