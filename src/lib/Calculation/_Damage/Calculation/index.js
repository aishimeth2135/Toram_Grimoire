
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
  /**
   * @param {string} name
   */
  constructor(name) {
    /** @type {string} */
    this.name = name;

    /** @type {Map<string, CalcItemContainer>} */
    this._containers = new Map();
  }

  /**
   * @param {string} id - unique ID
   * @param {symbol} category - CalcItemContainer.CATEGORY_X
   * @param {symbol} type - CalcItemContainer.TYPE_X
   * @returns {Calculation} this
   */
  appendContainer(id, category, type) {
    const container = new CalcItemContainer(this, id, category, type);
    this._containers.set(id, container);
    return this;
  }

  /**
   * @param {string} id
   * @returns {CalcItemContainer}
   */
  getContainer(id) {
    return this._containers.get(id);
  }
}

class CalcItemContainer {
  static TYPE_NORMAL = Symbol('normal');
  static TYPE_OPTIONS = Symbol('options');
  static CATEGORY_ADD = Symbol('add');
  static CATEGORY_MUL = Symbol('mul');
  static CATEGORY_OTHER = Symbol('other');

  /**
   * @param {Calculation} parent
   * @param {string} id
   * @param {symbol} category
   * @param {symbol} [type]
   */
  constructor(parent, id, category, type) {
    /** @type {string} */
    this.id = id;

    /** @type {Calculation} */
    this._parent = parent;

    /** @type {symbol} */
    this.category = category;

    /** @type {symbol} */
    this.type = type ?? CalcItemContainer.TYPE_NORMAL;

    /** @type {Map<string, CalcItem>} */
    this._items = new Map();

    /** @type {number} */
    this._currentItemId = 0;
  }

  /**
   * @returns {CalcItem}
   */
  get currentItem() {
    return this.type === CalcItemContainer.TYPE_OPTIONS ? this.getItem(this._currentItemId) : null;
  }

  /**
   * @param {string} id
   */
  selectItem(id) {
    this._currentItemId = id;
  }

  /**
   * @param {string} id
   * @returns {CalcItem}
   */
  getItem(id) {
    return this._items.get(id);
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
    if (this.belongContainer.type === CalcItemContainer.TYPE_OPTIONS) {
      return this.belongContainer.currentItem === this;
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
