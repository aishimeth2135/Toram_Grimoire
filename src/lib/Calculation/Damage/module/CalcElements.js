// @ts-nocheck
class CalcItemBase {
  constructor(id, text, unit) {
    this.id = id;
    this.text = text;
    this.unit = unit;
    this.base = null;
    this.min = null;
    this.max = null;
    this.step = 1;
    this.defaultValue = 0;
  }
  setBase(b) {
    this.base = b;
    return this;
  }
  initRange(min, max, step = 1) {
    this.min = min;
    this.max = max;
    this.step = step;
    return this;
  }
  initDefaultValue(v) {
    this.defaultValue = v;
    return this;
  }
}


class Calculation {
  constructor() {
    this.containers = [];
    this.name = '';
    this.status = {
      sets: {
        'str': 0,
        'dex': 0,
        'int': 0,
        'agi': 0,
        'vit': 0
      },
      valueSet: {}
    };
  }
  createContainer(id, cat, type) {
    const t = new CalcItemContainer(this, id, cat, type);
    this.containers.push(t);
    return t;
  }
  calcResult(config) {
    config = Object.assign({
      beforeCalculate: [],
      valueSet: {}
    }, config);
    let cst = 0;
    let mul = 1;

    this.status.valueSet = config.valueSet;

    this.containers.forEach(ctner => {
      if (!ctner.beCalc || !ctner.isValid())
        return;
      const find = config.beforeCalculate.find(a => a.container == ctner);
      const v = !find ? ctner.beforeCalculate() : (typeof find.value == 'function' ? find.value.call(ctner) : find.value);

      switch (ctner.category) {
        case CalcItemContainer.CATEGORY_CONSTANT:
          cst += v;
          break;
        case CalcItemContainer.CATEGORY_MULTIPLIER:
          mul *= v;
          break;
      }
    });

    this.status.valueSet = {};

    return Math.max(cst * mul, 1);
  }
  findItem(id) {
    const c = this.findContainer(id);
    return c ? c.getItem(id) : void 0;
  }
  container(index) {
    if (index === void 0)
      return this.containers;
    return this.containers[index];
  }
  findContainer(item_id) {
    return this.containers.find(c => c.items.find(a => a.base.id == item_id));
  }
  findContainerById(ctner_id) {
    return this.containers.find(c => c.containerId() == ctner_id);
  }
  checkItemValid(id) {
    const t = this.getItem(id);
    return t && t.isValid();
  }
  calculationName(n) {
    if (n)
      this.name = n;
    return this.name;
  }
  userSet(name, v) {
    if (name === void 0)
      return this.status.sets;
    if (v !== void 0)
      this.status.sets[name] = v;
    return this.status.sets[name];
  }
  copyFrom(cal) {
    //
    this.calculationName(cal.calculationName() + '*');

    // sets
    Object.keys(this.userSet()).forEach(k => this.userSet(k, cal.userSet(k)));

    // containers
    this.containers.forEach(p => p.item().forEach(q => q.value(cal.findItem(q.itemId()).value())));

    return this;
  }
}


