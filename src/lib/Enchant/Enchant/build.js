import { EnchantCategory, EnchantItem } from './base';
import { Stat } from '@/lib/Character/Stat';
import { StatTypes } from '@/lib/Character/Stat/enums';
import STATE from './state';

import { calcPotentialExtraRate } from './utils';

import Grimoire from '@/shared/Grimoire';

class EnchantBuild {
  /**
   * @param {string} name
   * @param {EnchantEquipment} [equipment]
   */
  constructor(name, equipment = null) {
    this.name = name;
    if (equipment) {
      this.equipment = equipment;
    }
    else {
      this.equipment = new EnchantEquipment();
      this.equipment.originalPotential = 90;
    }
    this.categorys = Grimoire.Enchant.categorys; // link
  }

  /**
   * @typedef EnchantBuildSaveData
   * @type {Object}
   * @property {string} name
   * @property {EnchantEquipmentSaveData} equipment
   */
  /** @returns {EnchantBuildSaveData} */
  save() {
    return {
      name: this.name,
      equipment: this.equipment.save(),
    };
  }

  /**
   * @param {EnchantBuildSaveData} data
   */
  static load(data) {
    const categorys = Grimoire.Enchant.categorys;
    const equipment = EnchantEquipment.load(categorys, data.equipment);
    return new EnchantBuild(data.name, equipment);
  }

  copy() {
    const data = this.save();
    return EnchantBuild.load(data);
  }
}

class EnchantEquipment {
  static TYPE_MAIN_WEAPON = Symbol('main-weapon');
  static TYPE_BODY_ARMOR = Symbol('body-armor');
  static TYPES = [
    EnchantEquipment.TYPE_MAIN_WEAPON,
    EnchantEquipment.TYPE_BODY_ARMOR,
  ];

  constructor() {
    /** @type {Array<EnchantStep>} @private */
    this._steps = [];
    /** @type {number} */
    this.basePotential = STATE.EquipmentBasePotentialMinimum,
    /** @type {number} */
    this.originalPotential = 1;
    /** @type {symbol} */
    this.fieldType = EnchantEquipment.TYPE_MAIN_WEAPON;
    /** @type {boolean} */
    this.isOriginalElement = false;
  }

  /**
   * @typedef EnchantEquipmentSaveData
   * @type {Object}
   * @property {number} basePotential
   * @property {number} originalPotential
   * @property {number} fieldType - symbol to number
   * @property {number} isOriginalElement - boolean to number
   * @property {Array<EnchantStepSaveData>} steps
   */
  /** @return {EnchantEquipmentSaveData} */
  save() {
    const fieldType = EnchantEquipment.TYPES.indexOf(this.fieldType);
    const isOriginalElement = this.isOriginalElement ? 1 : 0;
    const steps = this._steps.map(step => step.save());
    return {
      basePotential: this.basePotential,
      originalPotential: this.originalPotential,
      fieldType,
      isOriginalElement,
      steps,
    };
  }
  /**
   * @param {Array<EnchantCategory>} categorys
   * @param {EnchantEquipmentSaveData} data
   * @returns {EnchantEquipment}
   */
  static load(categorys, data) {
    const equipment = new EnchantEquipment();
    equipment.basePotential = data.basePotential;
    equipment.originalPotential = data.originalPotential;
    equipment.fieldType = EnchantEquipment.TYPES[data.fieldType];
    equipment.isOriginalElement = data.isOriginalElement === 1 ? true : false;
    const steps = data.steps.map(stepData => EnchantStep.load(categorys, equipment, stepData));
    equipment.loadSteps(steps);
    return equipment;
  }

  copy(categorys) {
    const data = this.save();
    return EnchantEquipment.load(categorys, data);
  }

  /** @param {Array<EnchantStep>} steps */
  loadSteps(steps) {
    this._steps = steps;
  }

  /** @returns {Array<EnchantStep>} */
  get allSteps() {
    return this._steps;
  }

  /** @returns {Array<EnchantStep>} */
  get validSteps() {
    if (!this.lastStep) {
      return [];
    }
    return this.steps(this.lastStep.index).filter(step => step.stats.length !== 0);
  }

