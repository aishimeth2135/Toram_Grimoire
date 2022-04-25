import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { StatTypes } from './enums'

type StatValue = number | string
class StatBase {
  static sortStats = function(stats: Stat[], type = 'simple') {
    if (type === 'simple')
      stats.sort((itema, itemb) => itema.base.order - itemb.base.order)
    return stats
  }

  baseName: string
  text: string
  hasMultiplier: boolean
  order: number
  constantDisplayFormat: string
  multiplierDisplayFormat: string
  hidden: boolean

  constructor(baseName: string, text: string, hasMultiplier: boolean, order: number) {
    this.baseName = baseName
    this.text = text
    this.hasMultiplier = hasMultiplier
    this.order = order
    this.constantDisplayFormat = '$t$s$v$u'
    this.multiplierDisplayFormat = '$t$s$v$u'
    this.hidden = false
  }

  title(type: StatTypes): string {
    if (type === StatTypes.Constant) {
      if (this.hasMultiplier || this.text[this.text.length - 1] === '%') {
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
      const isPos = value >= 0 || !calc
      const sign = isPos ? '+' : ''
      formula = formula.split('::')[isPos ? 0 : 1] || formula
      let res = formula
        .replace('$t', this.text)
        .replace('$u', unit)
        .replace('$s', sign)
      if (typeof value === 'number') {
        res = res
          .replace('$v', (calc ? Math.floor(value) : value).toString())
          .replace(/\$(\d+)d/, (match, p1) => (value as number).toFixed(parseInt(p1, 10)))
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

  getShowData(type: StatTypes, value: StatValue) {
    let title = '', tail = ''
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
      value,
      tail,
    }
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
    return `${this.baseName}${typeShorthand}`
  }
}

abstract class StatElementBase {
  private _base: StatBase
  private _type: StatTypes

  abstract value: StatValue

  abstract clone(): StatElementBase

  constructor(base: StatBase, type: StatTypes) {
    this._base = base
    this._type = type
  }

  get base() {
    return this._base
  }
  get type() {
    return this._type
  }
  get statId() {
    return this.base.statId(this.type)
  }
  get isBoolStat() {
    return this.base.checkBoolStat(this.type)
  }
  get title() {
    return this.base.title(this.type)
  }
  get baseName() {
    return this.base.baseName
  }

  show(value?: StatValue) {
    return this.base.show(this.type, value ?? this.value)
  }

  getShowData() {
    return this.base.getShowData(this.type, this.value)
  }

  /**
   * if input_stat.baseName == this.baseName and input_stat.type == this.type, return true.
   * (value do not have to be equal)
   */
  equals(stat: StatElementBase): boolean {
    return stat.base === this.base && stat.type === this.type
  }
}

class Stat extends StatElementBase {
  value: number

  constructor(base: StatBase, type: StatTypes, value: number = 0) {
    super(base, type)
    this.value = value
  }

  add(value: number) {
    if (typeof this.value === 'number' && typeof value === 'number') {
      this.value += value
    }
    if (typeof this.value !== 'number' || typeof value !== 'number') {
      console.warn('[Stat.add] not allow to add with string')
    }
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

  toStat(value: number) {
    return new Stat(this.base, this.type, value)
  }
}

export { Stat, StatComputed, StatBase }
export type { StatValue }
