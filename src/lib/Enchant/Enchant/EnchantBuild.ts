import Grimoire from '@/shared/Grimoire'

import { Stat } from '@/lib/Character/Stat'
import { StatNormalTypes, StatTypes } from '@/lib/Character/Stat'

import type { EnchantCategory, EnchantItem } from './EnchantBase'
import type { MaterialPointTypeRange } from './EnchantBase'
import { EnchantEquipmentTypes, EnchantStepTypes } from './enums'
import { enchantStates } from './state'
import { calcPotentialExtraRate } from './utils'

const EnchantEquipmentTypesList = [
  EnchantEquipmentTypes.MainWeapon,
  EnchantEquipmentTypes.BodyArmor,
] as const

const EnchantStepTypesList = [
  EnchantStepTypes.Normal,
  EnchantStepTypes.Each,
] as const

const EnchantStepStatTypesList = [
  StatTypes.Constant,
  StatTypes.Multiplier,
] as const

type EnchantBuildSaveData = {
  name: string
  equipment: EnchantEquipmentSaveData
}

type EnchantEquipmentSaveData = {
  basePotential: number
  originalPotential: number
  fieldType: number
  isOriginalElement: boolean
  steps: EnchantStepSaveData[]
}

type EnchantStepSaveData = {
  type: number
  hidden: boolean
  step: number
  stats: EnchantStepStatSaveData[]
}

type EnchantStepStatSaveData = {
  type: number
  value: number

  // basename of EnchantItem.statBase
  base: string
}

interface MaterialPointCost {
  type: MaterialPointTypeRange
  value: number
}

class EnchantBuild {
  name: string
  equipment: EnchantEquipment
  categorys: EnchantCategory[]

  constructor(name: string, equipment: EnchantEquipment | null = null) {
    this.name = name
    if (equipment) {
      this.equipment = equipment
    } else {
      this.equipment = new EnchantEquipment()
      this.equipment.originalPotential = 90
    }
    this.categorys = Grimoire.Enchant.categorys // link
  }

  save(): EnchantBuildSaveData {
    return {
      name: this.name,
      equipment: this.equipment.save(),
    }
  }

  static load(data: EnchantBuildSaveData) {
    const categorys = Grimoire.Enchant.categorys
    const equipment = EnchantEquipment.load(categorys, data.equipment)
    return new EnchantBuild(data.name, equipment)
  }

  clone() {
    const data = this.save()
    return EnchantBuild.load(data)
  }
}

class EnchantEquipment {
  private _steps: EnchantStep[]

  basePotential: number
  originalPotential: number
  fieldType: EnchantEquipmentTypes
  isOriginalElement: boolean

  constructor() {
    this._steps = []
    ;(this.basePotential = enchantStates.EquipmentBasePotentialMinimum),
      (this.originalPotential = 1)
    this.fieldType = EnchantEquipmentTypes.MainWeapon
    this.isOriginalElement = false
  }

  save(): EnchantEquipmentSaveData {
    const fieldType = EnchantEquipmentTypesList.indexOf(this.fieldType)
    const steps = this._steps.map(step => step.save())
    return {
      basePotential: this.basePotential,
      originalPotential: this.originalPotential,
      fieldType,
      isOriginalElement: this.isOriginalElement,
      steps,
    }
  }

  static load(
    categorys: EnchantCategory[],
    data: EnchantEquipmentSaveData
  ): EnchantEquipment {
    const equipment = new EnchantEquipment()
    equipment.basePotential = data.basePotential
    equipment.originalPotential = data.originalPotential
    equipment.fieldType = EnchantEquipmentTypesList[data.fieldType]
    equipment.isOriginalElement =
      typeof data.isOriginalElement === 'number'
        ? data.isOriginalElement
          ? true
          : false
        : data.isOriginalElement
    const steps = data.steps.map(stepData =>
      EnchantStep.load(categorys, equipment, stepData)
    )
    equipment.loadSteps(steps)
    return equipment
  }

  clone(categorys: EnchantCategory[]) {
    const data = this.save()
    return EnchantEquipment.load(categorys, data)
  }

  loadSteps(steps: EnchantStep[]) {
    this._steps = steps
  }

  get allSteps(): EnchantStep[] {
    return this._steps
  }

  get validSteps(): EnchantStep[] {
    if (!this.lastStep) {
      return []
    }
    return this.steps(this.lastStep.index).filter(
      step => step.stats.length !== 0
    )
  }

