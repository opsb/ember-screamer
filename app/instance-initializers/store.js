import reduce from 'ember-screamer/reducer/reduce';
import Redux from 'npm:redux';
import optimist from 'npm:redux-optimist';
import createLogger from 'npm:redux-logger';
import Store from 'ember-screamer/lib/store';

let { createStore, compose, applyMiddleware } = Redux;

export function initialize(application) {
  let channels = application.lookup('service:channels');

  let reduxStore = createStore(
    optimist(reduce),
    compose(
      applyMiddleware(),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );

  let store = new Store(reduxStore, channels);

  application.register('service:store', store, { instantiate: false });
}

export default {
  name: 'store',
  initialize
};
