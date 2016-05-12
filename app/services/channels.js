import Ember from 'ember';

const { service } = Ember.inject;
const { getOwner } = Ember;

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function withLatency(callback) {
  return new Ember.RSVP.Promise(resolve => {
    if (!window.latency) {
      resolve(callback());
    } else {
      setTimeout(() => {
        resolve(callback());
      }, window.latency);
    }
  });
}

export default Ember.Service.extend({
  socket: service('socket'),

  init() {
    this._super();
    this._channels = {};
  },

  join(topic, handler, ...args) {
    let channel = this.get('socket').channel(topic);

    let [namespace, name] = topic.split(":");
    let owner = getOwner(this);
    let namespaceHandler = owner.lookup(`channel:${namespace}`);
    if (!namespaceHandler[handler]) throw new Error(`No handler found for topic: ${topic}`);
    let topicHandler = this._withDefaults(this._initHandler(namespaceHandler[handler], args));

    Object.keys(topicHandler).forEach(name => {
      channel.on(name, topicHandler[name].bind(namespaceHandler));
    });

    this._channels[topic] = channel;

    return new Ember.RSVP.Promise((resolve, reject) => {
      channel.join()
        .receive('ok', response => {
          topicHandler.join.call(namespaceHandler, response);
          resolve();
        })
        .receive('error', error => {
          topicHandler.joinError.call(namespaceHandler, error);
          reject(error);
        });
    });
  },

  _initHandler(handler, args) {
    return isFunction(handler) ? handler(...args) : handler;
  },

  _withDefaults(handler) {
    return Object.assign({}, {
      join: () => {},
      joinError: () => {}
    }, handler);
  },

  push(topic, handler, message) {
    return withLatency(() => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.getChannel(topic)
          .push(handler, message)
          .receive('ok', payload => resolve(payload))
          .receive('error', reason => reject(reason));
      });
    });
  },

  getChannel(topic) {
    let channel = this._channels[topic];

    if (!channel) {
      throw new Error(`Topic not subscribed to: ${topic}`);
    }

    return channel;
  }
});