  get firstStep(): EnchantStep | null {
    return this.steps()[0] || null
  }

  get lastStep(): EnchantStep | null {
    return (
      this.steps().find((step, idx, ary) => {
        if (idx === ary.length - 1) {
          return true
        }
        return (
          step.remainingPotential < 1 ||
          !step.belongEquipment.checkStats(step.index)
        )
      }) || null
    )
  }

  get allMaterialPointCost(): number[] {
    const mats = Array(6).fill(0)
    this.steps().forEach(step =>
      step.stats.forEach(stat => {
        const item = stat.materialPointCost
        mats[item.type] += item.value
      })
    )
    return mats
  }

  /**
   * @returns {number} - Percentage of success rate, if value > 160, it will return -1
   */
  get successRate(): number {
    if (!this.lastStep) {
      return -1
    }
    const rate = this.realSuccessRate
    return rate >= 160 ? -1 : rate
  }

  /**
   * @returns Percentage of success rate
   */
  get realSuccessRate(): number {
    if (!this.lastStep) {
      return 160
    }
    const lastIndex = this.lastStep.index
    const pot = this.stepRemainingPotential(lastIndex)
    const previewStepPot = Math.max(
      this.stepRemainingPotential(lastIndex - 1),
      this.basePotential
    )
    return Math.max(160 + (pot * 230) / previewStepPot, 0)
  }

  get operationStepsQuantity() {
    if (!this.lastStep) {
      return 0
    }
    return this.steps(this.lastStep.index).reduce((cur, step) => {
      if (!step.firstStat) {
        return cur
      }
      if (step.type === EnchantStepTypes.Each) {
        return cur + Math.ceil(step.firstStat.value / step.step)
      }
      return cur + 1
    }, 0)
  }

  /**
   * append new empty step
   */
  appendStep(): EnchantStep {
    const step = new EnchantStep(this)
    this._steps.push(step)
    return step
  }

  /**
   * Get all not-hidden steps before given index (include)
   */
  steps(stepIdx?: number): EnchantStep[] {
    stepIdx = stepIdx === undefined ? this._steps.length - 1 : stepIdx
    return stepIdx < 0
      ? []
      : this._steps.slice(0, stepIdx + 1).filter(step => !step.hidden)
  }

  /**
   * @returns Remaining potential of specified step index
   */
  stepRemainingPotential(stepIdx?: number): number {
    return this.steps(stepIdx).reduce(
      (cur, step) => cur - step.potentialCost,
      this.originalPotential
    )
  }

  /**
   * @returns  Extra rate of specified step index
   */
  stepPotentialExtraRate(stepIdx?: number): number {
    const categorys: { category: EnchantCategory; cnt: number }[] = []
    this.stats(stepIdx).forEach(stat => {
      const category = stat.itemBase.belongCategory
      const check = categorys.find(_category => _category.category === category)
      check ? (check.cnt += 1) : categorys.push({ category, cnt: 1 })
    })
    return calcPotentialExtraRate(categorys.map(category => category.cnt))
  }

  /**
   * Insert EnchantStep before given step
   * @param target
   * @returns new EnchantStep be inserted
   */
  insertStepBefore(target: EnchantStep): EnchantStep {
    const step = new EnchantStep(this)
    this._steps.splice(target.index, 0, step)
    return step
  }

  /**
   * Calc sum of value of specified stat of all steps before step index,
   * then return EnchantStat which value is sum.
   */
  stat(
    itemBase: EnchantItem,
    type: StatNormalTypes,
    stepIdx?: number
  ): EnchantStat {
    const value = this.steps(stepIdx).reduce((cur, step) => {
      const stepStat = step.stat(itemBase, type)
      return stepStat?.valid ? cur + stepStat.value : cur
    }, 0)
    return new EnchantStat(itemBase, type, value)
  }

  /**
   * Get all stats of steps
   */
  stats(stepIdx?: number): EnchantStat[] {
    const stats: EnchantStat[] = []
    this.steps(stepIdx).forEach(step => {
      step.stats
        .filter(stat => stat.valid)
        .forEach(stat => {
          const find = stats.find(_stat => _stat.equals(stat))
          find ? find.add(stat.value) : stats.push(stat.pure())
        })
    })
    return stats
  }

