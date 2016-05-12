import ReduxOptimist from 'npm:redux-optimist';
import uuid from 'npm:node-uuid';

const Optimist = {
  begin(action, optimistId) {
    return Object.assign({optimist: {type: ReduxOptimist.BEGIN, id: optimistId}}, action);
  },

  commit(action, optimistId) {
    return Object.assign({optimist: {type: ReduxOptimist.COMMIT, id: optimistId}}, action);
  },

  revert(action, optimistId) {
    return Object.assign({optimist: {type: ReduxOptimist.REVERT, id: optimistId}}, action);
  }
};

function channelMethod(actionType) {
  return actionType.dasherize().camelize();
}

class RemoteStoreProxy {
  constructor(store, channels) {
    this._store = store;
    this._channels = channels;
  }

  getState() {
    return this._store.getState();
  }

  dispatch(action) {
    if (!action.channel) return this._store.dispatch(action);

    let channel = this._channels.getChannel(action.channel);
    let store = this._store;
    let optimistId = uuid();

    store.dispatch(Optimist.begin(action, optimistId));

    return new Ember.RSVP.Promise((resolve, reject) => {
      channel.push(channelMethod(action.type), action.payload)
        .receive('ok', () => {
          store.dispatch(Optimist.revert(action, optimistId));
          resolve(action);
        })
        .receive('error', error => {
          store.dispatch(Optimist.revert(action, optimistId))
          reject(error);
        });
    });
  }

  subscribe(...args) {
    return this._store.subscribe(...args);
  }
}

export function dispatchChannelActions(channels) {
  return next => (reducer, initialState) => {
    let store = next(reducer, initialState);
    let remoteStore = new RemoteStoreProxy(store, channels);

    return remoteStore;
  };
}