  /** @returns {EnchantStep} */
  get lastStep() {
    return this.steps().find((step, i, ary) => {
      if ((i === ary.length - 1)) {
        return true;
      }
      return step.remainingPotential < 1
        || !step.belongEquipment.checkStats(step.index);
    });
  }

  /** @return {Array<number>} */
  get allMaterialPointCost() {
    const mats = Array(6).fill(0);
    this.steps().forEach(step =>
      step.stats.forEach(stat => {
        const t = stat.materialPointCost;
        mats[t.type] += t.value;
      }),
    );
    return mats;
  }

  /**
   * @returns {number} - Percentage of success rate
   */
  get successRate() {
    if (!this.lastStep) {
      return -1;
    }
    const rate = this.realSuccessRate;
    return rate >= 160 ? -1 : rate;
  }

  /**
   * @returns {number} - Percentage of success rate
   */
  get realSuccessRate() {
    if (!this.lastStep) {
      return 160;
    }
    const last_index = this.lastStep.index;
    const pot = this.stepRemainingPotential(last_index);
    const d = Math.max(this.stepRemainingPotential(last_index - 1), this.basePotential);
    return Math.max(160 + pot * 230 / d, 0);
  }

  get operationStepsNum() {
    return this.steps(this.lastStep.index).reduce((cur, step) => {
      if (step.type === EnchantStep.TYPE_EACH) {
        return cur + Math.ceil(step.firstStat.value / step.step);
      }
      return cur + 1;
    }, 0);
  }

  /**
   * append new empty step
   * @returns {EnchantStep}
   */
  appendStep() {
    const step = new EnchantStep(this);
    this._steps.push(step);
    return step;
  }

  /**
   * Get all not-hidden steps before given index (include)
   * @param {number} [stepIdx]
   * @returns {Array<EnchantStep>}
   */
  steps(stepIdx = null) {
    stepIdx = stepIdx === null ? this._steps.length - 1 : stepIdx;
    return stepIdx < 0 ? [] :
      this._steps.slice(0, stepIdx + 1).filter(step => !step.hidden);
  }

  /**
   * @param {number} [stepIdx]
   * @returns {number} - Remaining potential of specified step index
   */
  stepRemainingPotential(stepIdx) {
    return this.steps(stepIdx)
      .reduce((c, step) => (c - step.potentialCost), this.originalPotential);
  }

  /**
   * @param {number} [stepIdx]
   * @returns {number} - Extra rate of specified step index
   */
  stepPotentialExtraRate(stepIdx) {
    const categorys = [];
    this.stats(stepIdx).forEach(stat => {
      const cat = stat.itemBase.belongCategory;
      const check = categorys.find(a => a.category === cat);
      check ? ++check.cnt : categorys.push({ category: cat, cnt: 1 });
    });
    return calcPotentialExtraRate(categorys.map(category => category.cnt));
  }

  /**
   * Insert EnchantStep before given step
   * @param {EnchantStep} target
   * @returns {EnchantStep} - new EnchantStep be inserted
   */
  insertStepBefore(target) {
    const step = new EnchantStep(this);
    this._steps.splice(target.index, 0, step);
    return step;
  }

  /**
   * Calc sum of value of specified stat of all steps before step index,
   * then return EnchantStat which value is sum.
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @param {number} [stepIdx]
   * @returns {EnchantStat}
   */
  stat(itemBase, type, stepIdx) {
    const v = this.steps(stepIdx).reduce((c, step) => {
      const t = step.stat(itemBase, type);
      return t && t.valid ? c + t.value : c;
    }, 0);
    return new EnchantStat(itemBase, type, v);
  }

  /**
   * Get all stats of steps
   * @param {number} [stepIdx]
   * @returns {Array<EnchantStat>}
   */
  stats(stepIdx) {
    const stats = [];
    this.steps(stepIdx).forEach(step => {
      step.stats.filter(stat => stat.valid).forEach(stat => {
        const t = stats.find(b => b.equals(stat));
        t ?  t.add(stat.value) : stats.push(stat.pure());
      });
    });
    return stats;
  }

  /**
   * @param {number} [stepIdx]
   * @returns {boolean}
   */
  checkStats(stepIdx) {
    return this.checkStatsMaximumNumber(stepIdx);
  }

