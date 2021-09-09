import Grimoire from '@/shared/Grimoire';
import GetLang from '@/shared/services/Language';

import { Equipment, Crystal } from '@/lib/Items/Item';
import { isNumberString } from '@/shared/utils/string';

import { StatRestriction } from '../Stat';
import type { StatRestrictionSaveData } from '../Stat/StatRestriction';

import { EquipmentTypes } from './enums';

type EquipmentOrigin = Equipment | null;

abstract class CharacterEquipment {
  private _name: string;
  private _isCustom: boolean;

  origin: EquipmentOrigin;
  stats: StatRestriction[];

  crystals?: EquipmentCrystal[];
  refining?: number;
  stability?: number;
  atk?: number;
  def?: number;

  abstract type: EquipmentTypes;

  constructor(origin: EquipmentOrigin = null, name: string = '', stats: StatRestriction[] = []) {
    this.origin = origin;
    this.stats = stats;
    this._name = name;
    this._isCustom = false;
  }

  get id() {
    return this.origin ? this.origin.id : 0;
  }
  get name() {
    return this._name ? this._name : (this.origin ? this.origin.name : '');
  }
  set name(value: string) {
    this._name = value;
  }

  get is() {
    if (this instanceof Weapon)
      return 'weapon';
    if (this instanceof Armor)
      return 'armor';
    if (this instanceof Avatar)
      return 'avatar';
    return 'other';
  }
  get hasRefining() {
    return false;
  }
  get hasCrystal() {
    return false;
  }
  get hasStability() {
    return false;
  }
  get hasElement() {
    return false;
  }
  get creatable() {
    return false;
  }
  get allStats() {
    const all = this.stats.map(p => p.copy());
    if (this.hasCrystal) {
      (this.crystals as EquipmentCrystal[]).forEach(c => {
        c.stats.forEach(stat => {
          const t = all.find(a => a.equals(stat));
          t ? t.add(stat.value) : all.push(stat.copy());
        });
      });
    }
    return all;
  }
  get isCustom() {
    return this._isCustom;
  }
  get elementStat() {
    return this.stats.find(stat => CharacterEquipment.elementStatIds.includes(stat.baseName));
  }

  get categoryText() {
    if (this.type === EquipmentTypes.Additional || this.type === EquipmentTypes.Special || this.type === EquipmentTypes.Avatar) {
      return GetLang('common/Equipment/field/' + this.type);
    }
    console.log(this.type);
    return GetLang('common/Equipment/category/' + this.type);
  }
  get categoryIcon(): string {
    if (this instanceof BodyArmor) {
      return 'mdi-tshirt-crew';
    }
    if (this instanceof AdditionalGear) {
      return 'cib-redhat';
    }
    if (this instanceof SpecialGear) {
      return 'fa-solid:ring';
    }
    if (this instanceof Avatar) {
      return 'eva-star-outline';
    }
    return this instanceof MainWeapon ? 'mdi-sword' : 'mdi-shield';
  }

  getCategoryImagePath(fieldId = -1): string {
    let category = '';
    if (this instanceof MainWeapon) {
      category = 'main-weapon';
    } else if (this instanceof BodyArmor) {
      category = 'body-armor';
    } else if (this instanceof SubWeapon) {
      category = 'sub-weapon';
    } else if (this instanceof SubArmor) {
      category = 'sub-armor';
    } else if (this instanceof AdditionalGear) {
      category = 'additional';
    } else if (this instanceof SpecialGear) {
      category = 'special';
    } else if (this instanceof Avatar) {
      category = 'avatar';
      fieldId = 0;
    } else {
      return '#';
    }
    return CharacterEquipment.getImagePath(category, this.type || null, fieldId);
  }

  static getImagePath(category: string, type: string | null = null, fieldId: number = -1): string {
    const pre = '/imgs/character/equipment';
    const categoryStr = (() => {
      if (category === 'body-armor' || category === 'sub-weapon' || category === 'sub-armor') {
        return '';
      }
      return category;
    })();
    const typeStr = type !== null ? (categoryStr ? '/' : '') + type.replace('|', '/') : '';
    const fieldIdStr = fieldId !== -1 ? '/i' + fieldId.toString() : '';
    return `${pre}/${categoryStr}${typeStr}${fieldIdStr}.png`;
  }

