export function asEmberObject() {
  let proxy = Ember.ObjectProxy.create();
  this.subscribe(value => proxy.set('content', value));
  return proxy;
}