class CalcItemContainer {
  constructor(parent, id, cat, type) {
    this.parent = parent;
    this.id = id;
    this.category = cat;
    this.type = type || CalcItemContainer.TYPE_NORMAL;

    this.items = [];
    this.linked = null;

    this.valid = true;
    this.beToggle = true;
    this.beCalc = true;
    this.beInput = true;

    this.title = '';

    this.status = {
      currentItem: null,
      valueSet: {}
    };
  }
  appendItem() {
    const t = new CalcItem(this, ...arguments);
    this.items.push(t);
    return t;
  }
  currentItem(t) {
    if (t)
      this.status.currentItem = t;
    return this.status.currentItem;
  }
  base() {
    return this.currentItem().base;
  }
  value(id) {
    if (typeof id == 'string')
      return this.getItem(id).value();
    if (this.type == CalcItemContainer.TYPE_NORMAL)
      return this.item(0).value();
    return this.currentItem().value();
  }
  calculatedValue() {
    const v = this.value();
    switch (this.category) {
      case CalcItemContainer.CATEGORY_CONSTANT:
        return v;
      case CalcItemContainer.CATEGORY_MULTIPLIER:
        return (100 + v) / 100;
    }
  }
  beforeCalculate() {
    return this.calculatedValue();
  }
  setBeforeCalculateFunction(fun) {
    if (typeof fun == 'function')
      this.beforeCalculate = fun;
    return this;
  }
  /**
   * parent中的其它container，若擁有同樣的Link ID，彼此之間會具有連動性。Link預設值為null。
   * @param {string} v - Link ID
   */
  link(v) {
    const find = this.belongCalculation().container().find(c => c.beLinked() && c.getLink().linkId() == v);
    this.linked = find ? find.getLink() : new CalcItemContainerLink(v);
    return this;
  }
  getLink() {
    return this.linked;
  }
  beLinked() {
    return this.getLink() !== null;
  }
  notifyLinkedContainers(type) {
    const ctners = this.belongCalculation().container().filter(a => a != this && a.getLink() == this.getLink());
    switch (type) {
      case CalcItemContainer.NOTIFY_LINKED_TYPE_CONTAINER_TOGGLE:
        ctners.forEach(p => p.toggle());
        // fall through
      case CalcItemContainer.NOTIFY_LINKED_TYPE_ITEM_SELECT:
        {
          const i = this.item().indexOf(this.currentItem());
          ctners.forEach(p => p.currentItem(p.item(i)));
          break;
        }
    }
  }
  checkCurrentItem(id) {
    return this.base().id == id;
  }
  belongCalculation() {
    return this.parent;
  }
  getItem(id) {
    return this.items.find(a => a.base.id == id);
  }
  /**
   * 取得指定index的item。如果無指定index，則回傳一個包含所有item的陣列。
   * @param  {number} index
   * @return {CalcItem|CalcItem[]}
   */
  item(index) {
    if (index === void 0)
      return this.items;
    return this.items[index];
  }
  toggle() {
    if (this.beToggle)
      this.valid = this.valid ? false : true;
  }
  isValid() {
    return this.valid;
  }
  closeToggle() {
    this.beToggle = false;
    return this;
  }
  closeCalc() {
    this.beCalc = false;
    return this;
  }
  closeInputValue() {
    this.beInput = false;
    return this;
  }
  openItemToggle(...item_id) {
    item_id.forEach(id => this.getItem(id).beToggle = true);
    return this;
  }
  openLinkedToggle() {
    this.linkedToggle = true;
    return this;
  }
  containerTitle(t) {
    if (t || t === '')
      this.title = t;
    return this.title;
  }
  containerId() {
    return this.id;
  }
}
CalcItemContainer.CATEGORY_CONSTANT = Symbol('Constant');
CalcItemContainer.CATEGORY_MULTIPLIER = Symbol('Multiplier');
CalcItemContainer.CATEGOEY_NONE = Symbol('None');
CalcItemContainer.TYPE_NORMAL = Symbol('Normal');
CalcItemContainer.TYPE_SELECT = Symbol('Select');
CalcItemContainer.NOTIFY_LINKED_TYPE_CONTAINER_TOGGLE = Symbol();
CalcItemContainer.NOTIFY_LINKED_TYPE_ITEM_SELECT = Symbol();


class CalcItemContainerLink {
  constructor(id) {
    this.id = id;

    this.toggleContainer = false;
  }
  openToggleContainer() {
    this.toggleContainer = true;
    return this;
  }
  linkId() {
    return this.id;
  }
}


class CalcItem {
  constructor(parent, base) {
    this.parent = parent;
    this.base = base;
    this._value = base.defaultValue;
    this.valid = true;

    this.beToggle = false;
  }
  belongContainer() {
    return this.parent;
  }
  value(v) {
    if (v || v === 0) {
      const max = this.base.max,
        min = this.base.min;
      if (max !== null && v > max)
        v = max;
      if (min !== null && v < min)
        v = min;
      this._value = v;
    }
    const vset = this.belongContainer().belongCalculation().status.valueSet[this.itemId()];
    const res = vset !== void 0 ? (typeof vset == 'function' ? vset.call(this) : vset) : this._value;
    return res;
  }
  toggle() {
    if (this.beToggle)
      this.valid = this.valid ? false : true;
  }
  isValid() {
    const c = this.belongContainer();
    if (c.type == CalcItemContainer.TYPE_SELECT && c.currentItem() != this)
      return false;
    return this.valid;
  }
  itemId() {
    return this.base.id;
  }
  itemText() {
    return this.base.text;
  }
  itemUnit() {
    return this.base.unit
  }
}


export { CalcItemBase, Calculation, CalcItemContainer, CalcItem };