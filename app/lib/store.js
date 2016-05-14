import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import uuid from 'npm:node-uuid';
import ReduxOptimist from 'npm:redux-optimist';

function observeStates(reduxStore) {
  return Observable.create(function (observer) {
    reduxStore.subscribe(() => {observer.next(reduxStore.getState())});
  });
}

function asOptimistAction(action, optimistId, type) {
  return Object.assign(
    {
      optimist: {
        type: type,
        id: optimistId
      }
    },
    action
  )
}

export default class Store {
  constructor(reduxStore, channels) {
    this._reduxStore = reduxStore;
    this._channels = channels;

    this.states = observeStates(reduxStore).publishReplay(1);
    this.states.connect();
  }

  dispatch(action) {
    console.log('==> dispatch', action);
    return this._reduxStore.dispatch(action);
  }

  execute(action) {
    let optimistId = uuid();
    let channels = this._channels;

    console.log('redux-channels:begin', action);
    this._reduxStore.dispatch(asOptimistAction(action, optimistId, ReduxOptimist.BEGIN));

    return new Ember.RSVP.Promise((resolve, reject) => {
      console.log('redux-channels:push', action);
      channels.push(
        action.channel,
        action.type.dasherize().camelize(),
        action.payload
      )
      .then(() => {
        console.log('redux-channels:supercede', action);
        this._reduxStore.dispatch(
          asOptimistAction(action, optimistId, ReduxOptimist.COMMIT)
        );
        return action;
      })
      .catch(error => {
        console.log('redux-channels:error', action);
        this._reduxStore.dispatch(
          asOptimistAction(action, optimistId, ReduxOptimist.REVERT)
        );
        throw error;
      });
    });
  }

  when(predicate) {
    return this.states.takeWhile(state => !predicate(state)).toPromise();
  }

  getState() {
    return this._reduxStore.getState();
  }
}
