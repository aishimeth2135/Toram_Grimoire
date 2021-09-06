import { StatBase } from '@/lib/Character/Stat';
import Grimoire from '@/shared/Grimoire';
import STATE from './state';
import { EnchantEquipment } from './build';

import { markRaw } from 'vue';

class EnchantCategory {
  constructor(title) {
    /** @type {string} */
    this.title = title;
    /** @type {Array<EnchantItem>} */
    this.items = markRaw([]);
    this._weaponOnly = false;
  }

  get weaponOnly() {
    return this._weaponOnly;
  }
  setWeaponOnly() {
    this._weaponOnly = true;
  }

  /**
   * @param {EnchantItemSets} sets
   * @returns {EnchantItem}
   */
  appendItem(sets) {
    const t = markRaw(new EnchantItem(this, sets));
    this.items.push(t);
    return t;
  }
}

/**
 * @typedef {Object} EnchantItemSets
 * @property {string} baseName
 * @property {[number, number]} potential
 * @property {[string, string]} limit
 * @property {[string, string]} unitValue
 * @property {number} materialPointType - 0~5
 * @property {[string, string]} materialPointValue
 * @property {[string, string]} potentialConvertThreshold
 */

/** */
class EnchantItem {
  static CONDITION_MAIN_WEAPON = Symbol('Main Weapon');
  static CONDITION_BODY_ARMOR = Symbol('Body Armor');
  static CONDITION_ORIGINAL_ELEMENT = Symbol('Original Element');

  /**
   * @param {EnchantCategory} category
   * @param {EnchantItemSets} sets
   */
  constructor(category, {
    baseName, potential,
    limit, unitValue,
    materialPointType, materialPointValue,
    potentialConvertThreshold,
  }) {

    /** @type {EnchantCategory} */
    this._category = category;

    /** @type {StatBase} */
    this.statBase = Grimoire.Character.findStatBase(baseName);

    /** @type {Array<EnchantItemConditionalProperties>} */
    this.conditionalProps = [];
    this.potential = {
      [StatBase.TYPE_CONSTANT]: potential[0],
      [StatBase.TYPE_MULTIPLIER]: potential[1],
    };
    this.limit = {
      [StatBase.TYPE_CONSTANT]: limit[0],
      [StatBase.TYPE_MULTIPLIER]: limit[1],
    };
    this.unitValue = {
      [StatBase.TYPE_CONSTANT]: unitValue[0] || '1',
      [StatBase.TYPE_MULTIPLIER]: unitValue[1] || '1',
    };
    this.materialPointType = materialPointType;
    this.materialPointValue = {
      [StatBase.TYPE_CONSTANT]: materialPointValue[0],
      [StatBase.TYPE_MULTIPLIER]: materialPointValue[1],
    };
    this.potentialConvertThreshold = {
      [StatBase.TYPE_CONSTANT]: potentialConvertThreshold[0],
      [StatBase.TYPE_MULTIPLIER]: potentialConvertThreshold[1],
    };
  }

  get belongCategory() {
    return this._category;
  }

  /**
   * @param {symbol} condition
   * @param {Object} set
   */
  appendConditionalProps(condition, set) {
    const t = new EnchantItemConditionalProperties(condition, set);
    this.conditionalProps.push(t);
  }

  /**
   * @param {EnchantEquipment} equipment \
   * @returns {EnchantItemConditionalProperties|undefined}
   */
  checkConditionalProps(equipment) {
    return this.conditionalProps.find(p => {
      switch (p.condition) {
      case EnchantItem.CONDITION_MAIN_WEAPON:
        return equipment.fieldType === EnchantEquipment.TYPE_MAIN_WEAPON;
      case EnchantItem.CONDITION_BODY_ARMOR:
        return equipment.fieldType === EnchantEquipment.TYPE_BODY_ARMOR;
      case EnchantItem.CONDITION_ORIGINAL_ELEMENT:
        return equipment.isOriginalElement;
      }
    });
  }

  /**
   * @param {symbol} type
   * @param {EnchantEquipment} equipment
   * @returns {number}
   */
  getPotential(type, equipment) {
    const cp = this.checkConditionalProps(equipment);
    return cp ? cp.potential[type] : this.potential[type];
  }

  /**
   * @param {symbol} type
   * @returns {number}
   */
  getOriginalPotential(type) {
    return this.potential[type];
  }

  /**
   * @param {symbol} type
   * @returns {[min:number, max:number]}
   */
  getLimit(type) {
    const t = this.limit[type];

    const add = Math.max(Math.floor((STATE.Character.level - 200) / 10) * 5, 0);
    const pt = this.getLimitFromPotentialCapacity(type, add);
    const lv = Math.floor(STATE.Character.level / 10);

    const l = Math.min(pt, lv);
    return [
      t[1] === '' ? -1 * l : Math.max(t[1], -1 * lv),
      t[0] === '' ? l : Math.min(t[0], lv),
    ];
  }
  getLimitFromPotentialCapacity(type, add = 0) {
    let potentialLimit = STATE.PotentialCapacity + add;
    const bp = this.getOriginalPotential(type);
    if (bp === 6)
      potentialLimit -= 10;
    return Math.floor(potentialLimit / bp);
  }
  getUnitValue(type) {
    return this.unitValue[type];
  }

  /**
   * @param {symbol} type
   * @returns {number}
   */
  getMaterialPointValue(type) {
    const t = this.materialPointValue[type];
    if (t === '') {
      return {
        '1': 5,
        '3': 16.5,
        '5': 25,
        '6': 33.5,
        '10': 50,
        '20': 100,
      } [this.getOriginalPotential(type).toString()];
    }
    return parseFloat(t);
  }
  getPotentialConvertThreshold(type) {
    const p = this.potentialConvertThreshold[type];
    return p ?
      parseFloat(p) :
      Math.min(STATE.PotentialConvertDefaultThreshold, this.getLimitFromPotentialCapacity(type));
  }
}

class EnchantItemConditionalProperties {
  constructor(condition, { potential = null }) {
    /** @type {symbol} */
    this.condition = condition;
    this.potential = {
      [StatBase.TYPE_CONSTANT]: potential[0],
      [StatBase.TYPE_MULTIPLIER]: potential[1],
    };
  }
}

export { EnchantCategory, EnchantItem };
