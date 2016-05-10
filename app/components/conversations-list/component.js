import Ember from 'ember';

export default Ember.Component.extend({
  conversations: null,
  conversationsService: Ember.inject.service('conversations'),

  reset() {
    this.set('name', null);
  },

  actions: {
    addConversation() {
      let conversationsService = this.get('conversationsService');
      let { name } = this.getProperties('name');
      this.reset();
      conversationsService.add(name).then(conversationId => {
        this.get('router').transitionTo('conversation', conversationId);
      });
    }
  }
});
