export function insertUnicode(text) {
  if (typeof text === 'string' && text.trim().length > 1) {
    return [...text].join('\u200B');
  }
  return text;
}

export function modifyWebSocket(bypassEnabled) {
  const originalWebSocketSend = WebSocket.prototype.send;

  WebSocket.prototype.send = function (data) {
    if (bypassEnabled() && typeof data === 'string') {
      try {
        if (data.startsWith('42')) {
          const firstBracketIndex = data.indexOf('[');
          if (firstBracketIndex !== -1) {
            const payload = data.substring(firstBracketIndex);
            const parsed = JSON.parse(payload);
            const messageType = parsed[0];
            let messageContent = parsed[1];

            if (messageType === 'chatv2:send' && messageContent && (messageContent.message || messageContent.messageContent)) {
              const originalMessage = messageContent.message || messageContent.messageContent;

              if (typeof originalMessage === 'string') {
                const modifiedMessage = insertUnicode(originalMessage);

                if (messageContent.message) {
                  messageContent.message = modifiedMessage;
                } else {
                  messageContent.messageContent = modifiedMessage;
                }
              }

              const newPayload = `42["${messageType}",${JSON.stringify(messageContent)}]`;
              return originalWebSocketSend.call(this, newPayload);
            }
          }
        }
      } catch (e) {
        console.warn('[MSP2] Błąd parsowania danych:', e, data);
      }
    }

    return originalWebSocketSend.call(this, data);
  };
}