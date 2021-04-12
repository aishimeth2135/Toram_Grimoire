import { RestrictionStat } from "../Stat";
import Grimoire from "@Grimoire";

class CharacterEquipment {
  constructor(origin=null, name=null, stats=[]) {
    this.origin = origin;
    this._name = name;
    this.stats = stats;
    this._isCustom = false;
  }

  get id() {
    return this.origin ? this.origin.id : 0;
  }
  get name() {
    return this._name ? this._name : (this.origin ? this.origin.name : '');
  }
  set name(v) {
    this._name = v;
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
  get allStats() {
    const all = this.stats.map(p => p.copy());
    if (this.hasCrystal) {
      this.crystals.forEach(c => {
        c.stats.forEach(stat => {
          const t = all.find(a => a.equals(stat));
          t ? t.addStatValue(stat.statValue()) : all.push(stat.copy());
        });
      });
    }
    return all;
  }
  get isCustom() {
    return this._isCustom;
  }
  get elementStat() {
    return this.stats.find(stat => CharacterEquipment.elementStatIds.includes(stat.baseName()));
  }

  getAllStats(checkRestriction = () => true) {
    const all = this.stats
      .map(p => {
        const stat = p.copy();
        if (!checkRestriction(stat))
          stat.statValue(0);
        return stat;
      });
    if (this.hasCrystal) {
      this.crystals.forEach(c => {
        c.stats.forEach(stat => {
          const t = all.find(a => a.equals(stat));
          if (t)
            t.addStatValue(checkRestriction(stat) ? stat.statValue() : 0);
          else {
            const a = stat.copy();
            if (!checkRestriction(a))
              a.statValue(0);
            all.push(a);
          }
        });
      });
    }
    return all;
  }

  setCustom(set) {
    if (this._isCustom != set)
      this._isCustom = set;
  }
  setCustomType(type) {
    this.type = type;
  }
  findStat(baseName, type) {
    return this.stats.find(stat => stat.baseName() == baseName && stat.type == type);
  }
  appendCrystal(origin) {
    if (this.hasCrystal && this.crystals.length < 2) {
      this.crystals.push(new EquipmentCrystal(origin));
    }
  }
  removeCrystal(crystal) {
    if (this.hasCrystal) {
      const idx = this.crystals.indexOf(crystal);
      this.crystals.splice(idx, 1);
    }
  }

  copy() {
    const stats = this.stats.map(p => p.copy());
    const name = this.name;

    let eq;
    if (this instanceof Weapon) {
      eq = new this.constructor(this.id, name, stats, this.type, this.baseAtk);
      eq.atk = this.atk;
    }
    if (this instanceof Armor) {
      eq = this instanceof SubArmor ?
        new this.constructor(this.id, name, stats, this.type, this.baseDef) :
        new this.constructor(this.id, name, stats, this.baseDef);
      eq.def = this.def;
    }
    if (this instanceof Avatar) {
      eq = new this.constructor(this.id, name, stats);
    }

    if (this.hasRefining)
      eq.refining = this.refining;
    if (this.hasStability)
      eq.stability = this.stability;
    if (this.hasCrystal)
      eq.crystals = this.crystals.map(p => p.copy());
    if (this.isCustom)
      eq.setCustom(true);

    return eq;
  }

  // save and load of json-data
  save() {
    const data = {};

    // == [ instance ] [ type ] =====================================
    const findType = (inst, list) => list.find(p => this.type == inst['TYPE_' + p.toUpperCase()]);
    let instance, type;
    if (this instanceof MainWeapon) {
      instance = 0;
      const list = [
        'one_hand_sword', 'two_hand_sword', 'bow', 'bowgun',
        'staff', 'magic_device', 'knuckle', 'halberd', 'katana'
      ];
      type = findType(MainWeapon, list);
    }
    else if (this instanceof SubWeapon) {
      instance = 1;
      const list = ['arrow', 'dagger'];
      type = findType(SubWeapon, list);
    }
    else if (this instanceof SubArmor) {
      instance = 2;
      const list = ['shield'];
      type = findType(SubArmor, list);
    }
    else if (this instanceof BodyArmor) {
      instance = 3;
      const list = ['normal', 'dodge', 'defense'];
      type = findType(BodyArmor, list);
    }
    else if (this instanceof AdditionalGear)
      instance = 4;
    else if (this instanceof SpecialGear)
      instance = 5;
    else if (this instanceof Avatar)
      instance = 6;

    data.instance = instance;
    if (type)
      data.type = type;

    // == [ stats ] ==================================================
    data.stats = this.stats.map(stat => stat.save());

    // == [ atk ] [ def ] ============================================
    if (this instanceof Weapon) {
      data.baseAtk = this.baseAtk;
      data.atk = this.atk;
    } else if (this instanceof Armor) {
      data.baseDef = this.baseDef;
      data.def = this.def;
    }

    // == [ other ] ===================================================
    data.name = this.name;
    if (this.hasStability)
      data.stability = this.stability;
    if (this.hasRefining)
      data.refining = this.refining;
    if (this.hasCrystal)
      data.crystals = this.crystals.map(p => p.name);

    data.isCustom = this.isCustom;

    // == [ id ] ======================================================
    data.id = this.id;

    return data;
  }
}
CharacterEquipment.elementStatIds = [
  'element_fire',
  'element_water',
  'element_earth',
  'element_wind',
  'element_light',
  'element_dark'
];
CharacterEquipment.loadEquipment = function (data) {
  try {
    let success = true;

    const { id, name, stability, refining, baseAtk, atk, baseDef, def, crystals, isCustom } = data;
    const getType = (inst, str) => inst['TYPE_' + str.toUpperCase()];
    const stats = data.stats.map(p => RestrictionStat.load(p)).filter(p => p);

    const instance = [
      MainWeapon, SubWeapon, SubArmor, BodyArmor,
      AdditionalGear, SpecialGear, Avatar
    ][data.instance];

    let eq;
    switch (data.instance) {
      case 0:
      case 1:
        eq = new instance(id, name, stats, getType(instance, data.type), baseAtk, stability);
        eq.atk = atk;
        break;
      case 2:
        eq = new instance(id, name, stats, getType(instance, data.type), baseDef);
        eq.def = def;
        break;
      case 3:
      case 4:
      case 5:
        eq = new instance(id, name, stats, baseDef);
        eq.def = def;
        if (data.instance == 3)
          eq.setType(getType(instance, data.type));
        break;
      case 6:
        eq = new instance(id, name, stats);
    }

    if (eq.hasRefining) {
      eq.refining = refining;
    }
    if (eq.hasCrystal) {
      eq.crystals = crystals.map(name => {
        const c = Grimoire.Items.crystals.find(p => p.name == name);
        if (c)
          return new EquipmentCrystal(c);

        success = false;
        console.warn('[Error: CharacterEquipment.load] can not find crystal which name: ' + name);
        return null;
      }).filter(c => c);
    }

    eq.setCustom(isCustom);

    return {
      success,
      equipment: eq
    };
  } catch (e) {
    console.warn(e);
    return {
      error: true
    };
  }
};

CharacterEquipment.fromOriginEquipment = function(item, {
  statValueToNumber = true
} = {}) {
  // 'Equipmemt Category list': [
  //     '單手劍', '雙手劍', '弓', '弩',
  //     '法杖', '魔導具', '拳套', '旋風槍',
  //     '拔刀劍', '箭矢', '盾牌', '小刀',
  //     '身體裝備', '追加裝備', '特殊裝備'
  // ]
  const pre_args = [
    item, item.name,
    item.stats.map((p, i) => {
      const t = RestrictionStat.fromOrigin(p, item.statRestrictions[i]);
      if (statValueToNumber)
        t.value = /^\d+$/.test(t.value) ? parseFloat(t.value) : 0;
      return t;
    })
  ];

  const stability = parseInt(item.baseStability, 10);
  if (item.category < 9) {
    const t = [
      MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
      MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
      MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
      MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
      MainWeapon.TYPE_KATANA
    ][item.category];

    return new MainWeapon(...pre_args, t, item.baseValue, stability);
  }
  if (item.category < 12) {
    const t = [
      SubWeapon.TYPE_ARROW, SubArmor.TYPE_SHIELD, SubWeapon.TYPE_DAGGER
    ][item.category - 9];
    if (item.category == 10)
      return new SubArmor(...pre_args, t, item.baseValue);
    return new SubWeapon(...pre_args, t, item.baseValue, stability);
  }
  if (item.category == 12)
    return new BodyArmor(...pre_args, item.baseValue);
  if (item.category == 13)
    return new AdditionalGear(...pre_args, item.baseValue);
  if (item.category == 14)
    return new SpecialGear(...pre_args, item.baseValue);
}

class Weapon extends CharacterEquipment {
  constructor(id, name, stats, atk = 1, stability = 0) {
    super(id, name, stats);

    atk = typeof atk == 'string' ? parseInt(atk, 10) : atk;

    this.baseAtk = atk;
    this.atk = atk;
    this.stability = stability;
  }
  get hasStability() {
    return true;
  }
}

class MainWeapon extends Weapon {
  constructor(origin, name, stats, type, atk, stability) {
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
}
MainWeapon.TYPE_ONE_HAND_SWORD = Symbol('one-hand-sword');
MainWeapon.TYPE_TWO_HAND_SWORD = Symbol('two-hand-sword');
MainWeapon.TYPE_BOW = Symbol('bow');
MainWeapon.TYPE_BOWGUN = Symbol('bowgun');
MainWeapon.TYPE_STAFF = Symbol('staff');
MainWeapon.TYPE_MAGIC_DEVICE = Symbol('magic-device');
MainWeapon.TYPE_KNUCKLE = Symbol('knuckle');
MainWeapon.TYPE_HALBERD = Symbol('halberd');
MainWeapon.TYPE_KATANA = Symbol('katana');


class SubWeapon extends Weapon {
  constructor(origin, name, stats, type, atk, stability) {
    super(origin, name, stats, atk, stability);

    this.type = type;
  }

