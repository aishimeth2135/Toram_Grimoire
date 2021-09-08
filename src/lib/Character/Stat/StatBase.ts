import { ValuesType } from 'utility-types';

import GetLang from '@/shared/services/Language';
import { isNumberString } from '@/shared/utils/string';
import { StatTypes } from './consts';

type StatType = ValuesType<typeof StatTypes>;

function Lang(id: string) {
  return GetLang('stat base/' + id);
}

type StatValue = number | string;

class StatBase {
  static TYPE_CONSTANT = Symbol('constant');
  static TYPE_MULTIPLIER = Symbol('multiplier');
  static TYPE_TOTAL = Symbol('total');

  static sortStats = function(stats: Stat[], type = 'simple') {
    if (type === 'simple')
      stats.sort((itema, itemb) => itema.base.order - itemb.base.order);
    return stats;
  };

  baseName: string;
  text: string;
  hasMultiplier: boolean;
  order: number;
  constantDisplayFormat: string;
  multiplierDisplayFormat: string;

  constructor(baseName: string, text: string, hasMultiplier: boolean, order: number) {
    this.baseName = baseName;
    this.text = text;
    this.hasMultiplier = hasMultiplier;
    this.order = order;
    this.constantDisplayFormat = '$t$s$v$u';
    this.multiplierDisplayFormat = '$t$s$v$u';
  }

  title(type: StatType): string {
    if (type === StatTypes.constant) {
      if (this.hasMultiplier || this.text[this.text.length - 1] === '%') {
        return this.text;
      }
      const unit = this.constantDisplayFormat.includes('$u') ? '%' : '';
      return this.text + unit;
    }
    if (type === StatTypes.multiplier || type === StatTypes.total) {
      return this.text + '%';
    }
    console.warn('[StatBase.title] invalid type');
    return this.text;
  }

  show(type: StatType, value: StatValue): string {
    const calc = (typeof value === 'string' && isNumberString(value)) || typeof value === 'number';
    if (typeof value !== 'number' && calc) {
      value = parseFloat(value);
    }
    const handleFormula = (formula: string, unit: string) => {
      const isPos = value >= 0 || !calc;
      const sign = isPos ? '+' : '';
      formula = formula.split('::')[isPos ? 0 : 1] || formula;
      let res = formula
        .replace('$t', this.text)
        .replace('$u', unit)
        .replace('$s', sign);
      if (typeof value === 'number') {
        res = res
          .replace('$v', (calc ? Math.floor(value) : value).toString())
          .replace(/\$(\d+)d/, (match, p1) => (value as number).toFixed(parseInt(p1)));
      }
      return res;
    };
    switch (type) {
      case StatTypes.constant:
        return handleFormula(this.constantDisplayFormat, this.hasMultiplier ? '' : '%');
      case StatTypes.multiplier:
        return handleFormula(this.multiplierDisplayFormat, '%');
      case StatTypes.total:
        return handleFormula(Lang('type total: preText') + '$t$s$v$u', '%');
    }
    return '';
  }

  getShowData(type: StatType, v: StatValue) {
    let title = '', tail = '';
    if (type === StatTypes.constant) {
      title = this.text;
      if (!this.hasMultiplier && this.constantDisplayFormat.includes('$u')) {
        tail = '%';
      }
    } else if (type === StatTypes.multiplier) {
      title = this.text;
      tail = this.multiplierDisplayFormat.includes('$u') ? '%' : '';
    } else if (type === StatTypes.total) {
      title = Lang('type total: preText') + this.text;
      tail = '%';
    }
    return {
      result: this.show(type, v),
      title,
      value: v,
      tail,
    };
  }

  createStat(type: StatType, value: StatValue): Stat {
    if (!this.hasMultiplier && type === StatTypes.multiplier) {
      type = StatTypes.constant;
    }
    return new Stat(this, type, value);
  }

  checkBoolStat(type: StatType) {
    type = type || StatTypes.constant;
    return type === StatTypes.constant && this.constantDisplayFormat === '$t';
  }

  statId(type: StatType) {
    const typeShorthand = {
      [StatTypes.constant]: '$',
      [StatTypes.multiplier]: '%',
      [StatTypes.total]: '~',
    }[type];
    return `${this.baseName}${typeShorthand}`;
  }
}

class Stat {
  base: StatBase;
  type: StatType;
  value: StatValue;

  constructor(base: StatBase, type: StatType, v: StatValue = 0) {
    this.base = base;
    this.type = type;
    this.value = v;
  }

  get statId() {
    return this.base.statId(this.type);
  }
  get isBoolStat() {
    return this.base.checkBoolStat(this.type);
  }
  get title() {
    return this.base.title(this.type);
  }
  get baseName() {
    return this.base.baseName;
  }

  show(value: StatValue) {
    return this.base.show(this.type, value ?? this.value);
  }

  getShowData() {
    return this.base.getShowData(this.type, this.value);
  }

  add(value: number | string) {
    if (typeof this.value === 'number' && typeof value === 'number') {
      this.value += value;
    }
    if (typeof this.value !== 'number' || typeof value !== 'number') {
      console.warn('[Stat.add] not allow to add with string');
    }
    return this.value;
  }

  /**
   * if input_stat.baseName == this.baseName and input_stat.type == this.type, return true.
   * (value do not have to be equal)
   */
  equals(stat: Stat): boolean {
    return stat.base === this.base && stat.type === this.type;
  }

  copy(): Stat {
    return this.base.createStat(this.type, this.value);
  }
}

export { Stat, StatBase };
export type { StatValue, StatType };
