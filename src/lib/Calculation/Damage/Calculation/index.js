import { CalculationBase, CalcItemBase, CalcItemBaseContainer } from './base';

class Calculation {
  /**
   * @param {CalculationBase} base
   * @param {string} name
   */
  constructor(base, name) {
    /** @type {CalculationBase} */
    this.base = base;

    /** @type {string} */
    this.name = name;

    /** @type {Map<string, CalcItemContainer>} */
    this.containers = new Map();

    this.initContainers();
  }

  initContainers() {
    for (const container of this.base.containers.values()) {
      const itemContainer = new CalcItemContainer(this, container);
      itemContainer.initItems();
      this.containers.set(container.id, itemContainer);
    }
  }

  result() {
    return this.base.result(this);
  }
}

class CalcItemContainer {
  /**
   * @param {Calculation} parent
   * @param {CalcItemBaseContainer} base
   */
  constructor(parent, base) {
    /** @type {Calculation} @private */
    this._parent = parent;

    /** @type {CalcItemBaseContainer} */
    this.base = base;

    /** @type {boolean} */
    this.enabled = true;

    /** @type {Map<string, CalcItem>} */
    this.items = new Map();

    /** @type {string} @private */
    this._currentItemId = null;
  }

  /**
   * generate copy of Items from ItemBases
   */
  initItems() {
    let flag = true;
    for (const item of this.base.items.values()) {
      if (flag) {
        this._currentItemId = item.id;
        flag = false;
      }
      const newItem = new CalcItem(item);
      this.items.set(item.id, newItem);
    }
  }

  get selectable() {
    return this.base.type === CalcItemBaseContainer.TYPE_OPTIONS && !this.base.getCurrentItemId;
  }

  get belongCalculation() {
    return this._parent;
  }

  get currentItem() {
    if (this.base.getCurrentItemId !== null) {
      return this.items.get(this.base.getCurrentItemId(this, this.base));
    }
    return this.items.get(this._currentItemId);
  }

  /**
   * Ally method to get value of item
   * @param {string} id
   * @returns {number}
   */
  getItemValue(id) {
    return this.items.get(id).value;
  }

  /**
   * @param {string} id
   */
  selectItem(id) {
    this._currentItemId = id;
  }

  result() {
    return this.base.result(this);
  }
}

class CalcItem {
  /**
   * @param {CalcItemBase} base
   */
  constructor(base) {
    /** @type {CalcItemBase} */
    this.base = base;

    /** @type {number} @private */
    this._value = base.defaultValue;

    /** @type {boolean} @private */
    this._enabled = true;
  }

  get value() {
    return this._value;
  }

  /**
   * @param {number} value
   */
  set value(value) {
    const max = this.base.max,
      min = this.base.min;
    value = max !== null && value > max ? max : value;
    value = min !== null && value < min ? min : value;
    this._value = value;
  }

  get enabled() {
    return this._enabled;
  }

  toggle() {
    this._enabled = !this._enabled;
  }
}

export { CalcItemContainer, Calculation };
