import { ContainerTypes } from './enums';
import { CalcItemContainer, Calculation } from './index';

type CalcStructExpression = CalcStructSingle | CalcStructMultiple;
type CalcStructItem = CalcStructExpression | string;

interface CalcStructSingle {
  id?: string;
  operator: '*' | '+';
  left: CalcStructItem;
  right: CalcStructItem;
}
interface CalcStructMultiple {
  id?: string;
  operator: '***' | '+++';
  list: CalcStructItem[];
}
interface CalcResultOptions {
  containerResult?: {
    [key: string]: number | ((itemContainer: CalcItemContainer) => number);
  };
}
interface CurrentItemIdGetter {
  (itemContainer: CalcItemContainer, baseContainer: CalcItemContainerBase): string;
}
interface CalcResult {
  (itemContainer: CalcItemContainer, baseContainer: CalcItemContainerBase): number;
}

/** */
class CalculationBase {
  containers: Map<string, CalcItemContainerBase>;

  /**
   * All items store in CalculationBase.items, CalcItemContainerBase.items will refer to CalculationBase.items
   */
  items: Map<string, CalcItemBase>;

  constructor() {
    this.containers = new Map();
    this.items = new Map();
  }

  appendContainer(id: string, type: ContainerTypes): CalcItemContainerBase {
    const container = new CalcItemContainerBase(this, id, type);
    this.containers.set(id, container);
    return container;
  }

  appendItem(id: string): CalcItemBase {
    if (!this.items.has(id)) {
      const item = new CalcItemBase(this, id);
      this.items.set(id, item);
      return item;
    }
    return this.items.get(id) as CalcItemBase;
  }

  createCalculation(name: string = ''): Calculation {
    return new Calculation(this, name);
  }

  result(calculation: Calculation, calcStruct: CalcStructItem, options: CalcResultOptions = {}): number {
    if (!calcStruct) {
      return 0;
    }

    const { containerResult = {} } = options;

    const handle = (item: CalcStructItem): number => {
      if (typeof item === 'string') {
        const container = calculation.containers.get(item);
        if (container !== undefined) {
          const res = (() => {
            const resultItem = containerResult[item];
            if (typeof resultItem === 'number') {
              return resultItem;
            }
            if (typeof resultItem === 'function') {
              return resultItem(container);
            }
            return container.result();
          })();
          if (!container.enabled) {
            return container.base.isMultiplier ? container.base.disabledValue / 100 : container.base.disabledValue;
          }
          return container.base.isMultiplier ? res / 100 : res;
        }
        console.warn('[DamageCalculation.result] unknown container id:', item);
        return 0;
      }
      if (item.operator === '+') {
        return handle(item.left) + handle(item.right);
      }
      if (item.operator === '*') {
        return handle(item.left) * handle(item.right);
      }
      if (item.operator === '+++') {
        return item.list.reduce((cur, subItem) => cur + handle(subItem), 0);
      }
      if (item.operator === '***') {
        return item.list.reduce((cur, subItem) => cur * handle(subItem), 1);
      }
      console.warn('[DamageCalculation.result] Invalid CalcItem:', item);
      return 0;
    };
    return Math.floor(handle(calcStruct));
  }
}

class CalcItemContainerBase {
  private _parent: CalculationBase;
  private _calcResult: CalcResult | null;

  id: string;
  type: ContainerTypes;
  items: Map<string, CalcItemBase>;
  getCurrentItemId: CurrentItemIdGetter | null;
  isMultiplier: boolean;
  floorResult: boolean;
  enabledDefaultValue: boolean;
  _disabledValue: number | null;
  controls: { toggle: boolean };

  constructor(parent: CalculationBase, id: string, type: ContainerTypes) {
    this.id = id;
    this._parent = parent;
    this.type = type ?? ContainerTypes.Normal;
    this.items = new Map();
    this.getCurrentItemId = null;
    this.isMultiplier = false;
    this.floorResult = true;
    this.enabledDefaultValue = true;
    this._calcResult = null;
    this._disabledValue = null;
    this.controls = {
      toggle: true,
    };
  }

  get disabledValue(): number {
    if (this._disabledValue !== null) {
      return this._disabledValue;
    }
    return this.isMultiplier ? 100 : 0;
  }

  appendItem(id: string): CalcItemBase {
    const exist = this._parent.items.has(id);
    const item = this._parent.appendItem(id);
    if (!exist && this.isMultiplier) {
      item.setRange(0, null)
        .setDefaultValue(100)
        .setUnit('%');
    }
    this.items.set(id, item);
    return item;
  }

  setCalcResult(value: CalcResult): void {
    this._calcResult = value;
  }

  setGetCurrentItemId(value: CurrentItemIdGetter): void {
    this.getCurrentItemId = value;
  }

  setDisabledValue(value: number): void {
    this._disabledValue = value;
  }

  /**
   * mark this container is multipler, must call before append items.
   *
   * For all items:
   * - `setRange(0, null)`
   * - `setDefaultValue(100)`
   * - `setUnit("%")`
   */
  markMultiplier(): void {
    this.isMultiplier = true;
  }

  disableFloorResult(): void {
    this.floorResult = false;
  }

  defaultDisabled(): void {
    this.enabledDefaultValue = false;
  }

  result(itemContainer: CalcItemContainer): number {
    const res = (() => {
      if (this._calcResult) {
        return this._calcResult(itemContainer, this);
      }
      return itemContainer.currentItem.value;
    })();
    return this.floorResult ? Math.floor(res) : res;
  }
}

class CalcItemBase {
  private _parent: CalculationBase;
  private _min: number | null;
  private _max: number | null;

  id: string;
  unit: string;
  step: number;
  defaultValue: number;

  constructor(parent: CalculationBase, id: string) {
    this._parent = parent;
    this.id = id;
    this.unit = '';
    this._min = null;
    this._max = null;
    this.step = 1;
    this.defaultValue = 0;
  }

  get min(): number {
    return this._min === null ? -9999 : this._min;
  }

  get max(): number {
    return this._max === null ? 9999 : this._max;
  }

  setRange(min: number | null, max: number | null = null, step: number = 1): CalcItemBase {
    this._min = min;
    this._max = max;
    this.step = step;
    return this;
  }

  setDefaultValue(value: number): CalcItemBase {
    this.defaultValue = value;
    return this;
  }

  setUnit(value: string): void {
    this.unit = value;
  }
}

export { CalcItemBase, CalculationBase, CalcItemContainerBase };
export type { CalcStructItem, CalcStructSingle, CalcStructMultiple, CalcStructExpression, CalcResultOptions, CurrentItemIdGetter };
