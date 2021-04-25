
// /* eslint-disable */
import { StatBase } from "@lib/Character/Stat";
import Grimoire from "@Grimoire";


const STATE = {
  potentialCapacity: 100,
  EquipmentBasePotentialMinimum: 1,
  EquipmentItemMaximumNumber: 8,
  character: {
    level: 220,
    smithLevel: 0
  }
};

class EnchantCategory {
constructor(title) {
    this.title = title;
    this.items = [];
    this._weaponOnly = false;
  }

  get weaponOnly() {
    return this._weaponOnly;
  }
  setWeaponOnly() {
    this._weaponOnly = true;
  }
  appendItem(sets) {
    const t = new EnchantItem(this, sets);
    this.items.push(t);
    return t;
  }
}

class EnchantItem {
  static CONDITION_MAIN_WEAPON = Symbol('Main Weapon');
  static CONDITION_BODY_ARMOR = Symbol('Body Armor');
  static CONDITION_ORIGINAL_ELEMENT = Symbol('Original Element');

  constructor(category, {
      baseName, potential,
      limit, unitValue,
      materialPointType, materialPointValue,
      potentialConvertThreshold
    }) {

    this._category = category;
    this.statBase = Grimoire.Character.findStatBase(baseName);
    this.conditionalProps = [];
    this.potential = {
      [StatBase.TYPE_CONSTANT]: potential[0],
      [StatBase.TYPE_MULTIPLIER]: potential[1]
    };
    this.limit = {
      [StatBase.TYPE_CONSTANT]: limit[0],
      [StatBase.TYPE_MULTIPLIER]: limit[1]
    };
    this.unitValue = {
      [StatBase.TYPE_CONSTANT]: unitValue[0] || '1',
      [StatBase.TYPE_MULTIPLIER]: unitValue[1] || '1'
    };
    this.materialPointType = materialPointType;
    this.materialPointValue = {
      [StatBase.TYPE_CONSTANT]: materialPointValue[0],
      [StatBase.TYPE_MULTIPLIER]: materialPointValue[1]
    };
    this.potentialConvertThreshold = {
      [StatBase.TYPE_CONSTANT]: potentialConvertThreshold[0],
      [StatBase.TYPE_MULTIPLIER]: potentialConvertThreshold[1]
    };
  }

  get belongCategory() {
    return this._category;
  }
  get potentialCapacity() {
    return STATE.potentialCapacity;
  }

  appendConditionalProps(set) {
    const t = new EnchantItemConditionalProperties(set);
    this.conditionalProps.push(t);
  }
  checkConditionalProps(equipment) {
    return this.conditionalProps.find(p => {
      switch (p.condition) {
        case EnchantItem.CONDITION_MAIN_WEAPON:
          return equipment.fieldType === 0;
        case EnchantItem.CONDITION_BODY_ARMOR:
          return equipment.fieldType === 1;
        case EnchantItem.CONDITION_ORIGINAL_ELEMENT:
          return equipment.isOriginalElement;
      }
    });
  }
  getPotential(type, equipment) {
    const cp = this.checkConditionalProps(equipment);
    return cp ? cp.potential[type] : this.potential[type];
  }
  basePotential(type) {
    return this.potential[type];
  }
  getLimit(type) {
    const t = this.limit[type];

    const add = Math.max(Math.floor((STATE.character.level - 200) / 10) * 5, 0);
    const pt = this.getLimitFromPotentialCapacity(type, add);
    const lv = Math.floor(STATE.Character.level / 10);

    const l = Math.min(pt, lv);
    return [
      t[0] === '' ? l : Math.min(t[0], lv),
      t[1] === '' ? -1 * l : Math.max(t[1], -1 * lv)
    ];
  }
  getLimitFromPotentialCapacity(type, add = 0) {
    let potentialLimit = STATE.ItemPotentialLimit + add;
    const bp = this.basePotential(type);
    if (bp === 6)
      potentialLimit -= 10;
    return Math.floor(potentialLimit / bp);
  }
  getUnitValue(type) {
    return this.unitValue[type];
  }
  getMaterialPointValue(type) {
    const t = this.materialPointValue[type];
    if (t === '') {
      return {
        '1': 5,
        '3': 16.5,
        '5': 25,
        '6': 33.5,
        '10': 50,
        '20': 100
      } [this.basePotential(type).toString()];
    }
    return parseFloat(t);
  }
  getPotentialConvertThreshold(type) {
    const p = this.potentialConvertThreshold[type];
    return p ?
      parseFloat(p) :
      Math.min(EnchantStepStat.POTENTIAL_CONVERT_DEFAULT_THRESHOLD, this.getLimitFromPotentialLimit(type));
  }
}

class EnchantItemConditionalProperties {
  constructor({ potential = null }) {
    this.potential = potential;
  }
}

