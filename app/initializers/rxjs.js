import Ember from 'ember';
import {root} from 'rxjs/util/root';

export function initialize(application) {
  root.Rx = {config: {Promise: Ember.RSVP.Promise}};
}

export default {
  name: 'rxjs',
  initialize
};
