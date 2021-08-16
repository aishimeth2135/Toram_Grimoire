
import { CalcItemContainer } from './index';

/**
 * @callback CalcResult
 * @param {CalcItemContainer} itemContainer
 * @param {CalcItemBaseContainer} baseContainer
 * @returns {number}
 */

class CalculationBase {
  constructor() {
    /** @type {Map<string, CalcItemBaseContainer>} */
    this.containers = new Map();
    this.calcStruct = null;
  }

  /**
   * @param {string} id - unique ID
   * @param {symbol} category - CalcItemContainer.CATEGORY_X
   * @param {symbol} type - CalcItemContainer.TYPE_X
   * @returns {CalcItemBaseContainer} this
   */
   appendContainer(id, type) {
    const container = new CalcItemBaseContainer(this, id, type);
    this.containers.set(id, container);
    return container;
  }

  /**
   * @param {object} struct
   */
  setCalcStruct(struct) {
    this.calcStruct = struct;
  }
}

class CalcItemBaseContainer {
  static TYPE_NORMAL = Symbol('normal');
  static TYPE_OPTIONS = Symbol('options');

  /**
   * @param {CalculationBase} parent
   * @param {string} id
   * @param {symbol} [type]
   */
  constructor(parent, id, type) {
    /** @type {string} */
    this.id = id;

    /** @type {CalculationBase} @private */
    this._parent = parent;

    /** @type {symbol} */
    this.type = type ?? CalcItemBaseContainer.TYPE_NORMAL;

    /** @type {Map<string, CalcItemBase>} */
    this.items = new Map();

    /** @type {CalcResult} @private */
    this._calcResult = null;

    this.controls = {
      toggle: true,
      select: true,
    };
  }

  /**
   * @param {CalcResult} value
   */
   setCalcResult(value) {
    this._calcResult = value;
  }

  /**
   * @param {string} id
   * @returns {CalcItemBase}
   */
  appendItem(id) {
    const item = new CalcItemBase(id);
    this.items.set(id, item);
    return item;
  }

  /**
   * @param {CalcItemContainer} itemContainer
   */
  result(itemContainer) {
    const res = (() => {
      if (this._calcResult) {
        return this._calcResult(itemContainer, this);
      }
      const currentItem = itemContainer.currentItem;
      return currentItem ? currentItem.value : 0;
    })();
    return Math.floor(res);
  }
}

class CalcItemBase {
  /**
   * @param {CalcItemBaseContainer} parent
   * @param {string} id
   * @param {string} unit
   */
  constructor(parent, id) {
    /** @type {CalcItemBaseContainer} */
    this._parent = parent;

    /** @type {string} */
    this.id = id;

    /** @type {string} */
    this.unit = null;

    /** @type {number} */
    this.min = null;

    /** @type {number} */
    this.max = null;

    /** @type {number} */
    this.step = 1;

    /** @type {number} */
    this.defaultValue = 0;
  }

  get belongContainer() {
    return this._parent;
  }

  /**
   * @param {number} min
   * @param {number} max
   * @param {number} step
   * @returns {CalcItemBase}
   */
  setRange(min, max, step = 1) {
    this.min = min;
    this.max = max;
    this.step = step;
    return this;
  }

  /**
   * @param {number} value
   * @returns {CalcItemBase}
   */
  setDefaultValue(value) {
    this.defaultValue = value;
    return this;
  }

  /**
   * @param {string} value
   */
  setUnit(value) {
    this.unit = value;
  }

  /**
   * Ally method to init simple multiplier item.
   * - `setRange(0, null, 10)`
   * - `setDefaultValue(100)`
   * - `setUnit("%")`
   * @returns {CalcItemBase}
   */
  initForMultiplier() {
    this.setRange(0, null, 10)
      .setDefaultValue(100)
      .setUnit('%');
    return this;
  }
}

export { CalcItemBase, CalculationBase, CalcItemBaseContainer };