  /**
   * @param {number} [stepIdx]
   * @returns {boolean}
   */
  checkStatsMaximumNumber(stepIdx) {
    return this.stats(stepIdx).length < STATE.EquipmentItemMaximumNumber;
  }

  /**
   * Check remaining potential of step > 0
   * @param {number} [stepIdx]
   * @returns {boolean}
   */
  checkStepRemainingPotential(stepIdx) {
    return this.stepRemainingPotential(stepIdx) > 0;
  }


  refreshStats() {
    this.stats().forEach(stat => {
      const [min, max] = stat.limit;
      const v = stat.value;
      if (v > max || v < min) {
        const dif = v > max ? v - max : v - min;
        this.steps().slice().reverse().find(step => {
          const t = step.stat(stat.itemBase, stat.type);
          if (t) {
            t.add(-1 * dif);
            return true;
          }
          return false;
        });
      }
    });
  }

  swapStep(i1, i2) {
    if (i1 < 0 || i2 < 0 || i1 >= this._steps.length || i2 >= this._steps.length) {
      return false;
    }
    const t = this._steps[i1];
    this._steps[i1] = this._steps[i2];
    this._steps[i2] = t;
    return true;
  }

  /**
   * @param {EnchantStat|EnchantStepStat} stat
   * @param {number} [stepIdx]
  */
  hasStat(stat, stepIdx) {
    return this.stats(stepIdx).find(q => q.equals(stat)) ? true : false;
  }
}


class EnchantStep {
  static TYPE_NORMAL = Symbol('normal');
  static TYPE_EACH = Symbol('each');
  static TYPES = [
    EnchantStep.TYPE_NORMAL,
    EnchantStep.TYPE_EACH,
  ];

  /**
   * @param {EnchantEquipment} parent
   */
  constructor(parent) {
    /** @type {EnchantEquipment} */
    this._parent = parent;
    /** @type {Array<EnchantStepStat>} */
    this.stats = [];
    /** @type {symbol} */
    this.type = EnchantStep.TYPE_NORMAL;
    this.step = 1; // step for type == "each"
    this.hidden = false;
  }

  /**
   * @typedef EnchantStepSaveData
   * @type {Object}
   * @property {0|1} type - symbol to number
   * @property {0|1} hidden - boolean to number
   * @property {number} step
   * @property {Array<EnchantStepStatSaveData>} stats
   */
  /** @returns {EnchantStepSaveData} */
  save() {
    return {
      type: EnchantStep.TYPES.indexOf(this.type),
      hidden: this.hidden ? 1 : 0,
      step: this.step,
      stats: this.stats.map(stat => stat.save()),
    };
  }

  /**
   * @param {Array<EnchantCategory>} categorys
   * @param {EnchantEquipment} equipment
   * @param {EnchantStepSaveData} data
   */
  static load(categorys, equipment, data) {
    const step = new EnchantStep(equipment);
    step.type = EnchantStep.TYPES[data.type];
    step.hidden = data.hidden === 1 ? true : false;
    const stats = data.stats.map(statData => EnchantStepStat.load(categorys, step, statData));
    step.stats = stats;

    return step;
  }

  /** @return {EnchantEquipment} */
  get belongEquipment() {
    return this._parent;
  }
  get potentialExtraRate() {
    return this.belongEquipment.stepPotentialExtraRate(this.index);
  }
  get index() {
    return this._parent.allSteps.indexOf(this);
  }
  get potentialCost() {
    if (this.stats.length === 0) {
      return 0;
    }
    const er = this.potentialExtraRate;
    switch (this.type) {
      case EnchantStep.TYPE_NORMAL:
        return this.realPotentialCost(this.stats.reduce((a, b) => a + b.potentialCost, 0) * er);
      case EnchantStep.TYPE_EACH:
        return this.firstStat ? this.firstStat.potentialCost : 0;
    }
    return 0;
  }
  get remainingPotential() {
    return this.belongEquipment.stepRemainingPotential(this.index);
  }
  /**
   * @returns {EnchantStep}
   */
  get previousStep() {
    const idx = this.index;
    if (idx === 0)
      return null;
    const steps = this.belongEquipment.steps();
    return steps[idx - 1];
  }
  /**
   * @returns {EnchantStep}
   */
  get nextStep() {
    const steps = this.belongEquipment.steps();
    return steps[this.index + 1] || null;
  }
  get isLastStep() {
    return this.belongEquipment.lastStep === this;
  }
  get afterLastStep() {
    return this.belongEquipment.lastStep.index < this.index;
  }
  /**
   * @returns {EnchantStepStat}
   */
  get firstStat() {
    return this.stats[0] || null;
  }

