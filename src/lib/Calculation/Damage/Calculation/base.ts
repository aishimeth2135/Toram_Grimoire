import { CalculationContainerIds, CalculationItemIds, ContainerTypes } from './enums'
import { CalcItemContainer, Calculation } from './index'

type CalcStructExpression = CalcStructSingle | CalcStructMultiple
type CalcStructItem = CalcStructExpression | CalculationContainerIds

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
  containerResults?: {
    [key in CalculationContainerIds]?: number | ((itemContainer: CalcItemContainer) => number);
  };
}
interface CurrentItemIdGetter {
  (itemContainer: CalcItemContainer): CalculationItemIds | null;
}
interface HiddenGetter {
  (itemContainer: CalcItemContainer): boolean;
}
interface CalcResult {
  (itemContainer: CalcItemContainer): number;
}

/** */
class CalculationBase {
  containers: Map<CalculationContainerIds, CalcItemContainerBase>

  /**
   * All items store in CalculationBase.items, CalcItemContainerBase.items will refer to CalculationBase.items
   */
  items: Map<CalculationItemIds, CalcItemBase>

  constructor() {
    this.containers = new Map()
    this.items = new Map()
  }

  appendContainer(id: CalculationContainerIds, type: ContainerTypes): CalcItemContainerBase {
    const container = new CalcItemContainerBase(this, id, type)
    this.containers.set(id, container)
    return container
  }

  appendItem(id: CalculationItemIds): CalcItemBase {
    if (!this.items.has(id)) {
      const item = new CalcItemBase(this, id)
      this.items.set(id, item)
      return item
    }
    return this.items.get(id) as CalcItemBase
  }

  createCalculation(name: string = ''): Calculation {
    return new Calculation(this, name)
  }

  result(calculation: Calculation, calcStruct: CalcStructItem, options: CalcResultOptions = {}): number {
    if (!calcStruct) {
      return 0
    }

    const { containerResults = {} } = options

    const handle = (item: CalcStructItem): number => {
      if (typeof item === 'string') {
        const container = calculation.containers.get(item)
        if (container !== undefined) {
          const res = (() => {
            if (!container.enabled || container.hidden) {
              // disabled value
              return container.result()
            }
            const resultItem = containerResults[item]
            if (typeof resultItem === 'number') {
              return resultItem
            }
            if (typeof resultItem === 'function') {
              return resultItem(container)
            }
            return container.result()
          })()
          return container.base.isMultiplier ? res / 100 : res
        }
        console.warn('[DamageCalculation.result] unknown container id:', item)
        return 0
      }
      if (item.operator === '+') {
        return handle(item.left) + handle(item.right)
      }
      if (item.operator === '*') {
        return handle(item.left) * handle(item.right)
      }
      if (item.operator === '+++') {
        return item.list.reduce((cur, subItem) => cur + handle(subItem), 0)
      }
      if (item.operator === '***') {
        return item.list.reduce((cur, subItem) => cur * handle(subItem), 1)
      }
      console.warn('[DamageCalculation.result] Invalid CalcItem:', item)
      return 0
    }
    return Math.floor(handle(calcStruct))
  }
}

class CalcItemContainerBase {
  private _parent: CalculationBase
  private _calcResult: CalcResult | null

  id: CalculationContainerIds
  type: ContainerTypes
  items: Map<CalculationItemIds, CalcItemBase>
  getCurrentItemId: CurrentItemIdGetter | null
  getHidden: HiddenGetter | null
  isMultiplier: boolean
  floorResult: boolean
  enabledDefaultValue: boolean
  _disabledValue: number | null
  controls: { toggle: boolean }

  readonly references: CalculationContainerIds[]

  constructor(parent: CalculationBase, id: CalculationContainerIds, type: ContainerTypes) {
    this.id = id
    this._parent = parent
    this.type = type ?? ContainerTypes.Normal
    this.items = new Map()
    this.getCurrentItemId = null
    this.getHidden = null
    this.isMultiplier = false
    this.floorResult = true
    this.enabledDefaultValue = true
    this._calcResult = null
    this._disabledValue = null
    this.controls = {
      toggle: true,
    }
    this.references = []
  }

  get disabledValue(): number {
    if (this._disabledValue !== null) {
      return this._disabledValue
    }
    return this.isMultiplier ? 100 : 0
  }

  get isVirtual() {
    return this.references.length !== 0
  }

  setVirtual(referenceContainerIds: CalculationContainerIds[]) {
    if (this.items.size > 0) {
      console.warn('[CalcItemContainerBase.setVirtual] Unable to set container to virtual if container already have item')
      return
    }
    this.references.push(...referenceContainerIds)
  }

  appendItem(id: CalculationItemIds): CalcItemBase {
    const exist = this._parent.items.has(id)
    const item = this._parent.appendItem(id)
    if (!exist && this.isMultiplier) {
      item.setRange(0, null)
        .setDefaultValue(100)
        .setUnit('%')
    }
    if (this.isVirtual) {
      console.warn('[CalcItemContainerBase.appendItem] Unable to append item to virtual container')
      return item
    }
    this.items.set(id, item)
    return item
  }

  setCalcResult(value: CalcResult): void {
    this._calcResult = value
  }

  setGetCurrentItemId(value: CurrentItemIdGetter): void {
    this.getCurrentItemId = value
  }

  setGetHidden(value: HiddenGetter): void {
    this.getHidden = value
  }

  setDisabledValue(value: number): void {
    this._disabledValue = value
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
    this.isMultiplier = true
  }

  disableFloorResult(): void {
    this.floorResult = false
  }

  defaultDisabled(): void {
    this.enabledDefaultValue = false
  }

  result(itemContainer: CalcItemContainer): number {
    if (!itemContainer.enabled || itemContainer.hidden) {
      return this.disabledValue
    }
    const res = (() => {
      if (this._calcResult) {
        return this._calcResult(itemContainer)
      }
      return itemContainer.currentItem.value
    })()
    return this.floorResult ? Math.floor(res) : res
  }
}

class CalcItemBase {
  private _parent: CalculationBase
  private _min: number | null
  private _max: number | null

  id: CalculationItemIds
  unit: string
  step: number
  defaultValue: number

  constructor(parent: CalculationBase, id: CalculationItemIds) {
    this._parent = parent
    this.id = id
    this.unit = ''
    this._min = null
    this._max = null
    this.step = 1
    this.defaultValue = 0
  }

  get min(): number {
    return this._min === null ? -9999 : this._min
  }

  get max(): number {
    return this._max === null ? 9999 : this._max
  }

  setRange(min: number | null, max: number | null = null, step: number = 1): this {
    this._min = min
    this._max = max
    this.step = step
    return this
  }

  setDefaultValue(value: number): CalcItemBase {
    this.defaultValue = value
    return this
  }

  setUnit(value: string): this {
    this.unit = value
    return this
  }
}

export { CalcItemBase, CalculationBase, CalcItemContainerBase }
export type { CalcStructItem, CalcStructSingle, CalcStructMultiple, CalcStructExpression, CalcResultOptions, CurrentItemIdGetter }
