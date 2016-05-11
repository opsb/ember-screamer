import Ember from 'ember';

export default Ember.Object.extend({
  store: Ember.inject.service(),

  lobby: {
    join(response) {
      let store = this.get('store');
      let action = { type: 'JOIN_CONVERSATION_LOBBY', status: 'succeeded', payload: response };
      store.dispatch(action);
    },

    addConversation(response) {
      let store = this.get('store');
      let action = { type: 'ADD_CONVERSATION', status: 'succeeded2', payload: response };
      store.dispatch(action);
    }
  },

  conversation: (conversationId) => ({
    join(response) {
      let store = this.get('store');
      let action = { type: 'JOIN_CONVERSATION', conversationId, status: 'succeeded', payload: response };
      store.dispatch(action);
    },

    addMessage(response) {
      let store = this.get('store');
      let action = { type: 'ADD_MESSAGE', status: 'succeeded', payload: Object.assign({conversationId}, response) }
      store.dispatch(action);
    }
  })
});
