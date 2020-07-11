import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";


const Status = {};


function InitEnchantElementStatus(set) {
  set = Object.assign({
    Character: {
      level: 210,
      tec: 255,
      smithLevel: 0
    },
    ItemPotentialLimit: 100,
    EquipmentItemMaximumNumber: 8,
    EquipmentBasePotentialMiniMum: 15
  }, set);
  Object.assign(Status, set);
}

function EnchantElementStatus(name, value) {
  try {
    const l = name.split('/');
    let cur = Status;
    let res;
    l.forEach((p, i) => {
      if (i == l.length - 1) {
        if (cur[p] === void 0)
          throw new Error('invalid key');
        if (value !== void 0)
          cur[p] = value;
        res = cur[p];
      }
      cur = cur[p];
    });
    return res;
  } catch (e) {
    console.warn('Unknow Status name: ' + name);
  }
}

export { InitEnchantElementStatus, EnchantElementStatus };


class EnchantCategory {
  constructor(title) {
    this.title = title;
    this.items = [];
    this.status = {
      isWeaponOnly: false
    };
  }
  appendItem() {
    const t = new EnchantItemBase(this, ...arguments);
    this.items.push(t);
    return t;
  }
}


class EnchantItemBase {
  constructor(cat, baseName, cl, ml, cuv, muv, mt, cm, mm) {
    this._category = cat;
    this.statBase = Grimoire.CharacterSystem.findStatBase(baseName);
    this.conditionalAttributes = [];
    this.limit = {
      [StatBase.TYPE_CONSTANT]: cl,
      [StatBase.TYPE_MULTIPLIER]: ml
    };
    this.unitValue = {
      [StatBase.TYPE_CONSTANT]: cuv || '1',
      [StatBase.TYPE_MULTIPLIER]: muv || '1'
    };
    this.materialPointType = mt;
    this.materialPointValue = {
      [StatBase.TYPE_CONSTANT]: cm,
      [StatBase.TYPE_MULTIPLIER]: mm
    };
  }
  belongCategory() {
    return this._category;
  }
  initAttributes() {
    this.attributes = new EnchantItemBaseAttributes(...arguments);
    return this;
  }
  appendConditionalAttributes(cond, ...constructor_args) {
    const t = {
      condition: cond,
      attributes: new EnchantItemBaseAttributes(...constructor_args)
    };
    this.conditionalAttributes.push(t);
  }
  realAttributes(status) {
    const eligible = this.conditionalAttributes.find(p => {
      switch (p.condition) {
        case EnchantItemBase.CONDITION_MAIN_WEAPON:
          return status.fieldType === 0;
        case EnchantItemBase.CONDITION_BODY_ARMOR:
          return status.fieldType === 1;
        case EnchantItemBase.CONDITION_ORIGINAL_ELEMENT:
          return status.isOriginalElement;
      }
    });
    return eligible ?
      eligible.attributes :
      this.attributes;
  }
  getPotential(type, status) {
    const attr = this.realAttributes(status);
    return attr.potential[type];
  }
  basePotential(type) {
    return this.attributes.potential[type];
  }
  getLimit(type) {
    const t = this.limit[type];
    const pt = Math.floor(Status.ItemPotentialLimit / this.basePotential(type));
    const lv = Math.floor(Status.Character.level / 10);
    const l = Math.min(pt, lv);
    return t === '' ? [l, -1 * l] : [Math.min(t[0], lv), Math.max(t[1], -1 * lv)];
  }
  getUnitValue(type) {
    return this.unitValue[type];
  }
  getMaterialPointType() {
    return this.materialPointType;
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
}

EnchantItemBase.CONDITION_MAIN_WEAPON = Symbol('Main Weapon');
EnchantItemBase.CONDITION_BODY_ARMOR = Symbol('Body Armor');
EnchantItemBase.CONDITION_ORIGINAL_ELEMENT = Symbol('Original Element');


class EnchantItemBaseAttributes {
  constructor(cp, mp) {
    this.potential = {
      [StatBase.TYPE_CONSTANT]: cp,
      [StatBase.TYPE_MULTIPLIER]: mp
    };
  }
}


class EnchantEquipment {
  constructor() {
    this._steps = [];
    this.status = {
      basePotential: Status.EquipmentBasePotentialMiniMum,
      originalPotential: 1,
      fieldType: 0, // 0: Main Weapon, 1: Body Armor
      isOriginalElement: false
    };
  }
  setStatus(name, v) {
    this.status[name] = v;
  }
  originalPotential(v) {
    if (v !== void 0) {
      if (v < 1 || typeof v != 'number')
        v = 1;
      this.status.originalPotential = v;
    }
    return this.status.originalPotential;
  }
  addOriginalPotential(v) {
    this.originalPotential(this.originalPotential() + v);
  }
  basePotential(v) {
    if (v !== void 0) {
      if (v < Status.EquipmentBasePotentialMiniMum || typeof v != 'number')
        v = Status.EquipmentBasePotentialMiniMum;
      this.status.basePotential = v;
    }
    return this.status.basePotential;
  }
  addBasePotential(v) {
    return this.basePotential(this.basePotential() + v);
  }
  currentPotential(step_index) {
    return this.currentSteps(step_index).reduce((c, p) => (c - p.getPotentialCost()), this.originalPotential());
  }
  appendStep() {
    const step = new EnchantStep(this);
    this._steps.push(step);
    return step;
  }
  appendStepBefore(before_step) {
    const step = new EnchantStep(this);
    this._steps.splice(before_step.index(), 0, step);
    return step;
  }
  step(i) {
    return this._steps[i];
  }
  stat(itemBase, type, step_index) {
    const v = this.currentSteps(step_index).reduce((c, p) => {
      const t = p.stat(itemBase, type);
      if (t && t.valid())
        c += t.statValue();
      return c;
    }, 0);
    return new EnchantStat(itemBase, type, v);
  }
  /**
   * get stats before this._steps[step_index]
   * @param  {?int} step_index   default: length of this._steps (get all stats of steps)
   * @return {Array<SimpleStat>}
   */
  currentStats(step_index) {
    const stats = [];
    this.currentSteps(step_index).forEach(p => {
      p.stepStats.forEach(a => {
        if (!a.valid())
          return;
        const t = stats.find(b => b.equals(a));
        if (t)
          t.statValue(t.statValue() + a.statValue());
        else
          stats.push(new EnchantStat(a.itemBase, a.statType(), a.statValue()));
      });
    });
    return stats;
  }
  currentStatsNumber(step_index) {
    return this.currentStats(step_index).length;
  }
  checkStats() {
    return this.checkStatsNumber();
  }
  checkStatsNumber(step_index) {
    return this.currentStatsNumber(step_index) < Status.EquipmentItemMaximumNumber;
  }
  calcPotentialExtraRate(step_index) {
    const stats = this.currentStats(step_index);
    const t = [];
    stats.forEach(p => {
      const cat = p.itemBase.belongCategory();
      const check = t.find(a => a.category == cat);
      check ? ++check.cnt : t.push({ category: cat, cnt: 1 });
    });
    const res = t.reduce((a, b) => a + (b.cnt > 1 ? b.cnt * b.cnt : 0), 20);
    return res / 20;
  }
  successRate() {
    const last_index = this.lastStepIndex();
    const pot = this.currentPotential(last_index);
    const d = Math.max(this.currentPotential(last_index - 1), this.basePotential());
    if (!this.checkStats() || !this.checkCurrentPotential())
      return Math.max(160 + pot * 230 / d, 0);
    return -1;
  }
  checkCurrentPotential() {
    return this.currentPotential(this.lastStepIndex()) > 0;
  }
  refreshStats() {
    this.currentStats().forEach(p => {
      const [max, min] = p.itemBase.getLimit(p.statType());
      const v = p.statValue();
      if (v > max || v < min) {
        const dif = v > max ? v - max : v - min;
        this.currentSteps().slice().reverse().find(a => {
          const t = a.stat(p.itemBase, p.statType());
          if (t) {
            t.addStatValue(-1 * dif);
            return true;
          }
          return false;
        });
      }
    })
  }
  swapStep(i1, i2) {
    if (i1 < 0 || i2 < 0 || i1 >= this._steps.length || i2 >= this._steps.length)
      return false;
    const t = this._steps[i1];
    this._steps[i1] = this._steps[i2];
    this._steps[i2] = t;
    return true;
  }
  getAllMaterialPointCost() {
    const mats = Array(6).fill(0);
    this.currentSteps().forEach(p =>
      p.stepStats.forEach(a => {
        const t = a.getMaterialPointCost();
        mats[t.type] += t.value;
      })
    );
    return mats;
  }
  containsStat(stat, step_index) {
    return this.currentStats(step_index).find(q => q.equals(stat)) ? true : false;
  }
  currentSteps(step_index) {
    if (step_index === void 0)
      step_index = this._steps.length - 1;
    if (step_index < 0)
      return [];

    return this._steps.slice(0, step_index + 1).filter(step => !step.hidden());
  }
  lastStep() {
    return this.currentSteps().find((p, i, ary) => {
      return (i == ary.length - 1) ||
        (p.stepRemainingPotential() < 1 ||
          !p.belongEquipment().checkStatsNumber(p.index())
        );
    });
  }
  lastStepIndex() {
    const last = this.lastStep();
    return last ? last.index() : -1;
  }
}


class EnchantStep {
  constructor(parent) {
    this._parent = parent;
    this.stepStats = []; /* @type {Array<EnchantStepStat>} */
    this.type = EnchantStep.TYPE_NORMAL;
    this.step = 1;
    this.status = {
      hidden: false
    };
  }
  appendStat() {
    const stat = new EnchantStepStat(this, ...arguments);
    if (!this.belongEquipment().containsStat(stat) && !this._parent.checkStats())
      return false;
    this.stepStats.push(stat);
    return stat;
  }
  setType(type) {
    this.type = type;
  }
  addStepValue(v) {
    let t = this.stepValue() + v;
    if (t == 0)
      t = v > 0 ? t + 1 : t - 1;
    return this.stepValue(t);
  }
  stepValue(v) {
    if (v !== void 0)
      this.step = v;
    return this.step;
  }
  getPotentialCost() {
    if (this.stepStats.length == 0)
      return 0;
    const er = this.getPotentialExtraRate();
    switch (this.type) {
      case EnchantStep.TYPE_NORMAL:
        return this.potentialCostToInteger(this.stepStats.reduce((a, b) => a + b.getPotentialCost(), 0) * er);
      case EnchantStep.TYPE_EACH:
          return this.stepStats[0] ? this.stepStats[0].getPotentialCost() : 0;
    }
  }
  potentialCostToInteger(p) {
    return p > 0 ? Math.floor(p) : Math.ceil(p);
  }
  index() {
    return this._parent._steps.indexOf(this);
  }
  stat(itemBase, type) {
    let t = typeof itemBase == 'string' // by statBase.baseName
      ?
      this.stepStats.find(p => p.baseName() == itemBase && p.stat.type == type) :
      this.stepStats.find(p => p.itemBase == itemBase && p.stat.type == type);
    return t;
  }
  remove() {
    const i = this.index();
    this.belongEquipment()._steps.splice(i, 1);
    this.stepStats.forEach(p => p.remove());
  }
  belongEquipment() {
    return this._parent;
  }
  getPotentialExtraRate() {
    return this.belongEquipment().calcPotentialExtraRate(this.index());
  }
  stepRemainingPotential() {
    return this.belongEquipment().currentPotential(this.index());
  }
  previousStep() {
    const eq = this.belongEquipment();
    let index = this.index();

    if (index == 0)
      return void 0;

    let cur = eq.step(index - 1);
    while (cur.hidden()) {
      --index;
      cur = eq.step(index - 1);
      if (!cur)
        return void 0;
    }
    return cur;
  }
  isLastStep() {
    return this.belongEquipment().lastStep() == this;
  }
  afterLastStep() {
    return this.belongEquipment().lastStepIndex() < this.index();
  }
  hidden(set) {
    if (set !== void 0)
      this.status.hidden = set;
    return this.status.hidden;
  }
}
EnchantStep.TYPE_NORMAL = Symbol('normal');
EnchantStep.TYPE_EACH = Symbol('each');

class EnchantStat {
  constructor(itemBase, type, v) {
    this.itemBase = itemBase;
    this.stat = itemBase.statBase.createSimpleStat(type, v);
  }
  baseName() {
    return this.stat.baseName();
  }
  show(v) {
    let [sv, sv2] = this.itemBase.getUnitValue(this.statType()).split('|');
    if (sv == 1 && sv2 == 1)
      return v == void 0 ? this.stat.show() : this.stat.show({}, v);
    else {
      sv2 = sv2 || sv;
      v = v == void 0 ? this.stat.statValue() : v;
      let v2 = 0, sign = 1;
      if (v < 0) {
        sign = -1;
        v *= -1;
      }
      if (v > EnchantStepStat.DOUBLE_THRESHOLD) {
        v2 = v - EnchantStepStat.DOUBLE_THRESHOLD;
        v = EnchantStepStat.DOUBLE_THRESHOLD;
      }
      v *= sign;
      v2 *= sign;
      return this.stat.show({}, v * sv + v2 * sv2);
    }
  }
  statType() {
    return this.stat.type;
  }
  statValue(v) {
    return this.stat.statValue(v);
  }
  addStatValue(v) {
    return this.stat.addStatValue(v);
  }
  equals(estat) {
    return this.stat.equals(estat.stat);
  }
}

class EnchantStepStat extends EnchantStat {
  constructor(parent, itemBase, type, v) {
    super(itemBase, type, v);
    this._parent = parent;
    this.set(v);
  }
  set(v) {
    const eqstat = this.belongEquipment().stat(this.itemBase, this.stat.type);
    const [max, min] = this.itemBase.getLimit(this.stat.type);
    const ov = eqstat.stat.addStatValue(-1 * this.stat.statValue());
    if (ov + v > max)
      v = max - ov;
    if (ov + v < min)
      v = min - ov;

    this.statValue(v);
  }
  add(v) {
    this.set(this.stat.statValue() + v);
  }
  /**
   * Get the sum of potential cost of this EnchantStat
   * @return {float}
   */
  getPotentialCost() {
    const prev = this.getPreviousStepStatValue();

    if (this._parent.type == EnchantStep.TYPE_NORMAL)
      return this.calcPotentialCost(this.stat.value, prev);
    else {
      const er = this._parent.getPotentialExtraRate();

      let sv = this._parent.stepValue() || 1;
      const v = this.stat.value;
      let res = 0,
        cur = 0;
      while (cur != v) {
        if ((sv > 0 && cur + sv > v) || (sv < 0 && cur + sv < v))
          sv = v - cur;
        res += this._parent.potentialCostToInteger(this.calcPotentialCost(sv, cur + prev) * er);
        cur += sv;
      }
      return res;
    }
  }
  belongEquipment() {
    return this._parent._parent;
  }
  /**
   * Calculate potential cost before extra-rate of input value with the formula.
   * @param  {int} v                   value of stat
   * @return {int}                     potential cost
   */
  calcPotentialCost(v, pre=0) {
    const p = this.itemBase.getPotential(this.stat.type, this.belongEquipment().status);

    v += pre;

    let v2 = 0, sign = 1;
    if (v < 0) {
      sign = -1;
      v *= -1;
    }
    if (v > EnchantStepStat.DOUBLE_THRESHOLD) {
      v2 = v - EnchantStepStat.DOUBLE_THRESHOLD;
      v = EnchantStepStat.DOUBLE_THRESHOLD;
    }
    v *= sign;
    v2 *= sign;

    v -= pre;

    const r = (5 + Status.Character.tec / 10);
    return (v + v2) > 0 ?
      v * p + v2 * p * 2 :
      Math.ceil(v * r * p / 100) + Math.ceil(v2 * r * p / 100);
  }
  realPotentialCost() {
    if (this._parent.type == EnchantStep.TYPE_EACH)
       return this._parent.getPotentialCost();
    return this.getPotentialCost() * this._parent.getPotentialExtraRate();
  }
  remove() {
    const index = this._parent.stepStats.indexOf(this);
    this._parent.stepStats.splice(index, 1);
    this.belongEquipment().refreshStats();
  }
  index() {
    return this._parent.stepStats.indexOf(this);
  }
  valid() {
    return !(
      (this._parent.type == EnchantStep.TYPE_EACH && this.index() != 0) ||
      (this.itemBase.belongCategory().status['isWeaponOnly'] && this.belongEquipment().status['fieldType'] != 0)
    );
  }
  /**
   * 取得此項能力，之前所有步驟的加總。
   */
  getPreviousStepStatValue() {
    return this.belongEquipment().stat(this.itemBase, this.statType(), this._parent.index() - 1).statValue();
  }
  showCurrentText() {
    return this.show(this.getPreviousStepStatValue() + this.statValue());
  }
  getMaterialPointCost() {
    const from = this.getPreviousStepStatValue(),
      to = from + this.statValue();
    return {
      type: this.itemBase.getMaterialPointType(),
      value: this.calcMaterialPointCost(from, to)
    };
  }
  calcMaterialPointCost(from, to) {
    if (from > to) {
      const t = from;
      from = to;
      to = t;
    }

    const smithlv = EnchantElementStatus('Character/smithLevel');
    const r = (100 - Math.floor(smithlv / 10) - Math.floor(smithlv / 50));
    const bv = this.itemBase.getMaterialPointValue(this.statType());

    const calc = (_from, _to) => {
      _to = Math.abs(_to);
      _from = Math.abs(_from);
      if (_from > _to) {
        const t = _from;
        _from = _to;
        _to = t;
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
}
EnchantStepStat.DOUBLE_THRESHOLD = 20;

export { EnchantCategory, EnchantStep, EnchantItemBase, EnchantEquipment };