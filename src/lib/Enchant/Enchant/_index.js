import { StatBase } from "@lib/Character/Stat";
import Grimoire from "@Grimoire";

class EnchantCategory {
  constructor(title) {
    this.title = title;
    this.items = [];
    this._weaponOnly = false;
  }

  get weaponOnly() {
    return this._weaponOnly;
  }

  setWeaponOnly(v) {
    this._weaponOnly = true;    
  }
  appendItem(sets) {
    const t = new EnchantItem(this, sets);
    this.items.push(t);
    return t;
  }
}

class EnchantItem {
  constructor(category, {
      baseName, potential,
      limit, unitValue,
      materialPointType, materialPointValue,
      potentialConvertThreshold
    }) {

    this._category = category;
    this.statBase = Grimoire.Character.findStatBase(baseName);
    this.conditionalAttrs = [];
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

    this._state = null;
    // {
    //   fieldType: number(int),
    //   isOriginalElement: boolean,
    //   characterLevel: number(int)
    // }
  }

  get state() {
    return this._state || {};
  }

  belongCategory() {
    return this._category;
  }
  appendConditionalAttrs(set) {
    this.conditionalAttrs.push(set);
  }
  checkConditionalAttrs() {
    const state = this.state;
    return this.conditionalAttrs.find(p => {
      switch (p.condition) {
        case EnchantItem.CONDITION_MAIN_WEAPON:
          return state.fieldType === 0;
        case EnchantItem.CONDITION_BODY_ARMOR:
          return state.fieldType === 1;
        case EnchantItem.CONDITION_ORIGINAL_ELEMENT:
          return state.isOriginalElement;
      }
    });
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

    const add = Math.max(Math.floor((Status.Character.level - 200) / 10) * 5, 0);
    const pt = this.getLimitFromPotentialLimit(type, add);

    const lv = Math.floor(Status.Character.level / 10);

    const l = Math.min(pt, lv);
    return [
      t[0] === '' ? l : Math.min(t[0], lv),
      t[1] === '' ? -1 * l : Math.max(t[1], -1 * lv)
    ];
  }
  getLimitFromPotentialLimit(type, add = 0) {
    let potentialLimit = Status.ItemPotentialLimit + add;
    const bp = this.basePotential(type);
    if (bp == 6)
      potentialLimit -= 10;
    return Math.floor(potentialLimit / bp);
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
  getPotentialConvertThreshold(type) {
    const p = this.potentialConvertThreshold[type];
    return p ?
      parseFloat(p) :
      Math.min(EnchantStepStat.POTENTIAL_CONVERT_DEFAULT_THRESHOLD, this.getLimitFromPotentialLimit(type));
  }
}

EnchantItem.CONDITION_MAIN_WEAPON = Symbol('Main Weapon');
EnchantItem.CONDITION_BODY_ARMOR = Symbol('Body Armor');
EnchantItem.CONDITION_ORIGINAL_ELEMENT = Symbol('Original Element');

export { EnchantCategory };