class EnchantEquipment {
  constructor() {
    this._steps = [];

    this.basePotential = STATE.EquipmentBasePotentialMinimum,
    this.originalPotential = 1;
    this.fieldType = 0; // 0: Main Weapon, 1: Body Armor
    this.isOriginalElement = false;
  }

  get allSteps() {
    return this._steps;
  }
  get lastStep() {
    return this.steps().find((step, i, ary) => {
      if ((i === ary.length - 1)) {
        return true;
      }
      return step.remainingPotential < 1
        || !p.belongEquipment.checkStats(step.index);
    });
  }
  get allMaterialPointCost() {
    const mats = Array(6).fill(0);
    this.steps().forEach(step =>
      step.stats().forEach(stat => {
        const t = stat.materialPointCost;
        mats[t.type] += t.value;
      })
    );
    return mats;
  }

  appendStep() {
    const step = new EnchantStep(this);
    this._steps.push(step);
    return step;
  }
  steps(stepIdx = null) {
    stepIdx = stepIdx === null ? this._steps.length - 1 : stepIdx;
    return stepIdx < 0 ? [] : 
      this._steps.slice(0, stepIdx + 1).filter(step => !step.hidden);
  }
  stepRemainingPotential(stepIdx) {
    return this.steps(stepIdx)
      .reduce((c, step) => (c - step.potentialCost), this.originalPotential);
  }
  stepPotentialExtraRate(stepIdx) {
    const t = [];
    this.stats(stepIdx).forEach(stat => {
      const cat = stat.itemBase.belongCategory;
      const check = t.find(a => a.category == cat);
      check ? ++check.cnt : t.push({ category: cat, cnt: 1 });
    });
    const res = t.reduce((a, b) => a + (b.cnt > 1 ? b.cnt * b.cnt : 0), 20);
    return res / 20;
  }
  insertStepBefore(beforeStep) {
    const step = new EnchantStep(this);
    this._steps.splice(beforeStep.index, 0, step);
    return step;
  }
  stat(itemBase, type, stepIdx) {
    const v = this.steps(stepIdx).reduce((c, step) => {
      const t = step.stat(itemBase, type);
      return t && t.valid() ? c + t.value : c;
    }, 0);
    return new EnchantStat(itemBase, type, v);
  }
  stats(stepIdx) {
    const stats = [];
    this.steps(stepIdx).forEach(step => {
      step.stats.filter(stat => stat.valid()).forEach(stat => {
        const t = stats.find(b => b.equals(stat));
        t ?  t.add(a.value) : stats.push(stat.copy());
      });
    });
    return stats;
  }
  checkStats(stepIdx) {
    return this.checkStatsMaximumNumber(stepIdx);
  }
  checkStatsMaximumNumber(stepIdx) {
    return this.steps(stepIdx).length < STATE.EquipmentItemMaximumNumber;
  }
  successRate() {
    const last_index = this.lastStepIndex();
    const pot = this.currentPotential(last_index);
    const d = Math.max(this.currentPotential(last_index - 1), this.basePotential());
    if (!this.checkCurrentPotential())
      return Math.max(160 + pot * 230 / d, 0);
    return -1;
  }
  refreshStats() {
    this.stats().forEach(stat => {
      const [max, min] = stat.limit;
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
    })
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
  hasStat(stat, stepIdx) {
    return this.stats(stepIdx).find(q => q.equals(stat)) ? true : false;
  }
}


class EnchantStep {
  static TYPE_NORMAL = Symbol('normal');
  static TYPE_EACH = Symbol('each');

  _parent;

  constructor(parent) {
    this._parent = parent;
    this.stats = [];
    this.type = EnchantStep.TYPE_NORMAL;
    this.step = 1; // step for type == "each"
    this.hidden = false;
  }

  get belongEquipment() {
    return this._parent;
  }
  get potentialExtraRate() {
    return this.belongEquipment.getPotentialExtraRate(this.index);
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
        return this.potentialCostToInteger(this.stepStats.reduce((a, b) => a + b.getPotentialCost(), 0) * er);
      case EnchantStep.TYPE_EACH:
          return this.stepStats[0] ? this.stepStats[0].getPotentialCost() : 0;
    }
    return 0;
  }
  get remainingPotential() {
    return this.belongEquipment.stepRemainingPotential(this.index);
  }
  get previousStep() {
    if (this.index === 0)
      return void 0;
    const steps = this.belongEquipment.steps(this.index);
    return steps[steps.length - 1];
  }
  get isLastStep() {
    return this.belongEquipment.lastStep === this;
  }
  get afterLastStep() {
    return this.belongEquipment.lastStep.index < this.index;
  }

