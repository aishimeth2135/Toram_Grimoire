import GetLang from '@/shared/services/Language';
import { isNumberString } from '@/shared/utils/string';
import { StatTypes } from './enums';


function Lang(id: string) {
  return GetLang('stat base/' + id);
}

type StatValue = number | string;

class StatBase {
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

  title(type: StatTypes): string {
    if (type === StatTypes.Constant) {
      if (this.hasMultiplier || this.text[this.text.length - 1] === '%') {
        return this.text;
      }
      const unit = this.constantDisplayFormat.includes('$u') ? '%' : '';
      return this.text + unit;
    }
    if (type === StatTypes.Multiplier || type === StatTypes.Total) {
      return this.text + '%';
    }
    console.warn('[StatBase.title] invalid type');
    return this.text;
  }

  show(type: StatTypes, value: StatValue): string {
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
      case StatTypes.Constant:
        return handleFormula(this.constantDisplayFormat, this.hasMultiplier ? '' : '%');
      case StatTypes.Multiplier:
        return handleFormula(this.multiplierDisplayFormat, '%');
      case StatTypes.Total:
        return handleFormula(Lang('type total: preText') + '$t$s$v$u', '%');
    }
    return '';
  }

  getShowData(type: StatTypes, v: StatValue) {
    let title = '', tail = '';
    if (type === StatTypes.Constant) {
      title = this.text;
      if (!this.hasMultiplier && this.constantDisplayFormat.includes('$u')) {
        tail = '%';
      }
    } else if (type === StatTypes.Multiplier) {
      title = this.text;
      tail = this.multiplierDisplayFormat.includes('$u') ? '%' : '';
    } else if (type === StatTypes.Total) {
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

  createStat(type: StatTypes, value: StatValue): Stat {
    if (!this.hasMultiplier && type === StatTypes.Multiplier) {
      type = StatTypes.Constant;
    }
    return new Stat(this, type, value);
  }

  checkBoolStat(type?: StatTypes) {
    type = type || StatTypes.Constant;
    return type === StatTypes.Constant && this.constantDisplayFormat === '$t';
  }

  statId(type: StatTypes) {
    const typeShorthand = {
      [StatTypes.Constant]: '$',
      [StatTypes.Multiplier]: '%',
      [StatTypes.Total]: '~',
    }[type];
    return `${this.baseName}${typeShorthand}`;
  }
}

class Stat {
  base: StatBase;
  type: StatTypes;
  value: StatValue;

  constructor(base: StatBase, type: StatTypes, v: StatValue = 0) {
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
export type { StatValue, StatTypes };