  getAllStats(checkRestriction: (stat: StatRestriction) => boolean = () => true): StatRestriction[] {
    const all = this.stats
      .map(p => {
        const stat = p.copy();
        if (!checkRestriction(stat))
          stat.value = 0;
        return stat;
      });
    if (this.hasCrystal) {
      (this.crystals as EquipmentCrystal[]).forEach(c => {
        c.stats.forEach(stat => {
          const t = all.find(a => a.equals(stat));
          if (t)
            t.add(checkRestriction(stat) ? stat.value : 0);
          else {
            const a = stat.copy();
            if (!checkRestriction(a))
              a.value = 0;
            all.push(a);
          }
        });
      });
    }
    return all;
  }

  setCustom(set: boolean) {
    this._isCustom = set;
  }
  setCustomType(type: EquipmentTypes) {
    this.type = type;
  }
  findStat(baseName: string, type: string) {
    return this.stats.find(stat => stat.baseName == baseName && stat.type === type);
  }
  appendCrystal(origin: Crystal) {
    if (this.hasCrystal) {
      const crystals = this.crystals as EquipmentCrystal[];
      if (crystals.length < 2) {
        crystals.push(new EquipmentCrystal(origin));
      }
    }
  }
  removeCrystal(crystal: EquipmentCrystal) {
    if (this.hasCrystal) {
      const crystals = this.crystals as EquipmentCrystal[];
      const idx = crystals.indexOf(crystal);
      crystals.splice(idx, 1);
    }
  }

  copy(): CharacterEquipment {
    const stats = this.stats.map(p => p.copy());
    const name = this.name;

    let eq;
    if (this instanceof Weapon) {
      if (this instanceof MainWeapon) {
        eq = new MainWeapon(this.origin, name, stats, this.type, this.atk);
      } else if (this instanceof SubWeapon) {
        eq = new SubWeapon(this.origin, name, stats, this.type, this.atk);
      }
      if (eq) {
        eq.atk = this.atk;
      }
    }
    if (this instanceof Armor) {
      if (this instanceof SubArmor) {
        eq = new SubArmor(this.origin, name, stats, this.type, this.def);
      }
      if (this instanceof BodyArmor) {
        eq = new BodyArmor(this.origin, name, stats, this.def);
      }
      if (this instanceof AdditionalGear) {
        eq = new AdditionalGear(this.origin, name, stats, this.def);
      }
      if (this instanceof SpecialGear) {
        eq = new SpecialGear(this.origin, name, stats, this.def);
      }
      if (eq) {
        eq.def = this.def;
      }
    }
    if (this instanceof Avatar) {
      eq = new Avatar(this.origin, name, stats);
    }

    if (!eq) {
      eq = new Avatar(this.origin, name, stats);
    }

    if (this.hasRefining)
      eq.refining = this.refining;
    if (this.hasStability)
      eq.stability = this.stability;
    if (this.hasCrystal)
      eq.crystals = (this.crystals as EquipmentCrystal[]).map(p => p.copy());
    if (this.isCustom)
      eq.setCustom(true);

    return eq;
  }

  // save and load of json-data
  save(): EquipmentSaveData {
    const data: EquipmentSaveData = {
      instance: -1,
      stats: [],
      isCustom: false,
      id: -1,
      name: '',
    };

    let instance = -1;
    if (this instanceof MainWeapon) {
      instance = 0;
    }
    else if (this instanceof SubWeapon) {
      instance = 1;
    }
    else if (this instanceof SubArmor) {
      instance = 2;
    }
    else if (this instanceof BodyArmor) {
      instance = 3;
    }
    else if (this instanceof AdditionalGear)
      instance = 4;
    else if (this instanceof SpecialGear)
      instance = 5;
    else if (this instanceof Avatar)
      instance = 6;

    data.instance = instance;
    if (this.type)
      data.type = this.type;

    // == [ stats ] ==================================================
    data.stats = this.stats.map(stat => stat.save());

    // == [ atk ] [ def ] ============================================
    if (this instanceof Weapon) {
      data.atk = this.atk;
    } else if (this instanceof Armor) {
      data.def = this.def;
    }

    // == [ other ] ===================================================
    data.name = this.name;
    if (this.hasStability)
      data.stability = this.stability;
    if (this.hasRefining)
      data.refining = this.refining;
    if (this.hasCrystal)
      data.crystals = (this.crystals as EquipmentCrystal[]).map(p => p.name);

    data.isCustom = this.isCustom;

    // == [ id ] ======================================================
    data.id = this.id;

    return data;
  }

  static elementStatIds = [
    'element_fire',
    'element_water',
    'element_earth',
    'element_wind',
    'element_light',
    'element_dark',
  ];

