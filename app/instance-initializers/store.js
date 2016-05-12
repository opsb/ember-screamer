import reduce from 'ember-screamer/reducer/reduce';
import Redux from 'npm:redux';
import optimist from 'npm:redux-optimist';
import { dispatchChannelActions } from 'ember-screamer/lib/redux-channel-dispatcher';
import createLogger from 'npm:redux-logger';

let { createStore, compose, applyMiddleware } = Redux;

export function initialize(application) {
  let channels = application.lookup('service:channels');

  let store = createStore(
    optimist(reduce),
    compose(
      dispatchChannelActions(channels),
      window.devToolsExtension ? window.devToolsExtension() : f => f,
      applyMiddleware(createLogger()),
    )
  );

  application.register('service:store', store, { instantiate: false });
}

export default {
  name: 'store',
  initialize
};
