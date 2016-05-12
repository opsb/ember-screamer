import Ember from 'ember';
import uuid from 'npm:node-uuid';

export default Ember.Service.extend({
  channels: Ember.inject.service(),
  store: Ember.inject.service(),

  subscribeToList() {
    return this.get('channels').join('conversations:index', 'lobby');
  },

  subscribeToConversation(conversationId) {
    let topic = `conversations:${conversationId}`;
    return this.get('channels').join(topic, 'conversation', conversationId);
  },

  getConversation(conversationId) {
    let store = this.get('store');
    let subscription = Ember.ObjectProxy.create({});

    function update() {
      let conversation = store.getState().conversations.getIn([conversationId]).toJS();
      if (!conversation) throw new Error(`Conversation not found ${conversationId}`);
      subscription.set('content', conversation);
    }

    store.subscribe(update);
    update();

    return subscription;
  },

  getList() {
    let store = this.get('store');
    let subscription = Ember.ArrayProxy.create({});

    function update() {
      let newState = store.getState().conversations.toIndexedSeq().sortBy(c => c.get('name')).toJS();
      subscription.set('content', newState);
    }

    store.subscribe(update);
    update();

    return subscription;
  },

  add(name) {
    let store = this.get('store');
    let conversation = { id: uuid.v4(), name };
    let action = { type: 'ADD_CONVERSATION', payload: conversation, channel: `conversations:index` };

    return store.dispatch(action).then(() => conversation.id);
  },

  addMesage(conversationId, body) {
    let store = this.get('store');
    let message = { id: uuid.v4(), body, conversationId };
    let action = { type: 'ADD_MESSAGE', payload: message, channel: `conversations:${conversationId}` };

    return store.dispatch(action).then(() => message.id);
  }
});
