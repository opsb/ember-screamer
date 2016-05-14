import Phoenix from 'npm:phoenix';

export function initialize(application) {
  let socket = new Phoenix.Socket('ws://localhost:4000/socket', {
    // params: {token: window.userToken},
    logger: (kind, msg, data) => {
      if (!msg.match(/heartbeat/)) console.log(`${kind}: ${msg}`, data);
    }
  });

  socket.connect();
  application.register('service:socket', socket, { instantiate: false });
}

export default {
  name: 'socket',
  initialize
};
