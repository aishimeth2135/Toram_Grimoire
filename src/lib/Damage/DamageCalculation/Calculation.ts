import type {
  CalcItemBase,
  CalcItemContainerBase,
  CalcResultOptions,
  CalcStructItem,
  CalculationBase,
} from './CalculationBase'
import {
  CalculationContainerIds,
  CalculationItemIds,
  ContainerTypes,
} from './enums'

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

interface CalculationConfig {
  getItemValue: ((itemId: CalculationItemIds) => number | null) | null
  getContainerCurrentItemId:
    | ((containerId: CalculationContainerIds) => CalculationItemIds | null)
    | null
  getContainerForceHidden:
    | ((containerId: CalculationContainerIds) => boolean | null)
    | null
}

class Calculation {
  base: CalculationBase
  name: string
  containers: Map<CalculationContainerIds, CalcItemContainer>
  items: Map<CalculationItemIds, CalcItem>
  containerCustomItems: Map<CalculationContainerIds, CalcItemCustom[]>
  config: CalculationConfig

  constructor(base: CalculationBase, name: string = '') {
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
      const item = new CalcItem(this, itemBase)
      this.items.set(itemBase.id, item)
    }

    for (const containerBase of this.base.containers.values()) {
      const container = new CalcItemContainer(this, containerBase)
      container.initItems()
      this.containers.set(containerBase.id, container)
    }

    this.config = {
      getItemValue: null,
      getContainerCurrentItemId: null,
      getContainerForceHidden: null,
    }
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
      const newItem = new CalcItemCustom(this, itemBase)
      this.containerCustomItems.get(containerId)!.push(newItem)
      return newItem
    }
    return null
  }

  removeCustomItem(containerId: CalculationContainerIds, item: CalcItemCustom) {
    if (!this.containerCustomItems.has(containerId)) {
      console.warn(
        `[Calculation.removeCustomItem] container with id ${containerId} is not exist in additional list.`
      )
      return
    }
    const items = this.containerCustomItems.get(containerId) as CalcItemCustom[]
    items.splice(items.indexOf(item), 1)
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
          currentItemId: container.selectable
            ? container.currentItem.base.id
            : null,
        }
      })
    const containerCustomItems = Array.from(
      this.containerCustomItems.entries()
    ).map(([containerId, customItems]) => {
      const itemsData = customItems.map(item => ({
        id: item.base.id,
        name: item.name,
        value: item.value,
      }))
      return {
        containerId,
        items: itemsData,
      }
    })
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
        console.warn(
          `[DamageCalculation.load] Item.id: ${itemData.id} is not exist`
        )
        return
      }
      item.value = itemData.value
    })
    data.containers.forEach(containerData => {
      const container = this.containers.get(containerData.id)
      if (!container) {
        console.warn(
          `[DamageCalculation.load] Container.id: ${containerData.id} is not exist`
        )
        return
      }
      // enabled will always be true if container is virtual
      container.enabled = container.base.isVirtual
        ? true
        : containerData.enabled
      if (containerData.currentItemId !== null) {
        container.selectItem(containerData.currentItemId)
      }
    })
    data.containerCustomItems.forEach(customItemData => {
      customItemData.items.forEach(itemData => {
        const item = this.appendCustomItem(
          customItemData.containerId,
          itemData.id
        )
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

  constructor(calculation: Calculation, base: CalcItemContainerBase) {
    this._calculation = calculation
    this.base = base
    this.enabled = base.enabledDefaultValue
    this.items = new Map()
    this._currentItemId = null
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
      return (
        !this.base.getCurrentItemId || this.base.getCurrentItemId(this) === null
      )
    }
    return false
  }

  get hidden(): boolean {
    if (this._calculation.config.getContainerForceHidden) {
      const value = this._calculation.config.getContainerForceHidden(
        this.base.id
      )
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
      const itemId = this._calculation.config.getContainerCurrentItemId(
        this.base.id
      )
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
      return this.belongCalculation.appendCustomItem(
        this.base.id,
        this.currentItem.base.id
      )
    }
    return null
  }
  removeCustomItem(item: CalcItemCustom): void {
    this.belongCalculation.removeCustomItem(this.base.id, item)
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

  selectItem(id: CalculationItemIds) {
    this._currentItemId = id
  }

  result(): number {
    return this.base.result(this)
  }
}

class CalcItem {
  private _calculation: Calculation
  private _value: number

  base: CalcItemBase

  constructor(calculation: Calculation, base: CalcItemBase) {
    this._calculation = calculation
    this.base = base
    this._value = base.defaultValue
  }
  get value(): number {
    const value = this._calculation.config.getItemValue?.(this.base.id)
    return value ?? this._value
  }

  set value(value: number) {
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

  constructor(calculation: Calculation, base: CalcItemBase, name: string = '') {
    super(calculation, base)

    this.name = name
  }
}

export { CalcItemContainer, Calculation, CalcItem, CalcItemCustom }
export type { CalculationSaveData }
