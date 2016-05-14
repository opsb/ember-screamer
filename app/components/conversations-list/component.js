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
      console.log('component:addConversation');
      let conversationId = conversationsService.add(name);
      // this.get('store').dispatch({type: 'ROUTE_TRANSITION', payload: {route: 'conversation', params: [conversationId]}});
      console.log('component:transitionTo');
      this.get('router').transitionTo('conversation', conversationId);
    }
  }
});
