import { CalculationBase, CalcItemBase, CalcItemContainerBase, CalcStructItem, CalcResultOptions } from './base';

class Calculation {
  /**
   * @param {CalculationBase} base
   * @param {string} [name]
   */
  constructor(base, name = '') {
    /** @type {CalculationBase} */
    this.base = base;

    /** @type {string} */
    this.name = name;

    /** @type {Map<string, CalcItemContainer>} */
    this.containers = new Map();

    /** @type {Map<string, CalcItem>} */
    this.items = new Map();

    // init of containers and items
    for (const itemBase of this.base.items.values()) {
      const item = new CalcItem(itemBase);
      this.items.set(itemBase.id, item);
    }

    for (const containerBase of this.base.containers.values()) {
      const container = new CalcItemContainer(this, containerBase);
      container.initItems();
      this.containers.set(containerBase.id, container);
    }
  }

  /**
   * @param {CalcStructItem} calcStruct
   * @param {CalcResultOptions} options
   * @returns {number}
   */
  result(calcStruct, options) {
    return this.base.result(this, calcStruct, options);
  }

  save() {
    const items = Array.from(this.items.values()).map(item => ({
      id: item.base.id,
      value: item.value,
    }));
    const containers = Array.from(this.containers.values()).map(container => {
      return {
        id: container.base.id,
        enabled: container.enabled,
        currentItemId: container.selectable ? container.currentItem.base.id : null,
      };
    });
    return {
      name: this.name,
      containers,
      items,
    };
  }

  load(data) {
    this.name = data.name;
    data.items.forEach(itemData => {
      const item = this.items.get(itemData.id);
      if (!item) {
        console.warn(`[DamageCalculation.load] Item.id: ${itemData.id} is not exist`);
        return;
      }
      item.value = itemData.value;
    });
    data.containers.forEach(containerData => {
      const container = this.containers.get(containerData.id);
      if (!container) {
        console.warn(`[DamageCalculation.load] Container.id: ${containerData.id} is not exist`);
        return;
      }
      container.enabled = containerData.enabled;
      if (containerData.currentItemId !== null) {
        container.selectItem(containerData.currentItemId);
      }
    });
  }

  copy() {
    const calculation = this.base.createCalculation();
    calculation.load(this.save());
    calculation.name = this.name + '*';
    return calculation;
  }
}

class CalcItemContainer {
  /**
   * @param {Calculation} parent
   * @param {CalcItemContainerBase} base
   */
  constructor(parent, base) {
    /** @type {Calculation} @private */
    this._parent = parent;

    /** @type {CalcItemContainerBase} */
    this.base = base;

    /** @type {boolean} */
    this.enabled = base.enabledDefaultValue;

    /** @type {Map<string, CalcItem>} */
    this.items = new Map();

    /** @type {string} @private */
    this._currentItemId = null;
  }

  /**
   * generate refs of Items from Calculation
   */
  initItems() {
    let flag = true;
    for (const id of this.base.items.keys()) {
      const item = this.belongCalculation.items.get(id);
      if (flag) {
        this._currentItemId = id;
        flag = false;
      }
      this.items.set(id, item);
    }
  }

  get selectable() {
    return this.base.type === CalcItemContainerBase.TYPE_OPTIONS && !this.base.getCurrentItemId;
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
}

export { CalcItemContainer, Calculation };
