import Ember from 'ember';
import Immutable from 'npm:immutable';

function initialState() {
  return Immutable.fromJS({
    conversations: {
      lobby: {
        id: 'lobby',
        name: 'Lobby',
        messages: []
      }
    }
  });
}

export default Ember.Service.extend({
  _broadcasts: null,

  init() {
    this._super();
    this._state = initialState();
    this._broadcasts = Ember.Object.extend(Ember.Evented).create();
  },

  dispatch(event, ...args) {
    let action = { type: event, args: args };

    let state = this._reduce(this._state, action);

    this._state = state;
    this._broadcasts.trigger('updated', state);
  },

  subscribe(...path){
    const subscription = Ember.ObjectProxy.create({});
    this._updateSubscription(subscription, this._state, path);

    this._broadcasts.on('updated', state => {
      this._updateSubscription(subscription, state, path);
    });

    return subscription;
  },

  _updateSubscription(subscription, state, path) {
    subscription.set('content', state.getIn(path).toJS());
  },

  _reduce(state, action) {
    return this.reducers[action.type](state, ...action.args);
  },

  reducers: {
    addMessage(state, message, conversationId) {
      return state.updateIn(['conversations', conversationId, 'messages'], messages => messages.push(message));
    }
  }
});