const WebSocket = require('ws');

function getActualMessage(msg) {
  try {
    return JSON.parse(msg);
  } catch (_err) {
    return msg;
  }
}

function sendAcutalMessage(msg) {
  if (typeof msg === 'string') {
    return msg;
  }
  return JSON.stringify(msg);
}

module.exports = function fofxWs({ port = 8080 }, log) {
  const wss = new WebSocket.Server({ port }, () =>
    log.info(`Listening on ws://localhost:${port}`)
  );
  const inputCallbacks = [];
  wss.on('connection', ws => {
    ws.on('message', message => {
      inputCallbacks.forEach(execute => execute(getActualMessage(message)));
    });
  });
  return {
    type: 'ws',
    input(_options, execute) {
      inputCallbacks.push(execute);
    },
    output({ url }) {
      const client = new WebSocket(url);
      return value => client.send(sendAcutalMessage(value));
    },
  };
};
