const config = {
  'element-attribute-name': 'data-cy-component'
};

export default class CyComponent {
  constructor(set) {
    const empty_fun = function() {};

    this._name = set.name || "";
    this._create = set.create || empty_fun;
    this._update = set.update || empty_fun;
    this._getElement = set.getElement || empty_fun;
    this._childComponents = set.components || {};

    this._callbacks = set.callbacks || {};
    this._methods = set.methods || {};
    this._eventListeners = set.eventListeners || {};
  }
  $create(...args) {
    const t = this._create.apply(this, [this, ...args]);
    t.setAttribute(config['element-attribute-name'], this._name);
    return t;
  }
  $update(el, ...args) {
    if (el.getAttribute(config['element-attribute-name']) !== this._name)
      throw new Error('[argument: element] is not create by this CyComponent');
    return this._update.apply(this, [this, el, ...args]);
  }
  $preUpdate(el, ...args) {
    return this._update.apply(this, [this, el, ...args]);
  }
  $getElement(...args) {
    return this._getElement.apply(this, [this, ...args]);
  }
  $component(name) {
    if (!this._childComponents[name])
      throw new Error('Unknow component name: ' + name);
    return this._childComponents[name];
  }
  $method(name, ...args) {
    if (this._methods[name] === void 0)
      throw new Error("Unknow method name: " + name);
    return this._methods[name].apply(this, [this, ...args]);
  }
  $callback(name) {
    if (this._callbacks[name] === void 0)
      throw new Error("Unknow callback name: " + name);
    return this._callbacks[name];
  }
  $eventListener(name) {
    if (this._eventListeners[name] === void 0)
      throw new Error("Unknow event-listeners name: " + name);
    return this._eventListeners[name];
  }
  appendComponent(name, c) {
    if (this._childComponents[name])
      throw new Error('This component is already exist. Please try other component name.')
    if (typeof c != 'object')
      throw new Error('type of given component is not Object.');
    this._childComponents[name] = c;
    return this;
  }
  appendLink(name, fun) {
    if (this._links[name])
      throw new Error('This link is already exist. Please try other link name.')
    if (typeof c != 'function')
      throw new Error('type of given link is not Function.');
    this._links[name] = c;
    return this;
  }
}