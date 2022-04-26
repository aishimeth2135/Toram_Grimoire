import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { StatBase } from '@/lib/Character/Stat'
import { StatTypes, StatNormalTypes } from '@/lib/Character/Stat/enums'


import { EnchantEquipment } from './build'
import STATE from './state'
import { EnchantItemConditions, EnchantEquipmentTypes } from './enums'

interface EnchantItemParams {
  baseName: string;
  potential: [number, number];
  limit: [EnchantItemOptionCommonValue, EnchantItemOptionCommonValue];
  unitValue: [[number, number], [number, number]];
  materialPointType: MaterialPointTypeRange;
  materialPointValue: EnchantItemOptionCommonValue;
  potentialConvertThreshold: EnchantItemOptionCommonValue;
}

interface EnchantItemConditionalPropertiesParams {
  potential: [number, number];
}

type EnchantItemOptionCommonValue = [number | null, number | null]
type MaterialPointTypeRange = 0 | 1 | 2 | 3 | 4 | 5

interface EnchantItemPropertyValue<T> {
  [StatTypes.Constant]: T;
  [StatTypes.Multiplier]: T;
}

class EnchantCategory {
  private _weaponOnly: boolean

  title: string
  items: EnchantItem[]

  constructor(title: string) {
    this.title = title
    this.items = markRaw([])
    this._weaponOnly = false
  }

  get weaponOnly(): boolean {
    return this._weaponOnly
  }
  setWeaponOnly() {
    this._weaponOnly = true
  }

  appendItem(params: EnchantItemParams): EnchantItem {
    const newItem = markRaw(new EnchantItem(this, params))
    this.items.push(newItem)
    return newItem
  }
}

/** */
class EnchantItem {
  private _category: EnchantCategory
  statBase: StatBase
  conditionalProps: EnchantItemConditionalProperties[]
  potential: EnchantItemPropertyValue<number>
  limit: EnchantItemPropertyValue<[number | null, number | null]>
  unitValue: EnchantItemPropertyValue<[number, number]>
  materialPointType: MaterialPointTypeRange
  materialPointValue: EnchantItemPropertyValue<number | null>
  potentialConvertThreshold: EnchantItemPropertyValue<number | null>

  constructor(category: EnchantCategory, {
    baseName, potential,
    limit, unitValue,
    materialPointType, materialPointValue,
    potentialConvertThreshold,
  }: EnchantItemParams) {
    this._category = category
    this.statBase = Grimoire.Character.findStatBase(baseName) as StatBase
    this.conditionalProps = []
    this.potential = {
      [StatTypes.Constant]: potential[0],
      [StatTypes.Multiplier]: potential[1],
    }
    this.limit = {
      [StatTypes.Constant]: limit[0],
      [StatTypes.Multiplier]: limit[1],
    }
    this.unitValue = {
      [StatTypes.Constant]: unitValue[0],
      [StatTypes.Multiplier]: unitValue[1],
    }
    this.materialPointType = materialPointType
    this.materialPointValue = {
      [StatTypes.Constant]: materialPointValue[0],
      [StatTypes.Multiplier]: materialPointValue[1],
    }
    this.potentialConvertThreshold = {
      [StatTypes.Constant]: potentialConvertThreshold[0],
      [StatTypes.Multiplier]: potentialConvertThreshold[1],
    }
  }

  get belongCategory() {
    return this._category
  }

  appendConditionalProps(condition: EnchantItemConditions, params: EnchantItemConditionalPropertiesParams): void {
    const newProp = new EnchantItemConditionalProperties(condition, params)
    this.conditionalProps.push(newProp)
  }

  checkConditionalProps(equipment: EnchantEquipment): EnchantItemConditionalProperties | null {
    return this.conditionalProps.find(conditionProp => {
      switch (conditionProp.condition) {
        case EnchantItemConditions.MainWeapon:
          return equipment.fieldType === EnchantEquipmentTypes.MainWeapon
        case EnchantItemConditions.BodyArmor:
          return equipment.fieldType === EnchantEquipmentTypes.BodyArmor
        case EnchantItemConditions.OriginalElement:
          return equipment.isOriginalElement
      }
    }) || null
  }

  getPotential(type: StatNormalTypes, equipment: EnchantEquipment): number {
    const cp = this.checkConditionalProps(equipment)
    return cp ? cp.potential[type] : this.potential[type]
  }

  getOriginalPotential(type: StatNormalTypes): number {
    return this.potential[type]
  }

  getLimit(type: StatNormalTypes): [number, number] {
    const originalLimit = this.limit[type]

    const add = Math.max(Math.floor((STATE.Character.level - 200) / 10) * 5, 0)
    const potentialCapacityLimit = this.getLimitFromPotentialCapacity(type, add)
    const lvLimit = Math.floor(STATE.Character.level / 10)

    const limit = Math.min(potentialCapacityLimit, lvLimit)
    return [
      originalLimit[1] === null ? -1 * limit : Math.max(originalLimit[1], -1 * lvLimit),
      originalLimit[0] === null ? limit : Math.min(originalLimit[0], lvLimit),
    ]
  }
  getLimitFromPotentialCapacity(type: StatNormalTypes, add: number = 0) {
    let potentialLimit = STATE.PotentialCapacity + add
    const bp = this.getOriginalPotential(type)
    if (bp === 6) {
      potentialLimit -= 10
    }
    return Math.floor(potentialLimit / bp)
  }
  getUnitValue(type: StatNormalTypes) {
    return this.unitValue[type]
  }

  getMaterialPointValue(type: StatNormalTypes): number {
    const value = this.materialPointValue[type]
    if (value === null) {
      return {
        '1': 5,
        '3': 16.5,
        '5': 25,
        '6': 33.5,
        '10': 50,
        '20': 100,
      } [this.getOriginalPotential(type).toString()] as number
    }
    return value
  }
  getPotentialConvertThreshold(type: StatNormalTypes) {
    const value = this.potentialConvertThreshold[type]
    return value || Math.min(STATE.PotentialConvertDefaultThreshold, this.getLimitFromPotentialCapacity(type))
  }
}

class EnchantItemConditionalProperties {
  condition: EnchantItemConditions
  potential: EnchantItemPropertyValue<number>

  constructor(condition: EnchantItemConditions, { potential }: EnchantItemConditionalPropertiesParams) {
    this.condition = condition
    this.potential = {
      [StatTypes.Constant]: potential[0],
      [StatTypes.Multiplier]: potential[1],
    }
  }
}

export { EnchantCategory, EnchantItem }
export type { MaterialPointTypeRange }