  /**
   * Get the map of all stats of steps
   */
  statsMap(stepIdx?: number): Map<string, EnchantStat> {
    const statsMap: Map<string, EnchantStat> = new Map()
    this.steps(stepIdx).forEach(step => {
      step.stats
        .filter(stat => stat.valid)
        .forEach(stat => {
          const find = statsMap.get(stat.statId)
          find ? find.add(stat.value) : statsMap.set(stat.statId, stat.pure())
        })
    })
    return statsMap
  }

  checkStats(stepIdx?: number): boolean {
    return this.checkStatsMaximumNumber(stepIdx)
  }

  checkStatsMaximumNumber(stepIdx?: number): boolean {
    return this.stats(stepIdx).length < enchantStates.EquipmentItemMaximumNumber
  }

  /**
   * Check remaining potential of step > 0
   */
  checkStepRemainingPotential(stepIdx?: number): boolean {
    return this.stepRemainingPotential(stepIdx) > 0
  }

  refreshStats() {
    this.stats().forEach(stat => {
      const { min, max } = stat.limit
      const value = stat.value
      if (value > max || value < min) {
        const dif = value > max ? value - max : value - min
        this.steps()
          .slice()
          .reverse()
          .find(step => {
            const find = step.stat(stat.itemBase, stat.type)
            if (find) {
              find.add(-1 * dif)
              return true
            }
            return false
          })
      }
    })
  }

  swapStep(i1: number, i2: number) {
    if (
      i1 < 0 ||
      i2 < 0 ||
      i1 >= this._steps.length ||
      i2 >= this._steps.length
    ) {
      return false
    }
    const tmp = this._steps[i1]
    this._steps[i1] = this._steps[i2]
    this._steps[i2] = tmp
    return true
  }

  hasStat(stat: EnchantStat | EnchantStepStat, stepIdx?: number) {
    return this.stats(stepIdx).find(_stat => _stat.equals(stat)) ? true : false
  }

  checkMergeSteps() {
    const steps = this.steps()
    type MergeItem =
      | {
          merged: true
        }
      | {
          merged: boolean
          step: EnchantStep
          id: string
        }
    const ids: MergeItem[] = steps.map(step => {
      if (step.stats.length !== 1 || step.type !== EnchantStepTypes.Each) {
        return {
          merged: true,
        }
      }
      return {
        step,
        id: (step.firstStat as EnchantStepStat).statId,
        merged: false,
      }
    })
    ids.forEach((cur, idx) => {
      if (idx === ids.length - 1) {
        return
      }
      const next = ids[idx + 1]
      if (cur.merged || next.merged) {
        return
      }
      if (!cur.merged && !next.merged && cur.id === next.id) {
        const value = next.step.firstStat!.value
        next.step.remove() // 要先移除才加得進去
        cur.step.firstStat!.value += value
        next.merged = true
      }
    })

    steps.some((step, idx) => {
      if (idx === 0) {
        return false
      }
      if (step.potentialExtraRate > 1) {
        return true
      }
      if (step.isLastStep) {
        return true
      }
      const previousStep = step.previousStep!
      const stats = step.stats.map(stat => stat.clone())
      step.remove()
      stats.forEach(stat =>
        previousStep.appendStat(stat.itemBase, stat.type, stat.value)
      )
    })
  }
}

class EnchantStep {
  private _parent: EnchantEquipment
  stats: EnchantStepStat[]
  type: EnchantStepTypes
  step: number
  hidden: boolean

  constructor(parent: EnchantEquipment) {
    this._parent = parent
    this.stats = []
    this.type = EnchantStepTypes.Normal
    this.step = 1 // step for type == "each"
    this.hidden = false
  }

  save(): EnchantStepSaveData {
    return {
      type: EnchantStepTypesList.indexOf(this.type),
      hidden: this.hidden,
      step: this.step,
      stats: this.stats.map(stat => stat.save()),
    }
  }

  static load(
    categorys: EnchantCategory[],
    equipment: EnchantEquipment,
    data: EnchantStepSaveData
  ): EnchantStep {
    const step = new EnchantStep(equipment)
    step.type = EnchantStepTypesList[data.type] ?? EnchantStepTypes.Normal
    step.hidden =
      typeof data.hidden === 'number' ? data.hidden === 1 : data.hidden
    const stats = data.stats
      .map(statData => EnchantStepStat.load(categorys, step, statData))
      .filter(stat => stat) as EnchantStepStat[]
    step.stats = stats

    return step
  }

