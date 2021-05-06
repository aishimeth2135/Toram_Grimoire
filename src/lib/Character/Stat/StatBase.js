import GetLang from "@services/Language";
import { isNumberString } from "@utils/string";

function Lang(s) {
  return GetLang('stat base/' + s);
}

class StatBase {
  static TYPE_CONSTANT = Symbol('constant');
  static TYPE_MULTIPLIER = Symbol('multiplier');
  static TYPE_TOTAL = Symbol('total');

  static sortStats = function(stats, type='simple') {
    if (type === 'simple')
      stats.sort((a, b) => a.base.order - b.base.order);
    return stats;
  }

  constructor(bn, t, hm, order) {
    /** @type {string} */
    this.baseName = bn;

    /** @type {string} */
    this.text = t;

    /** @type {boolean} */
    this.hasMultiplier = hm;

    /** @type {number} */
    this.order = order;

    /** @type {object} */
    this.attributes = {};
  }

  appendAttribute(n, v) {
    if (n && v !== null && v !== void 0)
      this.attributes[n] = v;
    return this;
  }

  /**
   * @param {symbol} type
   * @returns {string}
   */
  title(type) {
    if (type === StatBase.TYPE_CONSTANT)
      return this.hasMultiplier || this.text[this.text.length-1] === '%' ?
        this.text :
        this.text + (
          (this.attributes['constant_formula'] && this.attributes['constant_formula'].includes('$u')) || !this.attributes['constant_formula'] ?
          '%' :
          ''
        );
    if (type === StatBase.TYPE_MULTIPLIER)
      return this.text + '%';
  }

  /**
   * @param {symbol} type
   * @param {StatValue} v
   * @returns {string}
   */
  show(type, v) {
    const calc = isNumberString(v);
    if (typeof v !== 'number' && calc)
      v = parseFloat(v);
    const handleFormula = (formula, unit) => {
      const isPos = v >= 0 || !calc;
      const sign = isPos ? '+' : '';
      formula = formula.split('::')[isPos ? 0 : 1] || formula;
      let res = formula
        .replace('$t', this.text)
        .replace('$u', unit)
        .replace('$s', sign)
        .replace('$v', calc ? Math.floor(v) : v)
        .replace(/\$(\d+)d/, (m, m1) => v.toFixed(parseInt(m1)));
      return res;
    }
    switch (type) {
      case StatBase.TYPE_CONSTANT:
        return handleFormula(this.attributes['constant_formula'] || '$t$s$v$u', this.hasMultiplier ? '' : '%');
      case StatBase.TYPE_MULTIPLIER:
        return handleFormula(this.attributes['multiplier_formula'] || '$t$s$v$u', '%');
      case StatBase.TYPE_TOTAL:
        return handleFormula(Lang('type total: preText') + '$t$s$v$u', '%');
    }
  }

  /**
   * @param {symbol} type
   * @param {StatValue} v
   */
  getShowData(type, v) {
    let title = '', tail = '';
    if (type === StatBase.TYPE_CONSTANT) {
      title = this.text;
      if (!this.hasMultiplier)
        tail = '%';
      if (this.attributes['constant_formula'] && !this.attributes['constant_formula'].includes('$u'))
        tail = '';
    } else if (type === StatBase.TYPE_MULTIPLIER) {
      title = this.text;
      tail = '%';
      if (this.attributes['multiplier_formula'] && !this.attributes['multiplier_formula'].includes('$u'))
        tail = '';
    } else if (type === StatBase.TYPE_TOTAL) {
      title = Lang('type total: preText') + this.text;
      tail = '%';
    }
    return {
      result: this.show(type, v),
      title,
      value: v,
      tail
    };
  }

  /**
   * @param {symbol} type
   * @param {StatValue} [v]
   * @returns {Stat}
   */
  createStat(type, v) {
    if (!this.hasMultiplier && type === StatBase.TYPE_MULTIPLIER) {
      type = StatBase.TYPE_CONSTANT;
    }
    return new Stat(this, type, v);
  }

  /** @param {symbol} type */
  checkBoolStat(type) {
    type = type || StatBase.TYPE_CONSTANT;
    return type === StatBase.TYPE_CONSTANT && this.attributes['constant_formula'] === '$t';
  }

  /** @param {symbol} type */
  statId(type) {
    return `${this.baseName}|${type.description}`;
  }
}

class Stat {
  constructor(base, type, v = 0) {
    /** @type {StatBase} */
    this.base = base;

    /** @type {symbol} */
    this.type = type;

    /** @type {StatValue} */
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

  /** @param {StatValue} [v] */
  show(v) {
    if (v === void 0) {
      v = this.value;
    }
    return this.base.show(this.type, v);
  }

  getShowData() {
    return this.base.getShowData(this.type, this.value);
  }

  /** @param {StatValue} v */
  add(v) {
    this.value += v;
    return this.value;
  }

  /**
   * if input_stat.baseName == this.baseName and input_stat.type == this.type, return true.
   * (value do not have to be equal)
   * @param  {Stat} stat
   * @return {boolean}
   */
  equals(stat) {
    return stat.base === this.base && stat.type === this.type;
  }

  /** @return {Stat} */
  copy() {
    return this.base.createStat(this.type, this.value);
  }
}

export { Stat, StatBase };

/**
 * @typedef {string|number} StatValue
 */