  appendStat(...args) {
    const stat = new EnchantStepStat(this, ...args);
    if (this.belongEquipment.hasStat(stat) || !this.belongEquipment.checkStats()) {
      return false;
    }
    this.stats.push(stat);
    return stat;
  }
  setType(type) {
    this.type = type;
  }
  stat(itemBase, type) {
    return this.stats.find(stat => p.itemBase === itemBase && stat.type === type);
  }
  remove() {
    this.belongEquipment.allSteps.splice(this.index, 1);
    this.stats.forEach(p => p.remove());
  }
  realPotentialCost(p) {
    return p > 0 ? Math.floor(p) : Math.ceil(p);
  }
}

class EnchantStepStat {
  static POTENTIAL_CONVERT_DEFAULT_THRESHOLD = 20;

  _parent;

  constructor(parent, itemBase, type, v) {
    this._parent = parent;
    this.itemBase = itemBase;
    this.stat = itemBase.statBase.createStat(type, v);
  }

  get index() {
    return this._parent.stats.indexOf(this);
  }
  get valid() {
    if (this._parent.type === EnchantStep.TYPE_EACH && this.index !== 0) {
      return false;
    }
    if (this.itemBase.belongCategory.isWeaponOnly && this.belongEquipment.fieldType !== 0) {
      return false;
    }
    return true;
  }
  get value() {
    return this.stat.value;
  }
  set value(v) {
    const eqstat = this.belongEquipment.stat(this.itemBase, this.type);
    const [max, min] = this.itemBase.getLimit(this.type);
    const ov = eqstat.add(-1 * this.value);
    if (ov + v > max)
      v = max - ov;
    if (ov + v < min)
      v = min - ov;

    this.stat.value = v;
  }
  get baseName() {
    return this.stat.baseName;
  }
  get type() {
    return this.stat.type;
  }
  get belongEquipment() {
    return this._parent.belongEquipment;
  }
  get potentialCost() {
    const prev = this.getPreviousStepStatValue();

    if (this.type === EnchantStep.TYPE_NORMAL)
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
  get finalPotentialCost() {
    return this._parent.type === EnchantStep.TYPE_EACH ?
      this.potentialCost * this._parent.potentialExtraRate :
      this._parent.potentialCost;
  }
  get materialPointCost() {
    const from = this.getPreviousStepStatValue(),
      to = from + this.value;
    return {
      type: this.itemBase.materialPointType,
      value: this.calcMaterialPointCost(from, to)
    };
  }

  show(v) {
    let [sv, sv2] = this.itemBase.getUnitValue(this.type).split('|');
    const convertThreshold = this.itemBase.getPotentialConvertThreshold(this.type);

    if (sv === 1 && sv2 === 1)
      return v === void 0 ? this.stat.show() : this.stat.show({}, v);
    else {
      sv2 = sv2 || sv;
      v = v === void 0 ? this.value : v;
      let v2 = 0, sign = 1;
      if (v < 0) {
        sign = -1;
        v *= -1;
      }
      if (v > convertThreshold) {
        v2 = v - convertThreshold;
        v = convertThreshold;
      }
      v *= sign;
      v2 *= sign;
      return this.stat.show({}, v * sv + v2 * sv2);
    }
  }
  add(v) {
    return this.stat.add(v);
  }
  equals(estat) {
    return this.stat.equals(estat.stat);
  }
  getPreviousStepStatValue() {
    return this.belongEquipment
      .stat(this.itemBase, this.type, this._parent.index - 1).value;
  }
  calcPotentialCost(v, pre = 0) {
    const p = this.itemBase.getPotential(this.type, this.belongEquipment);
    const convertThreshold = this.itemBase.getPotentialConvertThreshold(this.type);

    v += pre;

    let v2 = 0, sign = 1;
    if (v < 0) {
      sign = -1;
      v *= -1;
    }
    if (v > convertThreshold) {
      v2 = v - convertThreshold;
      v = convertThreshold;
    }
    v *= sign;
    v2 *= sign;

    v -= pre;

    const r = (5 + Status.Character.tec / 10);
    return (v + v2) > 0 ?
      v * p + v2 * p * 2 :
      Math.ceil(v * r * p / 100) + Math.ceil(v2 * r * p / 200);
  }
  showCurrentText() {
    return this.show(this.getPreviousStepStatValue() + this.value);
  }
  calcMaterialPointCost(from, to) {
    if (from > to) {
      const t = from;
      from = to;
      to = t;
    }

    const smithlv = STATE.character.smithLevel;
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
        .reduce((a, b) => a + Math.floor(b * b * bv * r / 100), 0)
    };

    if (from * to >= 0) {
      return calc(from, to);
    } else {
      return calc(from, 0) + calc(0, to);
    }
  }
  remove() {
    this._parent.stats.splice(this.index, 1);
    this.belongEquipment.refreshStats();
  }
}

export { EnchantCategory, EnchantStep, EnchantItem, EnchantEquipment };