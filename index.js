const WebSocket = require('ws');
const { matchPattern } = require('url-matcher');

function matchUrl(rule, url) {
  const match = matchPattern(rule, url);
  if (!match) {
    return;
  }
  const { paramNames, paramValues } = match;
  return paramNames.reduce(
    (params, name, idx) => Object.assign(params, { [name]: paramValues[idx] }),
    {}
  );
}

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
    log.info(`Listening on ws://localhost:${port}/ws/:endpoint`)
  );
  const endpoints = {};
  wss.on('connection', (ws, { url }) => {
    const match = matchUrl('/ws/:endpoint', url);
    if (match) {
      ws.on('message', message => {
        const { endpoint } = match;
        const execute = endpoints[endpoint];
        if (execute) {
          execute(getActualMessage(message));
        }
      });
    } else {
      ws.close();
    }
  });
  return {
    type: 'ws',
    input({ endpoint }, execute) {
      endpoints[endpoint] = execute;
    },
    output({ url }) {
      const client = new WebSocket(url);
      return value => client.send(sendAcutalMessage(value));
    },
  };
};
