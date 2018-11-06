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
  const clients = {};
  wss.on('connection', (ws, { url }) => {
    const match = matchUrl('/ws/:endpoint', url);
    if (match) {
      const { endpoint } = match;
      if (!clients[endpoint]) {
        clients[endpoint] = new Set();
      }
      clients[endpoint].add(ws);
      ws.once('close', () => {
        clients[endpoint].delete(ws);
        if (!clients[endpoint].size) {
          delete clients[endpoint];
        }
      });
      ws.on('message', async message => {
        const { execute, broadcast } = endpoints[endpoint] || {};
        if (execute) {
          const result = await execute(getActualMessage(message));
          if (result.ok && broadcast && clients[endpoint]) {
            for (const socket of clients[endpoint]) {
              socket.send(sendAcutalMessage(result.value));
            }
          }
        } else {
          log.warn(`No endpoint found for ${endpoint}`);
        }
      });
    } else {
      log.error('Rogue path accessed. Socket dropped.');
      ws.close();
    }
  });
  return {
    type: 'ws',
    input({ endpoint, broadcast = false }, execute) {
      endpoints[endpoint] = { execute, broadcast };
    },
    output({ url }) {
      const client = new WebSocket(url);
      return value => client.send(sendAcutalMessage(value));
    },
  };
};