  get belongEquipment(): EnchantEquipment {
    return this._parent
  }

  get potentialExtraRate() {
    return this.belongEquipment.stepPotentialExtraRate(this.index)
  }

  get index() {
    return this._parent.allSteps.indexOf(this)
  }

  get potentialCost() {
    if (this.stats.length === 0) {
      return 0
    }
    const er = this.potentialExtraRate
    if (this.type === EnchantStepTypes.Normal) {
      return this.realPotentialCost(
        this.stats.reduce((cur, stat) => cur + stat.potentialCost, 0) * er
      )
    }
    if (this.type === EnchantStepTypes.Each) {
      return this.firstStat ? this.firstStat.potentialCost : 0
    }
    return 0
  }
  get remainingPotential() {
    return this.belongEquipment.stepRemainingPotential(this.index)
  }

  get previousStep(): EnchantStep | null {
    const idx = this.index
    if (idx === 0) {
      return null
    }
    const steps = this.belongEquipment.steps()
    return steps[idx - 1]
  }

  get nextStep(): EnchantStep | null {
    const steps = this.belongEquipment.steps()
    return steps[this.index + 1] || null
  }

  get isLastStep() {
    return this.belongEquipment.lastStep === this
  }

  get afterLastStep() {
    return this.belongEquipment.lastStep!.index < this.index
  }

  get firstStat(): EnchantStepStat | null {
    return this.stats[0] || null
  }

  appendStat(
    itemBase: EnchantItem,
    type: StatNormalTypes,
    value: number
  ): EnchantStepStat | null {
    const stat = new EnchantStepStat(this, itemBase, type, value)
    if (
      !this.belongEquipment.checkStats() &&
      !this.belongEquipment.hasStat(stat)
    ) {
      return null
    }
    this.stats.push(stat)
    return stat
  }

  stat(itemBase: EnchantItem, type: StatTypes): EnchantStepStat | null {
    return (
      this.stats.find(
        stat => stat.itemBase === itemBase && stat.type === type
      ) ?? null
    )
  }

  remove() {
    this.belongEquipment.allSteps.splice(this.index, 1)
    this.stats.forEach(stat => stat.remove())
  }

  realPotentialCost(potential: number): number {
    return potential >= 0 ? Math.floor(potential) : Math.ceil(potential)
  }

  hasStat(itemBase: EnchantItem, type: StatTypes): boolean {
    return this.stat(itemBase, type) ? true : false
  }

  autoFill() {
    if (this.index === 0 || !this.belongEquipment.lastStep) {
      return
    }
    const stats = this.belongEquipment.stats(
      this.belongEquipment.lastStep.index
    )
    const newStats: EnchantStepStat[] = []
    stats
      .filter(stat => stat.value > 0)
      .forEach(stat => {
        const { max } = stat.limit
        const find = this.stat(stat.itemBase, stat.type)
        if (find && find.value === stat.value) {
          return
        }
        const value = max - stat.value
        if (value === 0) {
          return
        }
        const newStat = new EnchantStepStat(
          this,
          stat.itemBase,
          stat.type,
          value
        )
        newStats.push(newStat)
      })
    newStats.forEach(stat => {
      const find = this.stat(stat.itemBase, stat.type)
      if (find) {
        find.value = stat.value
      } else {
        this.stats.push(stat)
      }
    })
  }

  /**
   * check whether the cost of potential will reduce after modify type
   * @param autoFix - if return value greater than autoFix, it will auto modify type to optimize
   * @returns number between -2 and 2
   *           - 2: cost will reduce
   *           - 1: TYPE_EACH is unnecessary
   *           - 0: potential cost will not reduce, but cost may reduce if stat.value increased
   *           - -1: cost will not reduce
   *           - -2: stats.length != 1 or cost <= 0
   */
  optimizeType(autoFix: number = 2): number {
    if (this.stats.length !== 1) {
      return -2
    }
    const oldType = this.type
    const check = (() => {
      const old = this.potentialCost
      if (old <= 0) {
        return -2
      }
      this.type =
        this.type === EnchantStepTypes.Normal
          ? EnchantStepTypes.Each
          : EnchantStepTypes.Normal
      if (this.potentialCost > old) {
        return -1
      }
      if (this.potentialCost === old) {
        if (oldType === EnchantStepTypes.Each) {
          return 1
        } else if (this.potentialExtraRate > 1) {
          return 0
        }
        return -1
      }
      return 2
    })()
    if (check <= autoFix) {
      this.type = oldType
    }
    return check
  }

