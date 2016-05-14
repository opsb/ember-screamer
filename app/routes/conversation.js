import Ember from 'ember';
import 'rxjs/add/operator/find';

export default Ember.Route.extend({
  conversations: Ember.inject.service('conversations'),

  model(params) {
    return this.get('conversations').subscribeTo(params['conversation_id']);
  }
});
