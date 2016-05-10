import Ember from 'ember';

export default Ember.Route.extend({
  store: Ember.inject.service('store'),
  conversations: Ember.inject.service('conversations'),

  model(params) {
    let conversations = this.get('conversations');
    let conversationId = params['conversation_id'];

    return conversations.subscribeToConversation(conversationId).then(() => {
      return conversations.getConversation(conversationId);
    })
    .catch(error => {
      console.log(error);
      this.transitionTo('application');
    });
  }
});