  toString() {
    return `${this.type === EnchantStepTypes.Each ? '@' : '#'}|${this.stats
      .map(stat => stat.showBase())
      .join(', ')}|${this.remainingPotential}pt`
  }
}

class EnchantStat {
  readonly itemBase: EnchantItem
  readonly stat: Stat

  // init in `get limit()`
  private _lastCharacterLevel!: number
  private _limit!: { max: number; min: number }

  constructor(itemBase: EnchantItem, type: StatNormalTypes, value: number) {
    this.itemBase = itemBase
    this.stat = itemBase.statBase.createStat(type, value)
  }

  get value(): number {
    return this.stat.value as number
  }

  set value(value: number) {
    this.stat.value = value
  }

  get baseId(): string {
    return this.stat.baseId
  }

  get type(): StatNormalTypes {
    return this.stat.type as StatNormalTypes
  }

  get statId(): string {
    return this.stat.statId
  }

  get limit() {
    if (enchantStates.Character.level !== this._lastCharacterLevel) {
      this._lastCharacterLevel = enchantStates.Character.level
      this._limit = this.itemBase.getLimit(this.type)
    }
    return this._limit
  }

  get originalPotential() {
    return this.itemBase.getOriginalPotential(this.type)
  }

  get potentialConvertThreshold() {
    return this.itemBase.getPotentialConvertThreshold(this.type)
  }

  show(): string {
    return this.stat.show()
  }

  add(value: number) {
    return this.stat.add(value)
  }

  equals(estat: EnchantStat | EnchantStepStat): boolean {
    return this.stat.equals(estat.stat)
  }

  clone() {
    return new EnchantStat(this.itemBase, this.type, this.value)
  }

  /**
   * calc material point cost of from -> old. order of params has no effect.
   */
  calcMaterialPointCost(from: number, to: number): number {
    if (from > to) {
      const tmp = from
      from = to
      to = tmp
    }

    const smithlv = enchantStates.Character.smithLevel
    const rate = 100 - Math.floor(smithlv / 10) - Math.floor(smithlv / 50)
    const bv = this.itemBase.getMaterialPointValue(this.type)

    const calc = (_from: number, _to: number) => {
      _to = Math.abs(_to)
      _from = Math.abs(_from)
      if (_from > _to) {
        ;[_from, _to] = [_to, _from]
      }
      return Array(_to - _from)
        .fill(0)
        .map((_item, idx) => idx + _from + 1)
        .reduce(
          (item1, item2) =>
            item1 + Math.floor((item2 * item2 * bv * rate) / 100),
          0
        )
    }

    return from * to >= 0 ? calc(from, to) : calc(from, 0) + calc(0, to)
  }

  showAmount(
    type: 'current' | 'base' = 'current',
    previousValue: number = 0
  ): string {
    const { base, advanced } = this.itemBase.getUnitValue(this.type)
    const convertThreshold = this.potentialConvertThreshold
    let value = this.value + previousValue

    const sign = value < 0 ? -1 : 1
    value *= sign

    let v2 = 0
    if (value > convertThreshold) {
      v2 = value - convertThreshold
      value = convertThreshold
    }

    if (type === 'base') {
      let pv = previousValue * sign,
        pv2 = 0
      if (pv > convertThreshold) {
        pv2 = pv - convertThreshold
        pv = convertThreshold
      }
      value -= pv
      v2 -= pv2
    }

    value *= sign
    v2 *= sign

    return this.stat.show(value * base + v2 * advanced)
  }
}

class EnchantStepStat extends EnchantStat {
  static POTENTIAL_CONVERT_DEFAULT_THRESHOLD = 20

  private _parent: EnchantStep

  constructor(
    parent: EnchantStep,
    itemBase: EnchantItem,
    type: StatNormalTypes,
    value: number
  ) {
    super(itemBase, type, value)
    this._parent = parent
  }

  save(): EnchantStepStatSaveData {
    return {
      type: EnchantStepStatTypesList.indexOf(this.type),
      value: this.value,
      base: this.itemBase.statBase.baseId,
    }
  }

