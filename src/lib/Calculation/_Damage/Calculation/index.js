
/**
 * @callback CalcResult
 * @param {CalcItem} calcItem
 * @returns {number}
 */

class CalcItemBase {
  /**
   * @param {string} id
   * @param {string} title
   * @param {string} unit
   */
  constructor(id, title, unit) {
    /** @type {string} */
    this.id = id;

    /** @type {string} */
    this.title = title;

    /** @type {string} */
    this.unit = unit;

    /** @type {number} */
    this.min = null;

    /** @type {number} */
    this.max = null;

    /** @type {number} */
    this.step = 1;

    /** @type {number} */
    this.defaultValue = 0;

    /** @type {CalcResult} */
    this.calcResult = null;
  }

  /**
   * @param {number} min
   * @param {number} max
   * @param {number} step
   * @returns {CalcItemBase}
   */
  initRange(min, max, step = 1) {
    this.min = min;
    this.max = max;
    this.step = step;
    return this;
  }

  /**
   * @param {number} value
   * @returns {CalcItemBase}
   */
  initDefaultValue(value) {
    this.defaultValue = value;
    return this;
  }

  /**
   * @param {CalcResult} value
   */
  initCalcResult(value) {
    this.calcResult = value;
  }
}

class Calculation {
  constructor() {
  }
}

class CalcItemContainer {
  static TYPE_NORMAL = Symbol('normal');
  static TYPE_OPTIONS = Symbol('options');

  /**
   * @param {Calculation} parent
   * @param {symbol} category
   * @param {symbol} type
   */
  constructor(parent, category, type) {
    /** @type {Calculation} */
    this._parent = parent;

    /** @type {symbol} */
    this.category = category;

    /** @type {symbol} */
    this.type = type;

    /** @type {CalcItem[]} */
    this.items = [];

    /** @type {number} */
    this.currentItemIndex = 0;
  }

  get currentItem() {
    return this.type === CalcItemContainer.TYPE_OPTIONS ? this.items[this.currentItemIndex] : null;
  }
}

class CalcItem {
  /**
   * @param {CalcItemContainer} parent
   * @param {CalcItemBase} base
   */
  constructor(parent, base) {
    /** @type {CalcItemContainer} */
    this._parent = parent;

    /** @type {CalcItemBase} */
    this.base = base;

    /**
     * @type {number}
     * @private
     */
    this._value = base.defaultValue;

    /** @type {boolean} */
    this._enabled = true;

    this.controls = {
      toggle: false,
    };
  }

  get belongContainer() {
    return this._parent;
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
    const currentItem = this.belongContainer.currentItem;
    if (currentItem) {
      return currentItem === this;
    }
    return this._enabled;
  }

  get result() {
    return this.base.calcResult ? this.base.calcResult(this) : this._value;
  }

  toggle() {
    if (this.controls.toggle) {
      this._enabled = !this._enabled;
    }
  }
}

export { CalcItemBase, CalcItem, Calculation, CalcItemContainer };
