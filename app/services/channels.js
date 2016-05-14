import Ember from 'ember';

const { service } = Ember.inject;
const { getOwner } = Ember;

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

window.latency = localStorage.latency;
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
    this._queue = Ember.RSVP.resolve();
  },

  join(topic, handler, ...args) {
    let channel = this.get('socket').channel(topic);
    let topicHandler = this._topicHandler(topic, handler, ...args);

    Object.keys(topicHandler).forEach(name => {
      channel.on(name, topicHandler[name]);
    });

    this._channels[topic] = channel;

    return this._enqueue(() => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        channel.join()
          .receive('ok', response => resolve(response))
          .receive('error', error => reject(error));
      });
    }, `join ${topic}`);
  },

  _topicHandler(topic, handler, ...args) {
    let [namespace, name] = topic.split(":");
    let owner = getOwner(this);
    let namespaceHandler = owner.lookup(`channel:${namespace}`);
    if (!namespaceHandler[handler]) throw new Error(`No handler found for topic: ${topic}`);
    let topicHandler = this._withDefaults(this._initHandler(namespaceHandler[handler], args));

    return Object.keys(topicHandler).reduce((boundHandler, name) => {
      boundHandler[name] = topicHandler[name].bind(namespaceHandler);
      return boundHandler;
    }, {});
  },

  _enqueue(job, description = "job") {
    console.log('enqueuing', description);
    return this._queue = this._queue.then(() => {
      return withLatency(() => {
        console.log('dequeing', description);
        return job();
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

  push(topic, channelMethod, message) {
    return this._enqueue(() => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        return this.getChannel(topic)
          .push(channelMethod, message)
          .receive('ok', payload => resolve(payload))
          .receive('error', reason => reject(reason));
      });
    }, `push ${topic}.${channelMethod} ${message}`);
  },

  getChannel(topic) {
    let channel = this._channels[topic];

    if (!channel) {
      throw new Error(`Topic not subscribed to: ${topic}`);
    }

    return channel;
  }
});