  /**
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @param {number} [v]
   * @returns {EnchantStepStat}
   */
  appendStat(itemBase, type, v) {
    const stat = new EnchantStepStat(this, itemBase, type, v);
    if (!this.belongEquipment.checkStats() && !this.belongEquipment.hasStat(stat)) {
      return null;
    }
    this.stats.push(stat);
    return stat;
  }

  /**
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @returns {EnchantStepStat} undefined if not found
   */
  stat(itemBase, type) {
    return this.stats.find(stat => stat.itemBase === itemBase && stat.type === type);
  }
  remove() {
    this.belongEquipment.allSteps.splice(this.index, 1);
    this.stats.forEach(p => p.remove());
  }

  /**
   * @param {number} p
   * @returns {number}
   */
  realPotentialCost(p) {
    return p >= 0 ? Math.floor(p) : Math.ceil(p);
  }

  /**
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @returns {boolean}
   */
  hasStat(itemBase, type) {
    return this.stat(itemBase, type) ? true : false;
  }

  autoFill() {
    if (this.index === 0) {
      return;
    }
    const stats = this.belongEquipment.stats(this.belongEquipment.lastStep.index);
    const newStats = [];
    stats.filter(stat => stat.value > 0).forEach(stat => {
      const max = stat.limit[1];
      const find = this.stat(stat.itemBase, stat.type);
      if (find && find.value === stat.value) {
        return;
      }
      const value = max - stat.value;
      if (value === 0) {
        return;
      }
      const newStat = new EnchantStepStat(this, stat.itemBase, stat.type, value);
      newStats.push(newStat);
    });
    newStats.forEach(stat => {
      const t = this.stat(stat.itemBase, stat.type);
      if (t) {
        t.value = stat.value;
      } else {
        this.stats.push(stat);
      }
    });
  }

  /**
   * check whether the cost of potential will reduce after modify type
   * @param {number} autoFix - if return value greater than autoFix, it will auto modify type to optimize
   * @returns {number} number between -2 and 2
   *                    - 2: cost will reduce
   *                    - 1: TYPE_EACH is unnecessary
   *                    - 0: potential cost will not reduce, but cost may reduce if stat.value increased
   *                    - -1: cost will not reduce
   *                    - -2: stats.length != 1 or cost <= 0
   */
  optimizeType(autoFix = 2) {
    if (this.stats.length !== 1) {
      return -2;
    }
    const oldType = this.type;
    const check = (() => {
      const old = this.potentialCost;
      if (old <= 0) {
        return -2;
      }
      this.type = this.type === EnchantStep.TYPE_NORMAL ? EnchantStep.TYPE_EACH : EnchantStep.TYPE_NORMAL;
      if (this.potentialCost > old) {
        return -1;
      }
      if (this.potentialCost === old) {
        if (oldType === EnchantStep.TYPE_EACH) {
          return 1;
        } else if (this.potentialExtraRate > 1) {
          return 0;
        }
        return -1;
      }
      return 2;
    })();
    if (check <= autoFix) {
      this.type = oldType;
    }
    return check;
  }

  toString() {
    return `${this.type === EnchantStep.TYPE_EACH ? '@' : '#'}|${this.stats.map(stat => stat.show('base')).join(', ')}|${this.remainingPotential}pt`;
  }
}

class EnchantStat {
  /**
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @param {number} [v]
   */
  constructor(itemBase, type, v) {
    this.itemBase = itemBase;

    /** @type {Stat} */
    this.stat = itemBase.statBase.createStat(type, v);
  }

  /** @return {number} */
  get value() {
    return this.stat.value;
  }

  /** @param {number} v */
  set value(v) {
    this.stat.value = v;
  }

  /** @return {string} */
  get baseName() {
    return this.stat.baseName;
  }

  /** @return {symbol} */
  get type() {
    return this.stat.type;
  }

  /** @return {string} */
  get statId() {
    return this.stat.statId;
  }