  static loadEquipment(data: EquipmentSaveData) {
    try {
      let success = true;

      const { id, name, instance, type, stability, refining, atk, def, crystals, isCustom } = data;
      const stats = data.stats.map(p => StatRestriction.load(p)).filter(stat => stat !== null) as StatRestriction[];

      stats.forEach(stat => {
        if (typeof stat.value === 'string') {
          stat.value = isNumberString(stat.value) ? parseFloat(stat.value) : 0;
        }
      });

      const origin = Grimoire.Items.equipments.find(item => item.id === id) || null;

      // const instance = [
      //   MainWeapon, SubWeapon, SubArmor, BodyArmor,
      //   AdditionalGear, SpecialGear, Avatar,
      // ][data.instance];

      let eq;
      if (instance === 0) {
        eq = new MainWeapon(origin, name, stats, type as EquipmentTypes, atk as number, stability);
      } else if (instance === 1) {
        eq = new SubWeapon(origin, name, stats, type as EquipmentTypes, atk as number, stability);
      } else if (instance === 2) {
        eq = new SubArmor(origin, name, stats, type as EquipmentTypes, def as number);
      } else if (instance === 3) {
        eq = new BodyArmor(origin, name, stats, def as number);
        eq.setType(type as EquipmentTypes);
      } else if (instance === 4) {
        eq = new AdditionalGear(origin, name, stats, def as number);
      } else if (instance === 5) {
        eq = new SpecialGear(origin, name, stats, def as number);
      } else {
        eq = new Avatar(origin, name, stats);
      }

      if (eq.hasRefining) {
        eq.refining = refining;
      }
      if (eq.hasCrystal && crystals) {
        eq.crystals = crystals.map(crystalName => {
          const crystal = Grimoire.Items.crystals.find(p => p.name === crystalName);
          if (crystal) {
            return new EquipmentCrystal(crystal);
          }

          success = false;
          console.warn('[Error: CharacterEquipment.load] can not find crystal which name: ' + crystalName);
          return null;
        }).filter(crystal => crystal !== null) as EquipmentCrystal[];
      }

      eq.setCustom(isCustom);

      return {
        success,
        equipment: eq,
      };
    } catch (e) {
      console.warn(e);
      return {
        error: true,
      };
    }
  }

  static fromOriginEquipment(item: Equipment, {
    statValueToNumber = true,
  } = {}) {
    /* [
      0'單手劍', 1'雙手劍', 2'弓', 3'弩', 4'法杖',
      5'魔導具', 6'拳套', 7'旋風槍', 8'拔刀劍',
      100'箭矢', 101'小刀', 102'忍術卷軸',
      200'盾牌',
      300'身體裝備', 400'追加裝備', 500'特殊裝備',
    ] */
    const pre_args = [
      item,
      item.name as string,
      item.stats.map((stat, idx) => {
        const statRest = StatRestriction.fromOrigin(stat, item.statRestrictions[idx]);
        if (statValueToNumber && typeof statRest.value === 'string')
          statRest.value = isNumberString(statRest.value) ? parseFloat(statRest.value) : 0;
        return statRest;
      }),
    ] as const;

    if (item.category === -1) {
      return new Avatar(...pre_args);
    }

    const stability = parseInt(item.baseStability, 10);
    if (item.category === 300)
      return new BodyArmor(...pre_args, item.baseValue);
    if (item.category === 400)
      return new AdditionalGear(...pre_args, item.baseValue);
    if (item.category === 500)
      return new SpecialGear(...pre_args, item.baseValue);
    if (item.category < 100) {
      const type = [
        EquipmentTypes.OneHandSword, EquipmentTypes.TwoHandSword,
        EquipmentTypes.Bow, EquipmentTypes.Bowgun,
        EquipmentTypes.Staff, EquipmentTypes.MagicDevice,
        EquipmentTypes.Knuckle, EquipmentTypes.Halberd,
        EquipmentTypes.Katana,
      ][item.category];

      return new MainWeapon(...pre_args, type, item.baseValue, stability);
    }
    if (item.category < 200) {
      const type = [
        EquipmentTypes.Arrow, EquipmentTypes.Dagger, EquipmentTypes.NinjutsuScroll,
      ][item.category - 100];
      return new SubWeapon(...pre_args, type, item.baseValue, stability);
    }
    if (item.category < 300) {
      return new SubArmor(...pre_args, EquipmentTypes.Shield, item.baseValue);
    }
  }
}

