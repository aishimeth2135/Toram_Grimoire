import { CalcItemContainer, Calculation } from './Calculation'
import { CalculationContainerIds, CalculationItemIds, ContainerTypes } from './enums'

type CalcStructExpression = CalcStructSingle | CalcStructMultiple
type CalcStructItem = CalcStructExpression | CalculationContainerIds

type CalcStructAction = '@floor'

interface CalcStructSingle {
  id?: string
  operator: '*' | '+'
  left: CalcStructItem
  right: CalcStructItem
}
type CalcStructMultiple = CalcStructMultipleAdd | CalcStructMultipleMul
interface CalcStructMultipleAdd {
  id?: string
  operator: '+++'
  list: CalcStructItem[]
}
interface CalcStructMultipleMul {
  id?: string
  operator: '***'
  list: (CalcStructItem | CalcStructAction)[]
}
interface CalcResultOptions {
  containerResults?: Partial<Record<CalculationContainerIds, number>>
}
interface CurrentItemIdGetter {
  (context: CalcItemContainerContext): CalculationItemIds | null
}
interface HiddenGetter {
  (context: CalcItemContainerContext): boolean
}
interface CalcResult {
  (context: CalcItemContainerContext): number
}
interface CalcItemContainerContext {
  readonly currentItemId: CalculationItemIds | null
  readonly currentItemValue: number
  readonly customItemValues: readonly number[]
  getItemValue(id: CalculationItemIds): number
  getContainerResult(id: CalculationContainerIds): number
  getContainerCurrentItemId(id: CalculationContainerIds): CalculationItemIds | null
}
interface CalculationContainerSnapshot {
  readonly enabled: boolean
  readonly applicable: boolean
  readonly currentItemId: CalculationItemIds | null
  readonly customItemValues: readonly number[]
}
interface CalculationSnapshot {
  readonly itemValues: ReadonlyMap<CalculationItemIds, number>
  readonly containers: ReadonlyMap<CalculationContainerIds, CalculationContainerSnapshot>
}
interface CalculationSnapshotOverrides {
  readonly itemValues?: ReadonlyMap<CalculationItemIds, number>
}
interface CalculationEvaluationResult {
  readonly value: number
  readonly containerResults: ReadonlyMap<CalculationContainerIds, number>
}

function isCalcStructItem(payload: CalcStructItem | CalcStructAction): payload is CalcStructItem {
  return typeof payload !== 'string' || !payload.startsWith('@')
}

/** */
class CalculationBase {
  containers: Map<CalculationContainerIds, CalcItemContainerBase>

  /**
   * All items store in CalculationBase.items, CalcItemContainerBase.items will refer to CalculationBase.items
   */
  items: Map<CalculationItemIds, CalcItemBase>

  private constructor() {
    this.containers = new Map()
    this.items = new Map()
  }

  static create(): CalculationBase {
    return new CalculationBase()
  }

  appendContainer(id: CalculationContainerIds, type: ContainerTypes): CalcItemContainerBase {
    const container = CalcItemContainerBase.create(this, id, type)
    this.containers.set(id, container)
    return container
  }

  appendItem(id: CalculationItemIds): CalcItemBase {
    if (!this.items.has(id)) {
      const item = CalcItemBase.create(this, id)
      this.items.set(id, item)
      return item
    }
    return this.items.get(id) as CalcItemBase
  }

  createCalculation(name: string = ''): Calculation {
    return Calculation.create(this, name)
  }

  result(
    calculation: Calculation,
    calcStruct: CalcStructItem,
    options: CalcResultOptions = {}
  ): number {
    return this.evaluate(calculation.createSnapshot(), calcStruct, options).value
  }

