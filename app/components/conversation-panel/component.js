import Ember from 'ember';

export default Ember.Component.extend({
  conversation: null,
  conversations: Ember.inject.service(),
  body: null,
  loading: Ember.computed('conversation.status', function() {
    return this.get('conversation.status') !== 'succeeded';
  }),

  reset() {
    this.set('body', null);
  },

  actions: {
    addMessage() {
      let { body, conversation, conversations } = this.getProperties('body', 'conversation', 'conversations');
      conversations.addMesage(conversation.get('id'), body);
      this.reset();
    }
  }
});