interface EquipmentSaveData {
  name: string;
  instance: number;
  stats: StatRestrictionSaveData[];
  isCustom: boolean;
  id: number;
  type?: EquipmentTypes;
  atk?: number;
  def?: number;
  stability?: number;
  refining?: number;
  crystals?: string[];
}

abstract class Weapon extends CharacterEquipment {
  atk: number;
  stability: number;

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], atk: number | string = 1, stability = 0) {
    super(origin, name, stats);

    atk = typeof atk === 'string' ? parseInt(atk, 10) : atk;

    this.atk = atk;
    this.stability = stability;
  }
  get hasStability() {
    return true;
  }
}

class MainWeapon extends Weapon {
  refining: number;
  type: EquipmentTypes;
  crystals: EquipmentCrystal[];

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    type: EquipmentTypes,
    atk: number,
    stability: number = 0,
  ) {
    super(origin, name, stats, atk, stability);

    this.type = type;
    this.crystals = [];
    this.refining = 0;
  }

  get refiningAdditionAmount() {
    return Math.floor(this.atk * this.refining * this.refining / 100) + this.refining;
  }
  get hasRefining() {
    return true;
  }
  get hasCrystal() {
    return true;
  }
  get hasElement() {
    return true;
  }
  get creatable() {
    return true;
  }
}


class SubWeapon extends Weapon {
  type: EquipmentTypes;

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    type: EquipmentTypes,
    atk: number,
    stability: number = 0,
  ) {
    super(origin, name, stats, atk, stability);

    this.type = type;
  }

  get hasElement() {
    return this.type === EquipmentTypes.Arrow;
  }
}

abstract class Armor extends CharacterEquipment {
  def: number;

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    def: number | string = 0,
  ) {
    super(origin, name, stats);

    def = typeof def === 'string' ? parseInt(def, 10) : def;

    this.def = def;
  }
}

class SubArmor extends Armor {
  type: EquipmentTypes;
  refining: number;

  constructor(
    origin: EquipmentOrigin,
    name: string,
    stats: StatRestriction[],
    type: EquipmentTypes,
    def: number | string = 0,
  ) {
    super(origin, name, stats, def);

    this.type = type;
    this.refining = 0;
  }
  get hasRefining() {
    return true;
  }
}

class BodyArmor extends Armor {
  type: EquipmentTypes;
  refining: number;
  crystals: EquipmentCrystal[];

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], def: number | string) {
    super(origin, name, stats, def);

    this.type = EquipmentTypes.BodyNormal;
    this.refining = 0;
    this.crystals = [];
  }
  setType(type: EquipmentTypes) {
    this.type = type;
  }
  get customTypeList() {
    return [
      EquipmentTypes.BodyNormal,
      EquipmentTypes.BodyDodge,
      EquipmentTypes.BodyDefense,
    ];
  }
  get hasRefining() {
    return true;
  }
  get hasCrystal() {
    return true;
  }
  get creatable() {
    return true;
  }
}

class AdditionalGear extends Armor {
  refining: number;
  crystals: EquipmentCrystal[];

  readonly type: EquipmentTypes;

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], def: number | string) {
    super(origin, name, stats, def);

    this.refining = 0;
    this.crystals = [];
    this.type = EquipmentTypes.Additional;
  }
  get hasRefining() {
    return true;
  }
  get hasCrystal() {
    return true;
  }
}

class SpecialGear extends Armor {
  crystals: EquipmentCrystal[];

  readonly type: EquipmentTypes;

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[], def: number | string) {
    super(origin, name, stats, def);

    this.crystals = [];
    this.type = EquipmentTypes.Special;
  }
  get hasCrystal() {
    return true;
  }
}

class Avatar extends CharacterEquipment {
  readonly type: EquipmentTypes;

  constructor(origin: EquipmentOrigin, name: string, stats: StatRestriction[]) {
    super(origin, name, stats);
    this.type = EquipmentTypes.Avatar;
  }
}

class EquipmentCrystal {
  origin: Crystal;
  stats: StatRestriction[];

  constructor(origin: Crystal) {
    this.origin = origin;
    this.stats = this.origin.stats
      .map((stat, idx) => StatRestriction.fromOrigin(stat, this.origin.statRestrictions[idx]));
  }

  get id() {
    return this.origin.id;
  }
  get name() {
    return this.origin.name;
  }

  copy() {
    return new EquipmentCrystal(this.origin);
  }
}

export {
  CharacterEquipment, EquipmentCrystal,
  MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar,
};
export type { EquipmentTypes };
