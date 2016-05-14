import Ember from 'ember';
import uuid from 'npm:node-uuid';
import 'ember-screamer/lib/rxjs/add/operator/as-ember-array';
import 'ember-screamer/lib/rxjs/add/operator/as-ember-object';

export default Ember.Service.extend({
  channels: Ember.inject.service(),
  store: Ember.inject.service(),

  subscribeTo(conversationId) {
    let store = this.get('store');

    this.remoteSubscribeTo(conversationId);

    return store.when(() => this.localIsReady(conversationId))
                .then(() => this.localSubscribeTo(conversationId));
  },

  remoteSubscribeTo(conversationId) {
    let topic = `conversations:${conversationId}`;
    let store = this.get('store');
    store.dispatch({type: 'REQUEST_JOIN_CHANNEL', payload: { channel: topic }});
    return this.get('channels').join(topic, 'conversation', conversationId)
      .then(response => store.dispatch({ type: 'JOIN_CONVERSATION', conversationId, status: 'succeeded', payload: response }));
  },

  localIsReady(conversationId) {
    return this.get('store').getState().conversations.getIn([conversationId]);
  },

  localSubscribeTo(conversationId) {
    let store = this.get('store');
    return store.states.map(state => state.conversations.toJS()[conversationId]).asEmberObject();
  },

  localSubscribeToList() {
    return this.get('store').states
      .map(state => state.conversations.toIndexedSeq().sortBy(c => c.get('name')).toJS())
      .asEmberArray();
  },

  remoteSubscribeToList() {
    let store = this.get('store');
    store.dispatch({type: 'REQUEST_JOIN_CHANNEL', payload: { channel: 'conversations:index' }});
    return this.get('channels').join('conversations:index', 'lobby')
      .then(response => store.dispatch({ type: 'JOIN_CONVERSATION_LOBBY', status: 'succeeded', payload: response }));
  },

  add(name) {
    let store = this.get('store');
    let conversation = { id: uuid.v4(), name };
    let action = { type: 'ADD_CONVERSATION', payload: conversation, channel: `conversations:index` };

    store.execute(action);
    return conversation.id;
  },

  addMesage(conversationId, body) {
    let store = this.get('store');
    let message = { id: uuid.v4(), body, conversationId };
    let action = { type: 'ADD_MESSAGE', payload: message, channel: `conversations:${conversationId}` };

    return store.execute(action).then(() => message.id);
  }
});