  get limit() {
    return this.itemBase.getLimit(this.type);
  }

  get originalPotential() {
    return this.itemBase.getOriginalPotential(this.type);
  }

  get potentialConvertThreshold() {
    return this.itemBase.getPotentialConvertThreshold(this.type);
  }

  /**
   * @param {number} [v]
   * @returns {string}
   */
  show() {
    return this.stat.show();
  }
  add(v) {
    return this.stat.add(v);
  }

  /**
   * @param {EnchantStat} estat
   * @returns {boolean}
   */
  equals(estat) {
    return this.stat.equals(estat.stat);
  }

  copy() {
    return new EnchantStat(this.itemBase, this.type, this.value);
  }

  /**
   * calc material point cost of from -> old. order of params has no effect.
   * @param {number} from
   * @param {number} to
   * @returns {number}
   */
  calcMaterialPointCost(from, to) {
    if (from > to) {
      const t = from;
      from = to;
      to = t;
    }

    const smithlv = STATE.Character.smithLevel;
    const r = 100 - Math.floor(smithlv / 10) - Math.floor(smithlv / 50);
    const bv = this.itemBase.getMaterialPointValue(this.type);

    const calc = (_from, _to) => {
      _to = Math.abs(_to);
      _from = Math.abs(_from);
      if (_from > _to) {
        [_from, _to] = [_to, _from];
      }
      return Array(_to - _from).fill()
        .map((p, i) => i + _from + 1)
        .reduce((a, b) => a + Math.floor(b * b * bv * r / 100), 0);
    };

    return from * to >= 0 ? calc(from, to) : calc(from, 0) + calc(0, to);
  }

  /**
   * @param {"current"|"base"} [type]
   * @param {number} [previousValue]
   * @returns {string}
   */
  showAmount(type = 'current', previousValue = 0) {
    let [sv, sv2] = this.itemBase.getUnitValue(this.type).split('|');
    const convertThreshold = this.potentialConvertThreshold;
    let v = this.value + previousValue;

    sv2 = sv2 || sv;

    const sign = v < 0 ? -1 : 1;
    v *= sign;

    let v2 = 0;
    if (v > convertThreshold) {
      v2 = v - convertThreshold;
      v = convertThreshold;
    }

    if (type === 'base') {
      let pv = previousValue * sign, pv2 = 0;
      if (pv > convertThreshold) {
        pv2 = pv - convertThreshold;
        pv = convertThreshold;
      }
      v -= pv;
      v2 -= pv2;
    }

    v *= sign;
    v2 *= sign;

    return this.stat.show(v * sv + v2 * sv2);
  }
}

/** */
class EnchantStepStat extends EnchantStat {
  /** @const */
  static POTENTIAL_CONVERT_DEFAULT_THRESHOLD = 20;

  static TYPES = [
    StatTypes.Constant,
    StatTypes.Multiplier,
    StatTypes.Total,
  ];

  /**
   * @param {EnchantStep} parent
   * @param {EnchantItem} itemBase
   * @param {symbol} type
   * @param {number} [v]
   */
  constructor(parent, itemBase, type, v) {
    super(itemBase, type, v);
    /** @private */
    this._parent = parent;
  }

  /**
   * @typedef EnchantStepStatSaveData
   * @type {Object}
   * @property {0|1|2} type - symbol to number
   * @property {number} value
   * @property {string} base - Basename of EnchantItem.statBase
   */
  /** @return {EnchantStepStatSaveData} */
  save() {
    return {
      type: EnchantStepStat.TYPES.indexOf(this.type),
      value: this.value,
      base: this.itemBase.statBase.baseName,
    };
  }

  /**
   * @param {Array<EnchantCategory>} categorys
   * @param {EnchantStep} step
   * @param {EnchantStepStatSaveData} data
   */
  static load(categorys, step, data) {
    let itemBase;
    categorys.find(category => {
      itemBase = category.items.find(item => item.statBase.baseName === data.base);
      return itemBase;
    });
    if (!itemBase) {
      console.warn(`can not find the EnchantItem "${data.base}" when load EnchantStepStat`);
      return null;
    }
    const type = EnchantStepStat.TYPES[data.type];
    return new EnchantStepStat(step, itemBase, type, data.value);
  }