  static load(
    categorys: EnchantCategory[],
    step: EnchantStep,
    data: EnchantStepStatSaveData
  ) {
    let itemBase
    categorys.find(category => {
      itemBase = category.items.find(item => item.statBase.baseId === data.base)
      return itemBase
    })
    if (!itemBase) {
      console.warn(
        `can not find the EnchantItem "${data.base}" when load EnchantStepStat`
      )
      return null
    }
    const type = EnchantStepStatTypesList[data.type]
    return new EnchantStepStat(step, itemBase, type, data.value)
  }

  override get value() {
    return this.stat.value
  }

  override set value(value: number) {
    const eqstat = this.belongEquipment.stat(this.itemBase, this.type)
    const { min, max } = this.limit
    const ov = eqstat.add(-1 * this.value)
    if (ov + value > max) {
      value = max - ov
    }
    if (ov + value < min) {
      value = min - ov
    }

    this.stat.value = value
  }

  get index(): number {
    return this._parent.stats.indexOf(this)
  }

  get valid(): boolean {
    if (this._parent.type === EnchantStepTypes.Each && this.index !== 0) {
      return false
    }
    if (
      this.itemBase.belongCategory.weaponOnly &&
      this.belongEquipment.fieldType !== EnchantEquipmentTypes.MainWeapon
    ) {
      return false
    }
    return true
  }

  get belongEquipment(): EnchantEquipment {
    return this._parent.belongEquipment
  }

  get belongStep() {
    return this._parent
  }

  get potential() {
    return this.itemBase.getPotential(this.type, this.belongEquipment)
  }

  get potentialCost(): number {
    const prev = this.previousStepStatValue

    if (this._parent.type === EnchantStepTypes.Normal) {
      return this.calcPotentialCost(this.value, prev)
    } else {
      const er = this._parent.potentialExtraRate

      let sv = this._parent.step || 1
      const value = this.value
      let res = 0,
        cur = 0
      while (cur !== value) {
        if ((sv > 0 && cur + sv > value) || (sv < 0 && cur + sv < value)) {
          sv = value - cur
        }
        res += this._parent.realPotentialCost(
          this.calcPotentialCost(sv, cur + prev) * er
        )
        cur += sv
      }
      return res
    }
  }

  get finalPotentialEffect(): number {
    return this._parent.type === EnchantStepTypes.Normal
      ? -1 * this.potentialCost * this._parent.potentialExtraRate
      : -1 * this._parent.potentialCost
  }

  get materialPointCost(): MaterialPointCost {
    const from = this.previousStepStatValue,
      to = from + this.value
    return {
      type: this.itemBase.materialPointType,
      value: this.calcMaterialPointCost(from, to),
    }
  }

  get previousStepStatValue(): number {
    const stat = this.belongEquipment.stat(
      this.itemBase,
      this.type,
      this._parent.index - 1
    )
    return stat ? stat.value : 0
  }

  private _handleShow(type: 'current' | 'base' | 'each'): string {
    if (type === 'current' || type === 'base') {
      const prev = this.previousStepStatValue
      return this.showAmount(type, prev)
    } else if (type === 'each') {
      return this.stat.show(this.belongStep.step)
    }

    return this.stat.show()
  }

  showCurrent() {
    return this._handleShow('current')
  }

  showBase() {
    return this._handleShow('base')
  }

  showEach() {
    return this._handleShow('each')
  }

  calcPotentialCost(value: number, pre: number = 0): number {
    const potential = this.potential
    const convertThreshold = this.potentialConvertThreshold

    const sign = value < 0 ? -1 : 1

    let v2 = 0
    if (pre * sign <= convertThreshold) {
      value += pre
      value *= sign

      if (value > convertThreshold) {
        v2 = value - convertThreshold
        value = convertThreshold
      }
      value *= sign
      v2 *= sign

      value -= pre
    } else {
      v2 = value
      value = 0
    }

    const rate = 5 + enchantStates.Character.tec / 10
    return value + v2 >= 0
      ? value * potential + v2 * potential * 2
      : Math.ceil(((value * potential + (v2 * potential) / 2) * rate) / 100)
  }

  /**
   * remove this stat from step
   */
  remove(): void {
    this._parent.stats.splice(this.index, 1)
    this.belongEquipment.refreshStats()
  }

  pure(): EnchantStat {
    return super.clone()
  }
}

export {
  EnchantStat,
  EnchantStepStat,
  EnchantStep,
  EnchantEquipment,
  EnchantBuild,
}
export type { EnchantBuildSaveData }
