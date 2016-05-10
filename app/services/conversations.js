import Ember from 'ember';
import uuid from 'npm:node-uuid';

export default Ember.Service.extend({
  channels: Ember.inject.service(),
  store: Ember.inject.service(),

  subscribeToList() {
    let store = this.get('store');

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
    let conversationId = uuid.v4();
    let conversation = { id: conversationId, name };

    store.dispatch({ type: 'ADD_CONVERSATION', status: 'requested', payload: conversation });
    return this.get('channels')
      .push('conversations:index', 'addConversation', conversation)
      .then(response => {
        store.dispatch({ type: 'ADD_CONVERSATION', status: 'succeeded', payload: response });
        return conversation.id;
      });
  },

  addMesage(conversationId, body) {
    let store = this.get('store');
    let message = { id: uuid.v4(), body, conversationId };

    store.dispatch({ type: 'ADD_MESSAGE', status: 'requested', payload: message})
    return this.get('channels').push(`conversations:${conversationId}`, 'addMessage', message)
      .then(response => store.dispatch({type: 'ADD_MESSAGE', status: 'succeeded', payload: response}));
  }
});
