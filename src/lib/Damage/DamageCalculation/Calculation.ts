import type {
  CalcItemBase,
  CalcItemContainerBase,
  CalcResultOptions,
  CalcStructItem,
  CalculationBase,
} from './CalculationBase'
import { CalculationContainerIds, CalculationItemIds, ContainerTypes } from './enums'

interface CalculationSaveData {
  name: string
  containers: {
    id: CalculationContainerIds
    enabled: boolean
    currentItemId: CalculationItemIds | null
  }[]
  items: {
    id: CalculationItemIds
    value: number
  }[]
  containerCustomItems: {
    containerId: CalculationContainerIds
    items: {
      id: CalculationItemIds
      name: string
      value: number
    }[]
  }[]
}

const calculationContainerIdSet = new Set<string>(Object.values(CalculationContainerIds))
const calculationItemIdSet = new Set<string>(Object.values(CalculationItemIds))

function isCalculationContainerId(value: unknown): value is CalculationContainerIds {
  return typeof value === 'string' && calculationContainerIdSet.has(value)
}

function isCalculationItemId(value: unknown): value is CalculationItemIds {
  return typeof value === 'string' && calculationItemIdSet.has(value)
}

function parseCalculationSaveData(data: unknown): CalculationSaveData | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const source = data as Record<string, unknown>
  if (
    typeof source.name !== 'string' ||
    !Array.isArray(source.containers) ||
    !Array.isArray(source.items) ||
    !Array.isArray(source.containerCustomItems)
  ) {
    return null
  }

  const containers = source.containers.flatMap(container => {
    if (!container || typeof container !== 'object') {
      return []
    }
    const item = container as Record<string, unknown>
    if (
      !isCalculationContainerId(item.id) ||
      typeof item.enabled !== 'boolean' ||
      (item.currentItemId !== null && !isCalculationItemId(item.currentItemId))
    ) {
      return []
    }
    return [
      {
        id: item.id,
        enabled: item.enabled,
        currentItemId: item.currentItemId,
      },
    ]
  })
  const items = source.items.flatMap(item => {
    if (!item || typeof item !== 'object') {
      return []
    }
    const value = item as Record<string, unknown>
    if (!isCalculationItemId(value.id) || typeof value.value !== 'number') {
      return []
    }
    return [{ id: value.id, value: Number.isFinite(value.value) ? value.value : 0 }]
  })
  const containerCustomItems = source.containerCustomItems.flatMap(container => {
    if (!container || typeof container !== 'object') {
      return []
    }
    const value = container as Record<string, unknown>
    if (!isCalculationContainerId(value.containerId) || !Array.isArray(value.items)) {
      return []
    }
    const customItems = value.items.flatMap(item => {
      if (!item || typeof item !== 'object') {
        return []
      }
      const customItem = item as Record<string, unknown>
      if (
        !isCalculationItemId(customItem.id) ||
        typeof customItem.name !== 'string' ||
        typeof customItem.value !== 'number'
      ) {
        return []
      }
      return [
        {
          id: customItem.id,
          name: customItem.name,
          value: Number.isFinite(customItem.value) ? customItem.value : 0,
        },
      ]
    })
    return [{ containerId: value.containerId, items: customItems }]
  })

  return {
    name: source.name,
    containers,
    items,
    containerCustomItems,
  }
}

interface CalculationConfig {
  getItemValue: ((itemId: CalculationItemIds) => number | null) | null
  getContainerCurrentItemId:
    ((containerId: CalculationContainerIds) => CalculationItemIds | null) | null
  getContainerForceHidden: ((containerId: CalculationContainerIds) => boolean | null) | null
}

class Calculation {
  base: CalculationBase
  name: string
  containers: Map<CalculationContainerIds, CalcItemContainer>
  items: Map<CalculationItemIds, CalcItem>
  containerCustomItems: Map<CalculationContainerIds, CalcItemCustom[]>
  config: CalculationConfig

