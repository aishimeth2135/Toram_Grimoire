import Grimoire from '@/shared/Grimoire'
import { toInt } from '@/shared/utils/number'
import { isNumberString, lastChar } from '@/shared/utils/string'

import { StatTypes } from './enums'

type StatValue = number | string

interface StatShowData {
  result: string
  title: string
  realValue: StatValue
  value: string
  tail: string
}

class StatBase {
  static sortStats = function (stats: Stat[], type = 'simple') {
    if (type === 'simple') {
      stats.sort((itema, itemb) => itema.base.order - itemb.base.order)
    }
    return stats
  }

  readonly baseId: string
  readonly text: string
  readonly hasMultiplier: boolean
  readonly order: number
  constantDisplayFormat: string
  multiplierDisplayFormat: string
  hidden: boolean
  devOnly: boolean

  constructor(baseId: string, text: string, hasMultiplier: boolean, order: number) {
    this.baseId = baseId
    this.text = text
    this.hasMultiplier = hasMultiplier
    this.order = order
    this.constantDisplayFormat = '$t$s$v$u'
    this.multiplierDisplayFormat = '$t$s$v$u'
    this.hidden = false
    this.devOnly = false
  }

  title(type: StatTypes): string {
    if (type === StatTypes.Constant) {
      if (this.hasMultiplier || lastChar(this.text) === '%') {
        return this.text
      }
      const unit = this.constantDisplayFormat.includes('$u') ? '%' : ''
      return this.text + unit
    }
    if (type === StatTypes.Multiplier || type === StatTypes.Total) {
      return this.text + '%'
    }
    console.warn('[StatBase.title] invalid type')
    return this.text
  }

  show(type: StatTypes, value: StatValue): string {
    const calc = (typeof value === 'string' && isNumberString(value)) || typeof value === 'number'
    if (typeof value !== 'number' && calc) {
      value = parseFloat(value)
    }
    const handleFormula = (formula: string, unit: string) => {
      const isPos = typeof value !== 'number' || value >= 0
      const sign = isPos ? '+' : ''
      formula = formula.split('::')[isPos ? 0 : 1] || formula
      let res = formula.replace('$t', this.text).replace('$u', unit).replace('$s', sign)
      if (typeof value === 'number') {
        res = res
          .replace('$v', (calc ? Math.floor(value) : value).toString())
          .replace(/\$(\d+)d/, (_match, p1) => (value as number).toFixed(toInt(p1) ?? 0))
      }
      return res
    }
    switch (type) {
      case StatTypes.Constant:
        return handleFormula(this.constantDisplayFormat, this.hasMultiplier ? '' : '%')
      case StatTypes.Multiplier:
        return handleFormula(this.multiplierDisplayFormat, '%')
      case StatTypes.Total:
        return handleFormula(Grimoire.i18n.t('common.Stat.type-total', { text: '$t$s$v$u' }), '%')
    }
  }

  getShowData(type: StatTypes, value: StatValue): StatShowData {
    let title = '',
      tail = ''
    if (type === StatTypes.Constant) {
      title = this.text
      if (!this.hasMultiplier && this.constantDisplayFormat.includes('$u')) {
        tail = '%'
      }
    } else if (type === StatTypes.Multiplier) {
      title = this.text
      tail = this.multiplierDisplayFormat.includes('$u') ? '%' : ''
    } else if (type === StatTypes.Total) {
      title = Grimoire.i18n.t('common.Stat.type-total', { text: this.text })
      tail = '%'
    }
    return {
      result: this.show(type, value),
      title,
      realValue: value,
      value: typeof value === 'number' ? value.toString() : value,
      tail,
    }
  }

  showValue(type: StatTypes, value: StatValue, useDefaultTail = true) {
    const showData = this.getShowData(type, value)
    value = value ?? showData.realValue
    const prefix = typeof value !== 'number' || value >= 0 ? '+' : ''
    return `${prefix}${value}${useDefaultTail || this.hasMultiplier ? showData.tail : ''}`
  }

  createStat(type: StatTypes, value: number): Stat {
    if (!this.hasMultiplier && type === StatTypes.Multiplier) {
      type = StatTypes.Constant
    }
    return new Stat(this, type, value)
  }

  createStatComputed(type: StatTypes, value: string): StatComputed {
    if (!this.hasMultiplier && type === StatTypes.Multiplier) {
      type = StatTypes.Constant
    }
    return new StatComputed(this, type, value)
  }

  checkBoolStat(type?: StatTypes) {
    type = type || StatTypes.Constant
    return type === StatTypes.Constant && this.constantDisplayFormat === '$t'
  }

  statId(type: StatTypes) {
    const typeShorthand = {
      [StatTypes.Constant]: '',
      [StatTypes.Multiplier]: '%',
      [StatTypes.Total]: '~',
    }[type]
    return `${this.baseId}${typeShorthand}`
  }

  baseEqual(stat: StatElementBase, type: StatTypes) {
    return stat.base.baseId === this.baseId && stat.type === type
  }
}

abstract class StatElementBase {
  readonly base: StatBase
  readonly type: StatTypes

  /**
   * @readonly
   */
  statId: string

  abstract value: StatValue

  abstract clone(): StatElementBase

  constructor(base: StatBase, type: StatTypes) {
    this.base = base
    this.type = type
    this.statId = this.base.statId(this.type)
  }

  get valueId() {
    return `${this.statId}_${this.value}`
  }
  get isBoolStat() {
    return this.base.checkBoolStat(this.type)
  }
  get title() {
    return this.base.title(this.type)
  }
  get baseId() {
    return this.base.baseId
  }

  show(value?: StatValue) {
    return this.base.show(this.type, value ?? this.value)
  }

  showValue(value?: StatValue) {
    return this.base.showValue(this.type, value ?? this.value)
  }

  getShowData() {
    return this.base.getShowData(this.type, this.value)
  }

  /**
   * If baseId and type are equal, return true.
   * (value do not have to be equal)
   */
  equals(stat: StatElementBase): boolean
  equals(statBase: StatBase, type: StatTypes): boolean
  equals(base: StatElementBase | StatBase, type?: StatTypes): boolean {
    if (base instanceof StatElementBase) {
      return base.base === this.base && base.type === this.type
    }
    return base === this.base && type === this.type
  }
}

class Stat extends StatElementBase {
  value: number

  constructor(base: StatBase, type: StatTypes, value: number = 0) {
    super(base, type)
    this.value = value
  }

  add(value: number): number {
    this.value += value
    return this.value
  }

  clone(): Stat {
    return this.base.createStat(this.type, this.value)
  }
}

class StatComputed extends StatElementBase {
  value: string

  constructor(base: StatBase, type: StatTypes, value: string = '') {
    super(base, type)
    this.value = value
  }

  clone(): StatComputed {
    return this.base.createStatComputed(this.type, this.value)
  }

  toStat(value: number): Stat {
    return new Stat(this.base, this.type, value)
  }
}

export { Stat, StatComputed, StatBase, StatElementBase }
export type { StatValue }
