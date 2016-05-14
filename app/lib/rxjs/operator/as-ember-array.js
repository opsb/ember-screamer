export function asEmberArray() {
  let proxy = Ember.ArrayProxy.create();
  this.subscribe(value => proxy.set('content', value));
  return proxy;
}