  private constructor(base: CalculationBase, name: string = '') {
    this.base = base
    this.name = name
    this.containers = new Map()
    this.items = new Map()
    this.containerCustomItems = new Map([
      [CalculationContainerIds.OtherConstant, []],
      [CalculationContainerIds.OtherMultiplier, []],
    ])

    // init of containers and items
    for (const itemBase of this.base.items.values()) {
      const item = CalcItem.create(this, itemBase)
      this.items.set(itemBase.id, item)
    }

    for (const containerBase of this.base.containers.values()) {
      const container = CalcItemContainer.create(this, containerBase)
      container.initItems()
      this.containers.set(containerBase.id, container)
    }

    this.config = {
      getItemValue: null,
      getContainerCurrentItemId: null,
      getContainerForceHidden: null,
    }
  }

  static create(base: CalculationBase, name: string = ''): Calculation {
    return new Calculation(base, name)
  }

  appendCustomItem(
    containerId: CalculationContainerIds,
    itemId: CalculationItemIds
  ): CalcItemCustom | null {
    if (!this.containerCustomItems.has(containerId)) {
      console.warn(
        `[Calculation.appendCustomItem] container with id ${containerId} is not exist in additional list.`
      )
      return null
    }
    const container = this.containers.get(containerId)
    const itemBase = container ? container.base.items.get(itemId) : null
    if (itemBase) {
      const newItem = CalcItemCustom.create(this, itemBase)
      this.containerCustomItems.get(containerId)!.push(newItem)
      return newItem
    }
    return null
  }

  removeCustomItem(containerId: CalculationContainerIds, item: CalcItemCustom): boolean {
    if (!this.containerCustomItems.has(containerId)) {
      console.warn(
        `[Calculation.removeCustomItem] container with id ${containerId} is not exist in additional list.`
      )
      return false
    }
    const items = this.containerCustomItems.get(containerId) as CalcItemCustom[]
    const itemIndex = items.indexOf(item)
    if (itemIndex === -1) {
      return false
    }
    items.splice(itemIndex, 1)
    return true
  }

  result(calcStruct: CalcStructItem, options?: CalcResultOptions): number {
    return this.base.result(this, calcStruct, options)
  }

  save(): CalculationSaveData {
    const items = Array.from(this.items.values()).map(item => {
      return {
        id: item.base.id,
        value: item.value,
      }
    })
    const containers = Array.from(this.containers.values())
      .filter(container => !container.base.isVirtual)
      .map(container => {
        return {
          id: container.base.id,
          enabled: container.enabled,
          currentItemId: container.selectable ? container.currentItem.base.id : null,
        }
      })
    const containerCustomItems = Array.from(this.containerCustomItems.entries()).map(
      ([containerId, customItems]) => {
        const itemsData = customItems.map(item => ({
          id: item.base.id,
          name: item.name,
          value: item.value,
        }))
        return {
          containerId,
          items: itemsData,
        }
      }
    )
    return {
      name: this.name,
      containers,
      items,
      containerCustomItems,
    }
  }

  load(data: CalculationSaveData) {
    this.name = data.name
    data.items.forEach(itemData => {
      const item = this.items.get(itemData.id)
      if (!item) {
        console.warn(`[DamageCalculation.load] Item.id: ${itemData.id} is not exist`)
        return
      }
      item.value = itemData.value
    })
    data.containers.forEach(containerData => {
      const container = this.containers.get(containerData.id)
      if (!container) {
        console.warn(`[DamageCalculation.load] Container.id: ${containerData.id} is not exist`)
        return
      }
      // enabled will always be true if container is virtual
      container.enabled = container.base.isVirtual ? true : containerData.enabled
      if (containerData.currentItemId !== null) {
        container.selectItem(containerData.currentItemId)
      }
    })
    data.containerCustomItems.forEach(customItemData => {
      customItemData.items.forEach(itemData => {
        const item = this.appendCustomItem(customItemData.containerId, itemData.id)
        if (item) {
          item.name = itemData.name
          item.value = itemData.value
        }
      })
    })
  }

  clone(): Calculation {
    const calculation = this.base.createCalculation()
    calculation.load(this.save())
    calculation.name = this.name + '*'
    return calculation
  }
}

class CalcItemContainer {
  private _calculation: Calculation
  private _currentItemId: CalculationItemIds | null

  base: CalcItemContainerBase
  enabled: boolean
  items: Map<CalculationItemIds, CalcItem>