  get value() {
    return this.stat.value;
  }
  /**
   * @override
   * @param {number} v
   */
  set value(v) {
    const eqstat = this.belongEquipment.stat(this.itemBase, this.type);
    const [min, max] = this.limit;
    const ov = eqstat.add(-1 * this.value);
    if (ov + v > max)
      v = max - ov;
    if (ov + v < min)
      v = min - ov;

    this.stat.value = v;
  }


  /** @return {number} */
  get index() {
    return this._parent.stats.indexOf(this);
  }

  /** @return {boolean} */
  get valid() {
    if (this._parent.type === EnchantStep.TYPE_EACH && this.index !== 0) {
      return false;
    }
    if (this.itemBase.belongCategory.isWeaponOnly && this.belongEquipment.fieldType !== EnchantEquipment.TYPE_MAIN_WEAPON) {
      return false;
    }
    return true;
  }

  /** @return {EnchantEquipment} */
  get belongEquipment() {
    return this._parent.belongEquipment;
  }

  get belongStep() {
    return this._parent;
  }

  get potential() {
    return this.itemBase.getPotential(this.type, this.belongEquipment);
  }

  /** @return {number} */
  get potentialCost() {
    const prev = this.previousStepStatValue;

    if (this._parent.type === EnchantStep.TYPE_NORMAL)
      return this.calcPotentialCost(this.value, prev);
    else {
      const er = this._parent.potentialExtraRate;

      let sv = this._parent.step || 1;
      const v = this.value;
      let res = 0,
        cur = 0;
      while (cur !== v) {
        if ((sv > 0 && cur + sv > v) || (sv < 0 && cur + sv < v)) {
          sv = v - cur;
        }
        res += this._parent.realPotentialCost(this.calcPotentialCost(sv, cur + prev) * er);
        cur += sv;
      }
      return res;
    }
  }

  /** @return {number} */
  get finalPotentialEffect() {
    return this._parent.type === EnchantStep.TYPE_NORMAL ?
      -1 * this.potentialCost * this._parent.potentialExtraRate :
      -1 * this._parent.potentialCost;
  }

  /**
   * @typedef MaterialPointCost
   * @type {Object}
   * @property {number} type
   * @property {number} value
   */
  /** @return {MaterialPointCost} */
  get materialPointCost() {
    const from = this.previousStepStatValue,
      to = from + this.value;
    return {
      type: this.itemBase.materialPointType,
      value: this.calcMaterialPointCost(from, to),
    };
  }

  /** @returns {number} */
  get previousStepStatValue() {
    const stat = this.belongEquipment
      .stat(this.itemBase, this.type, this._parent.index - 1);
    return stat ? stat.value : 0;
  }

  /**
   * @param {"current"|"base"|"each"} [type]
   * @returns {string}
   */
  show(type) {
    if (type === 'current' || type === 'base') {
      const prev = this.previousStepStatValue;
      return this.showAmount(type, prev);
    } else if (type === 'each') {
      return this.stat.show(this.belongStep.step);
    }

    return super.show();
  }

  /**
   * @param {number} v - increased value
   * @param {number} pre - previous value before increase
   * @returns {number}
   */
  calcPotentialCost(v, pre = 0) {
    const p = this.potential;
    const convertThreshold = this.itemBase.getPotentialConvertThreshold(this.type);

    const sign = v < 0 ? -1 : 1;

    let v2 = 0;
    if (pre * sign <= convertThreshold) {
      v += pre;
      v *= sign;

      if (v > convertThreshold) {
        v2 = v - convertThreshold;
        v = convertThreshold;
      }
      v *= sign;
      v2 *= sign;

      v -= pre;
    } else {
      v2 = v;
      v = 0;
    }

    const r = (5 + STATE.Character.tec / 10);
    return (v + v2) >= 0 ?
      v * p + v2 * p * 2 :
      Math.ceil((((v * p) + (v2 * p) / 2) * r) / 100);
  }

  /**
   * remove this stat from step
   * @return {void}
   */
  remove() {
    this._parent.stats.splice(this.index, 1);
    this.belongEquipment.refreshStats();
  }

  pure() {
    return super.copy();
  }
}

export { EnchantStat, EnchantStepStat, EnchantStep, EnchantEquipment, EnchantBuild };
