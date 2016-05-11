import Ember from 'ember';
import uuid from 'npm:node-uuid';
import ReduxOptimist from 'npm:redux-optimist';

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
    let actionId = uuid();

    store.dispatch({
      type: 'ADD_CONVERSATION',
      status: 'requested',
      payload: conversation,
      optimist: {type: ReduxOptimist.BEGIN, id: actionId}
    });

    return this.get('channels')
      .push('conversations:index', 'addConversation', conversation)
      .then(response => {

        store.dispatch({
          type: 'ADD_CONVERSATION',
          status: 'succeeded',
          payload: response,
          optimist: {type: ReduxOptimist.REVERT, id: actionId}
        });

        return conversation.id;
      });
  },

  addMesage(conversationId, body) {
    let store = this.get('store');
    let message = { id: uuid.v4(), body, conversationId };
    let actionId = uuid();

    store.dispatch({
      type: 'ADD_MESSAGE',
      status: 'requested',
      payload: message,
      optimist: {type: ReduxOptimist.BEGIN, id: actionId}
    });

    return this.get('channels').push(`conversations:${conversationId}`, 'addMessage', message)
      .then(response => store.dispatch({
        type: 'ADD_MESSAGE',
        status: 'succeeded',
        payload: response,
        optimist: {type: ReduxOptimist.REVERT, id: actionId}
      }));
  }
});