  get hasElement() {
    return this.type == SubWeapon.TYPE_ARROW;
  }
}
SubWeapon.TYPE_ARROW = Symbol('sub-weapon|arrow');
SubWeapon.TYPE_DAGGER = Symbol('sub-weapon|dagger');

class Armor extends CharacterEquipment {
  constructor(origin, name, stats, def = 0) {
    super(origin, name, stats);

    def = typeof def == 'string' ? parseInt(def, 10) : def;

    this.baseDef = def;
    this.def = def;
  }
}

class SubArmor extends Armor {
  constructor(origin, name, stats, type, def) {
    super(origin, name, stats, def);

    this.type = type;
    this.refining = 0;
  }
  get hasRefining() {
    return true;
  }
}
SubArmor.TYPE_SHIELD = Symbol('sub-armor|shield');

class BodyArmor extends Armor {
  constructor(origin, name, stats, def) {
    super(origin, name, stats, def);

    this.type = BodyArmor.TYPE_NORMAL;
    this.refining = 0;
    this.crystals = [];
  }
  setType(type) {
    this.type = type;
  }
  get customTypeList() {
    return [BodyArmor.TYPE_NORMAL, BodyArmor.TYPE_DODGE, BodyArmor.TYPE_DEFENSE];
  }
  get hasRefining() {
    return true;
  }
  get hasCrystal() {
    return true;
  }
}
BodyArmor.TYPE_NORMAL = Symbol('body-armor|normal');
BodyArmor.TYPE_DODGE = Symbol('body-armor|dodge');
BodyArmor.TYPE_DEFENSE = Symbol('body-armor|defense');

class AdditionalGear extends Armor {
  constructor(origin, name, stats, def) {
    super(origin, name, stats, def);

    this.refining = 0;
    this.crystals = [];
  }
  get hasRefining() {
    return true;
  }
  get hasCrystal() {
    return true;
  }
}

class SpecialGear extends Armor {
  constructor(origin, name, stats, def) {
    super(origin, name, stats, def);

    this.crystals = [];
  }
  get hasCrystal() {
    return true;
  }
}

class Avatar extends CharacterEquipment {
  constructor(origin, name, stats) {
    super(origin, name, stats);
  }
}

class EquipmentCrystal {
  constructor(origin) {
    this.origin = origin;
    // this.id = id;
    // this.name = name;
    this.stats = this.origin.stats.map((p, i) => RestrictionStat.fromOrigin(p, this.origin.statRestrictions[i]));
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
  MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar
};