  evaluate(
    snapshot: CalculationSnapshot,
    calcStruct: CalcStructItem,
    options: CalcResultOptions = {},
    overrides: CalculationSnapshotOverrides = {}
  ): CalculationEvaluationResult {
    if (!calcStruct) {
      return {
        value: 0,
        containerResults: new Map(),
      }
    }

    const { containerResults = {} } = options
    const evaluatedContainerResults = new Map<CalculationContainerIds, number>()

    const getItemValue = (id: CalculationItemIds) => {
      return overrides.itemValues?.get(id) ?? snapshot.itemValues.get(id) ?? 0
    }
    const evaluateContainer = (id: CalculationContainerIds): number => {
      const cached = evaluatedContainerResults.get(id)
      if (cached !== undefined) {
        return cached
      }

      const containerBase = this.containers.get(id)
      const container = snapshot.containers.get(id)
      if (!containerBase || !container) {
        console.warn('[DamageCalculation.evaluate] unknown container id:', id)
        return 0
      }

      const overriddenResult = containerResults[id]
      let result: number
      if (!container.enabled || !container.applicable) {
        result = containerBase.disabledValue
      } else if (overriddenResult !== undefined) {
        result = overriddenResult
      } else {
        const context: CalcItemContainerContext = {
          currentItemId: container.currentItemId,
          currentItemValue:
            container.currentItemId === null ? 0 : getItemValue(container.currentItemId),
          customItemValues: container.customItemValues,
          getItemValue,
          getContainerResult: evaluateContainer,
          getContainerCurrentItemId: containerId =>
            snapshot.containers.get(containerId)?.currentItemId ?? null,
        }
        result = containerBase.calculate(context)
      }
      evaluatedContainerResults.set(id, result)
      return result
    }

    const handle = (item: CalcStructItem): number => {
      if (typeof item === 'string') {
        const containerBase = this.containers.get(item)
        if (containerBase !== undefined) {
          const result = evaluateContainer(item)
          return containerBase.isMultiplier ? result / 100 : result
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
        return item.list.reduce((cur, subItem) => {
          if (isCalcStructItem(subItem)) {
            return cur * handle(subItem)
          }
          if (subItem === '@floor') {
            return Math.floor(cur * 100) / 100
          }
          return cur
        }, 1)
      }
      console.warn('[DamageCalculation.result] Invalid CalcItem:', item)
      return 0
    }
    return {
      value: Math.floor(handle(calcStruct)),
      containerResults: evaluatedContainerResults,
    }
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
  controls: {
    toggle: boolean
    valueValid: boolean
  }

  readonly references: CalculationContainerIds[]

  private constructor(parent: CalculationBase, id: CalculationContainerIds, type: ContainerTypes) {
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
      valueValid: true,
    }
    this.references = []
  }

  static create(
    parent: CalculationBase,
    id: CalculationContainerIds,
    type: ContainerTypes
  ): CalcItemContainerBase {
    return new CalcItemContainerBase(parent, id, type)
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
      console.warn(
        '[CalcItemContainerBase.setVirtual] Unable to set container to virtual if container already have item'
      )
      return
    }
    this.references.push(...referenceContainerIds)
  }

  appendItem(id: CalculationItemIds): CalcItemBase {
    const exist = this._parent.items.has(id)
    const item = this._parent.appendItem(id)
    if (!exist && this.isMultiplier) {
      item.setRange(0, null).setDefaultValue(100).setUnit('%')
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

  calculate(context: CalcItemContainerContext): number {
    const result = this._calcResult ? this._calcResult(context) : context.currentItemValue
    return this.floorResult ? Math.floor(result) : result
  }

  result(itemContainer: CalcItemContainer): number {
    if (!itemContainer.enabled || itemContainer.hidden) {
      return this.disabledValue
    }
    return this.calculate(itemContainer)
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

  private constructor(parent: CalculationBase, id: CalculationItemIds) {
    this._parent = parent
    this.id = id
    this.unit = ''
    this._min = null
    this._max = null
    this.step = 1
    this.defaultValue = 0
  }

  static create(parent: CalculationBase, id: CalculationItemIds): CalcItemBase {
    return new CalcItemBase(parent, id)
  }

  get min(): number {
    return this._min === null ? -99999 : this._min
  }

  get max(): number {
    return this._max === null ? 99999 : this._max
  }

  get belongCalculationBase() {
    return this._parent
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

export { CalcItemBase, CalculationBase, CalcItemContainerBase, isCalcStructItem }
export type {
  CalcStructItem,
  CalcStructSingle,
  CalcStructMultiple,
  CalcStructExpression,
  CalcStructAction,
  CalcResultOptions,
  CurrentItemIdGetter,
  CalcItemContainerContext,
  CalculationContainerSnapshot,
  CalculationSnapshot,
  CalculationSnapshotOverrides,
  CalculationEvaluationResult,
}
