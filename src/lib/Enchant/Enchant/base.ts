import { markRaw } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { computeFormula } from '@/shared/utils/data'

import { StatBase } from '@/lib/Character/Stat'
import { StatNormalTypes, StatTypes } from '@/lib/Character/Stat/enums'

import { EnchantEquipment } from './build'
import { EnchantEquipmentTypes, EnchantItemConditions } from './enums'
import STATE from './state'

interface EnchantItemParams {
  baseId: string
  potential: [number, number]
  limit: [EnchantItemOptionCommonValue, EnchantItemOptionCommonValue]
  extraLimit: [[string | null, string | null], [string | null, string | null]]
  unitValue: [[number, number], [number, number]]
  materialPointType: MaterialPointTypeRange
  materialPointValue: EnchantItemOptionCommonValue
  potentialConvertThreshold: EnchantItemOptionCommonValue
}

interface EnchantItemConditionalPropertiesParams {
  potential: [number, number]
}

type EnchantItemOptionCommonValue = [number | null, number | null]
type MaterialPointTypeRange = 0 | 1 | 2 | 3 | 4 | 5

interface EnchantItemPropertyValue<T> {
  readonly [StatTypes.Constant]: T
  readonly [StatTypes.Multiplier]: T
}

class EnchantCategory {
  private _weaponOnly: boolean

  readonly title: string
  readonly items: EnchantItem[]

  constructor(title: string) {
    this.title = title
    this.items = markRaw([])
    this._weaponOnly = false
  }

  get weaponOnly(): boolean {
    return this._weaponOnly
  }

  setWeaponOnly(): void {
    this._weaponOnly = true
  }

  appendItem(params: EnchantItemParams): EnchantItem {
    const newItem = markRaw(new EnchantItem(this, params))
    this.items.push(newItem)
    return newItem
  }
}

class EnchantItem {
  private readonly _category: EnchantCategory
  readonly statBase: StatBase
  readonly conditionalProps: EnchantItemConditionalProperties[]
  readonly potential: EnchantItemPropertyValue<number>
  readonly limit: EnchantItemPropertyValue<{
    base: number | null
    negative: number | null
  }>
  readonly extraLimit: EnchantItemPropertyValue<{
    base: string | null
    negative: string | null
  }>
  readonly unitValue: EnchantItemPropertyValue<{
    base: number
    advanced: number
  }>
  readonly materialPointType: MaterialPointTypeRange
  readonly materialPointValue: EnchantItemPropertyValue<number | null>
  readonly potentialConvertThreshold: EnchantItemPropertyValue<number | null>

  constructor(
    category: EnchantCategory,
    {
      baseId,
      potential,
      limit,
      extraLimit,
      unitValue,
      materialPointType,
      materialPointValue,
      potentialConvertThreshold,
    }: EnchantItemParams
  ) {
    this._category = category
    this.statBase = Grimoire.Character.findStatBase(baseId)!
    this.conditionalProps = []
    this.potential = {
      [StatTypes.Constant]: potential[0],
      [StatTypes.Multiplier]: potential[1],
    }
    this.limit = {
      [StatTypes.Constant]: {
        base: limit[0][0],
        negative: limit[0][1],
      },
      [StatTypes.Multiplier]: {
        base: limit[1][0],
        negative: limit[1][1],
      },
    }
    this.extraLimit = {
      [StatTypes.Constant]: {
        base: extraLimit[0][0],
        negative: extraLimit[0][1],
      },
      [StatTypes.Multiplier]: {
        base: extraLimit[1][0],
        negative: extraLimit[1][1],
      },
    }
    this.unitValue = {
      [StatTypes.Constant]: {
        base: unitValue[0][0],
        advanced: unitValue[0][1],
      },
      [StatTypes.Multiplier]: {
        base: unitValue[1][0],
        advanced: unitValue[1][1],
      },
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

  appendConditionalProps(
    condition: EnchantItemConditions,
    params: EnchantItemConditionalPropertiesParams
  ): void {
    const newProp = new EnchantItemConditionalProperties(condition, params)
    this.conditionalProps.push(newProp)
  }

  checkConditionalProps(
    equipment: EnchantEquipment
  ): EnchantItemConditionalProperties | null {
    return (
      this.conditionalProps.find(conditionProp => {
        switch (conditionProp.condition) {
          case EnchantItemConditions.MainWeapon:
            return equipment.fieldType === EnchantEquipmentTypes.MainWeapon
          case EnchantItemConditions.BodyArmor:
            return equipment.fieldType === EnchantEquipmentTypes.BodyArmor
          case EnchantItemConditions.OriginalElement:
            return equipment.isOriginalElement
        }
      }) || null
    )
  }

  getPotential(type: StatNormalTypes, equipment: EnchantEquipment): number {
    const cp = this.checkConditionalProps(equipment)
    return cp ? cp.potential[type] : this.potential[type]
  }

  getOriginalPotential(type: StatNormalTypes): number {
    return this.potential[type]
  }

  getLimit(type: StatNormalTypes): { max: number; min: number } {
    const originalLimit = this.limit[type]

    const add = Math.max(Math.floor((STATE.Character.level - 200) / 10) * 5, 0)
    const potentialCapacityLimit = this.getLimitFromPotentialCapacity(type, add)
    const lvLimit = Math.floor(STATE.Character.level / 10)

    const limit = Math.min(potentialCapacityLimit, lvLimit)

    const min =
      originalLimit.negative === null ? -1 * limit : originalLimit.negative
    const max = originalLimit.base === null ? limit : originalLimit.base

    const { base: extraLimitBase, negative: extraLimitNegative } =
      this.extraLimit[type]
    const CLv = STATE.Character.level - 200
    const vars = { CLv }
    const extraLimitMax =
      extraLimitBase !== null && CLv > 0
        ? (computeFormula(extraLimitBase, vars) as number)
        : 0
    const extraLimitMin =
      extraLimitNegative === null
        ? extraLimitMax * -1
        : -1 *
          (CLv > 0 ? (computeFormula(extraLimitNegative, vars) as number) : 0)

    return {
      min: Math.max(min + extraLimitMin, -1 * lvLimit),
      max: Math.min(max + extraLimitMax, lvLimit),
    }
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
      }[this.getOriginalPotential(type).toString()] as number
    }
    return value
  }
  getPotentialConvertThreshold(type: StatNormalTypes) {
    const value = this.potentialConvertThreshold[type]
    return (
      value ||
      Math.min(
        STATE.PotentialConvertDefaultThreshold,
        this.getLimitFromPotentialCapacity(type)
      )
    )
  }
}

class EnchantItemConditionalProperties {
  readonly condition: EnchantItemConditions
  readonly potential: EnchantItemPropertyValue<number>

  constructor(
    condition: EnchantItemConditions,
    { potential }: EnchantItemConditionalPropertiesParams
  ) {
    this.condition = condition
    this.potential = {
      [StatTypes.Constant]: potential[0],
      [StatTypes.Multiplier]: potential[1],
    }
  }
}

export { EnchantCategory, EnchantItem }
export type { MaterialPointTypeRange }
