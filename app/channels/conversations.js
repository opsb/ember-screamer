import Ember from 'ember';

export default Ember.Object.extend({
  store: Ember.inject.service(),

  lobby: {
    addConversation(response) {
      let store = this.get('store');
      let action = { type: 'ADD_CONVERSATION', payload: response };
      store.dispatch(action);
    }
  },

  conversation: (conversationId) => ({
    addMessage(response) {
      let store = this.get('store');
      let action = { type: 'ADD_MESSAGE', payload: Object.assign({conversationId}, response) }
      store.dispatch(action);
    }
  })
});
