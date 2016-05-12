import reduce from 'ember-screamer/reducer/reduce';
import Redux from 'npm:redux';
import optimist from 'npm:redux-optimist';
import { dispatchChannelActions } from 'ember-screamer/lib/redux-channel-dispatcher';

let { createStore, compose, applyMiddleware } = Redux;

class StoreProxy {
  constructor(store) {
    this._store = store;
  }

  getState() {
    return this._store.getState();
  }

  dispatch(action) {
    let result = this._store.dispatch(action);
    console.log('dispatch', action);

    window.state = this.getState();
    return result;
  }

  subscribe(...args) {
    return this._store.subscribe(...args);
  }
}

export function initialize(application) {
  let channels = application.lookup('service:channels');

  let store = new StoreProxy(
    createStore(
      optimist(reduce),
      compose(
        dispatchChannelActions(channels),
        window.devToolsExtension ? window.devToolsExtension() : f => f
      )
    )
  );

  application.register('service:store', store, { instantiate: false });
}

export default {
  name: 'store',
  initialize
};
