import { CalculationBase, CalcItemBase, CalcItemContainerBase } from './base';
import type { CalcStructItem, CalcResultOptions } from './base';
import { ContainerTypes } from './enums';

interface CalculationSaveData {
  name: string;
  containers: {
    id: string;
    enabled: boolean;
    currentItemId: string | null;
  }[];
  items: {
    id: string;
    value: number;
  }[];
  containerCustomItems: {
    containerId: string;
    items: {
      id: string;
      name: string;
      value: number;
    }[];
  }[];
}

class Calculation {
  base: CalculationBase;
  name: string;
  containers: Map<string, CalcItemContainer>;
  items: Map<string, CalcItem>;
  containerCustomItems: Map<string, CalcItemCustom[]>;

  constructor(base: CalculationBase, name: string = '') {
    this.base = base;
    this.name = name;
    this.containers = new Map();
    this.items = new Map();
    this.containerCustomItems = new Map([
      ['other_constant', []],
      ['other_multiplier', []],
    ]);

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

  appendCustomItem(containerId: string, itemId: string): CalcItemCustom | null {
    if (!this.containerCustomItems.has(containerId)) {
      console.warn(`[Calculation.appendCustomItem] container with id ${containerId} is not exist in additional list.`);
      return null;
    }
    const container = this.containers.get(containerId);
    const itemBase = container ? container.base.items.get(itemId) : null;
    if (itemBase) {
      const newItem = new CalcItemCustom(itemBase);
      (this.containerCustomItems.get(containerId) as CalcItemCustom[]).push(newItem);
      return newItem;
    }
    return null;
  }

  removeCustomItem(containerId: string, item: CalcItemCustom) {
    if (!this.containerCustomItems.has(containerId)) {
      console.warn(`[Calculation.removeCustomItem] container with id ${containerId} is not exist in additional list.`);
      return;
    }
    const items = this.containerCustomItems.get(containerId) as CalcItemCustom[];
    items.splice(items.indexOf(item), 1);
  }

  result(calcStruct: CalcStructItem, options?: CalcResultOptions): number {
    return this.base.result(this, calcStruct, options);
  }

  save(): CalculationSaveData {
    const items = Array.from(this.items.values()).map(item => {
      return {
        id: item.base.id,
        value: item.value,
      };
    });
    const containers = Array.from(this.containers.values()).map(container => {
      return {
        id: container.base.id,
        enabled: container.enabled,
        currentItemId: container.selectable ? container.currentItem.base.id : null,
      };
    });
    const containerCustomItems = Array.from(this.containerCustomItems.entries()).map(([containerId, customItems]) => {
      const itemsData = customItems.map(item => ({
        id: item.base.id,
        name: item.name,
        value: item.value,
      }));
      return {
        containerId,
        items: itemsData,
      };
    });
    return {
      name: this.name,
      containers,
      items,
      containerCustomItems,
    };
  }

  load(data: CalculationSaveData) {
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
    data.containerCustomItems.forEach(customItemData => {
      customItemData.items.forEach(itemData => {
        const item = this.appendCustomItem(customItemData.containerId, itemData.id);
        if (item) {
          item.name = itemData.name;
          item.value = itemData.value;
        }
      });
    });
  }

  clone(): Calculation {
    const calculation = this.base.createCalculation();
    calculation.load(this.save());
    calculation.name = this.name + '*';
    return calculation;
  }
}

class CalcItemContainer {
  private _parent: Calculation;
  private _currentItemId: string | null;

  base: CalcItemContainerBase;
  enabled: boolean;
  items: Map<string, CalcItem>;

  constructor(parent: Calculation, base: CalcItemContainerBase) {
    this._parent = parent;
    this.base = base;
    this.enabled = base.enabledDefaultValue;
    this.items = new Map();
    this._currentItemId = null;
  }

  /**
   * generate refs of Items from Calculation
   */
  initItems() {
    let flag = true;
    for (const id of this.base.items.keys()) {
      const item = this.belongCalculation.items.get(id) as CalcItem;
      if (flag) {
        this._currentItemId = id;
        flag = false;
      }
      this.items.set(id, item);
    }
  }

  get selectable(): boolean {
    return this.base.type === ContainerTypes.Options && !this.base.getCurrentItemId;
  }

  get belongCalculation(): Calculation {
    return this._parent;
  }

  get currentItem(): CalcItem {
    if (this.base.getCurrentItemId !== null) {
      return this.items.get(this.base.getCurrentItemId(this, this.base)) as CalcItem;
    }
    return this.items.get(this._currentItemId as string) as CalcItem;
  }

  get customItemAddable(): boolean {
    return this.belongCalculation.containerCustomItems.has(this.base.id);
  }

  get customItems(): CalcItemCustom[] {
    return this.customItemAddable ? this.belongCalculation.containerCustomItems.get(this.base.id) as CalcItemCustom[] : [];
  }

  createCustomItem(): CalcItemCustom | null {
    if (this.customItemAddable) {
      return this.belongCalculation.appendCustomItem(this.base.id, this.currentItem.base.id);
    }
    return null;
  }
  removeCustomItem(item: CalcItemCustom): void {
    this.belongCalculation.removeCustomItem(this.base.id, item);
  }

  /**
   * Ally method to get value of item
   */
  getItemValue(id: string): number {
    if (!this.items.has(id)) {
      console.warn('[CalcItemContainer.getItemValue] unknown item id: ' + id);
      return 0;
    }
    return (this.items.get(id) as CalcItem).value;
  }

  selectItem(id: string) {
    this._currentItemId = id;
  }

  result(): number {
    return this.base.result(this);
  }
}

class CalcItem {
  private _value: number;

  base: CalcItemBase;

  constructor(base: CalcItemBase) {
    this.base = base;
    this._value = base.defaultValue;
  }
  get value(): number {
    return this._value;
  }

  set value(value: number) {
    const max = this.base.max,
      min = this.base.min;
    value = max !== null && value > max ? max : value;
    value = min !== null && value < min ? min : value;
    this._value = value;
  }

  get isCustom(): boolean {
    return false;
  }
}

class CalcItemCustom extends CalcItem {
  name: string;

  constructor(base: CalcItemBase, name: string = '') {
    super(base);

    /** @type {string} */
    this.name = name;
  }

  override get isCustom(): boolean {
    return true;
  }
}

export { CalcItemContainer, Calculation, CalcItem, CalcItemCustom };
export type { CalculationSaveData };
