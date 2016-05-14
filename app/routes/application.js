import Ember from 'ember';

export default Ember.Route.extend({
  store: Ember.inject.service('store'),
  conversations: Ember.inject.service('conversations'),

  model() {
    let conversations = this.get('conversations');
    return conversations.remoteSubscribeToList().then(() => {
      return conversations.localSubscribeToList();
    });
  }
});