  private constructor(calculation: Calculation, base: CalcItemContainerBase) {
    this._calculation = calculation
    this.base = base
    this.enabled = base.enabledDefaultValue
    this.items = new Map()
    this._currentItemId = null
  }

  static create(calculation: Calculation, base: CalcItemContainerBase): CalcItemContainer {
    return new CalcItemContainer(calculation, base)
  }

  /**
   * generate refs of Items from Calculation
   */
  initItems() {
    let flag = true
    for (const id of this.base.items.keys()) {
      const item = this.belongCalculation.items.get(id)!
      if (flag) {
        this._currentItemId = id
        flag = false
      }
      this.items.set(id, item)
    }
  }

  get selectable(): boolean {
    if (this.base.type === ContainerTypes.Options) {
      return !this.base.getCurrentItemId || this.base.getCurrentItemId(this) === null
    }
    return false
  }

  get hidden(): boolean {
    if (this._calculation.config.getContainerForceHidden) {
      const value = this._calculation.config.getContainerForceHidden(this.base.id)
      if (value !== null) {
        return value
      }
    }
    return this.base.getHidden?.(this) ?? false
  }

  get belongCalculation(): Calculation {
    return this._calculation
  }

  get currentItem(): CalcItem {
    if (this._calculation.config.getContainerCurrentItemId) {
      const itemId = this._calculation.config.getContainerCurrentItemId(this.base.id)
      const item = itemId ? this.items.get(itemId) : null
      if (item) {
        return item
      }
    }
    if (this.base.getCurrentItemId !== null) {
      const itemId = this.base.getCurrentItemId(this)
      const item = itemId ? this.items.get(itemId) : null
      if (item) {
        return item
      }
    }
    return this.items.get(this._currentItemId!)!
  }

  get customItemAddable(): boolean {
    return this.belongCalculation.containerCustomItems.has(this.base.id)
  }

  get customItems(): CalcItemCustom[] {
    return this.customItemAddable
      ? this.belongCalculation.containerCustomItems.get(this.base.id)!
      : []
  }

  createCustomItem(): CalcItemCustom | null {
    if (this.customItemAddable) {
      return this.belongCalculation.appendCustomItem(this.base.id, this.currentItem.base.id)
    }
    return null
  }
  removeCustomItem(item: CalcItemCustom): boolean {
    return this.belongCalculation.removeCustomItem(this.base.id, item)
  }

  /**
   * Ally method to get value of item
   */
  getItemValue(id: CalculationItemIds): number {
    if (!this.items.has(id)) {
      console.warn('[CalcItemContainer.getItemValue] unknown item id: ' + id)
      return 0
    }
    return (this.items.get(id) as CalcItem).value
  }

  selectItem(id: CalculationItemIds): boolean {
    if (!this.items.has(id)) {
      return false
    }
    this._currentItemId = id
    return true
  }

  result(): number {
    return this.base.result(this)
  }
}

class CalcItem {
  private _calculation: Calculation
  private _value: number

  base: CalcItemBase

  protected constructor(calculation: Calculation, base: CalcItemBase) {
    this._calculation = calculation
    this.base = base
    this._value = base.defaultValue
  }

  static create(calculation: Calculation, base: CalcItemBase): CalcItem {
    return new CalcItem(calculation, base)
  }
  get value(): number {
    const value = this._calculation.config.getItemValue?.(this.base.id)
    return value ?? this._value
  }

  set value(value: number) {
    if (!Number.isFinite(value)) {
      value = this.base.defaultValue
    }
    const max = this.base.max,
      min = this.base.min
    value = max !== null && value > max ? max : value
    value = min !== null && value < min ? min : value
    this._value = value
  }

  isCustom(): this is CalcItemCustom {
    return this instanceof CalcItemCustom
  }
}

class CalcItemCustom extends CalcItem {
  name: string

  private constructor(calculation: Calculation, base: CalcItemBase, name: string = '') {
    super(calculation, base)

    this.name = name
  }

  static create(calculation: Calculation, base: CalcItemBase, name: string = ''): CalcItemCustom {
    return new CalcItemCustom(calculation, base, name)
  }
}

export { CalcItemContainer, Calculation, CalcItem, CalcItemCustom }
export { parseCalculationSaveData }
export type { CalculationSaveData }
