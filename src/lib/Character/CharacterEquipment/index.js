import Grimoire from "@grimoire";
import GetLang from "@services/Language";

import { EquipmentField } from "../Character";
import { RestrictionStat } from "../Stat";
import { isNumberString } from "@utils/string";

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
  get creatable() {
    return false;
  }
  get allStats() {
    const all = this.stats.map(p => p.copy());
    if (this.hasCrystal) {
      this.crystals.forEach(c => {
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
    if (this.type) {
      return GetLang('common/Equipment/category/' + this.type.description);
    }
    if (this instanceof AdditionalGear) {
      return GetLang('common/Equipment/field/' + EquipmentField.TYPE_ADDITIONAL.description);
    }
    if (this instanceof SpecialGear) {
      return GetLang('common/Equipment/field/' + EquipmentField.TYPE_SPECIAL.description);
    }
    if (this instanceof Avatar) {
      return GetLang('common/Equipment/field/' + EquipmentField.TYPE_AVATAR.description);
    }
    return '';
  }
  get categoryIcon() {
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

  getAllStats(checkRestriction = () => true) {
    const all = this.stats
      .map(p => {
        const stat = p.copy();
        if (!checkRestriction(stat))
          stat.value = 0;
        return stat;
      });
    if (this.hasCrystal) {
      this.crystals.forEach(c => {
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

  setCustom(set) {
    if (this._isCustom != set)
      this._isCustom = set;
  }
  setCustomType(type) {
    this.type = type;
  }
  findStat(baseName, type) {
    return this.stats.find(stat => stat.baseName == baseName && stat.type == type);
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
      const list = ['arrow', 'dagger', 'ninjutsu_scroll'];
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
      case 0: case 1:
        eq = new instance(id, name, stats, getType(instance, data.type), baseAtk, stability);
        eq.atk = atk;
        break;
      case 2:
        eq = new instance(id, name, stats, getType(instance, data.type), baseDef);
        eq.def = def;
        break;
      case 3: case 4: case 5:
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
  /* [
    0'單手劍', 1'雙手劍', 2'弓', 3'弩', 4'法杖',
    5'魔導具', 6'拳套', 7'旋風槍', 8'拔刀劍',
    100'箭矢', 101'小刀', 102'忍術卷軸',
    200'盾牌',
    300'身體裝備', 400'追加裝備', 500'特殊裝備',
  ] */
  const pre_args = [
    item, item.name,
    item.stats.map((p, i) => {
      const t = RestrictionStat.fromOrigin(p, item.statRestrictions[i]);
      if (statValueToNumber)
        t.value = isNumberString(t.value) ? parseFloat(t.value) : 0;
      return t;
    })
  ];

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
    const t = [
      MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
      MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
      MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
      MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
      MainWeapon.TYPE_KATANA
    ][item.category];

    return new MainWeapon(...pre_args, t, item.baseValue, stability);
  }
  if (item.category < 200) {
    const t = [
      SubWeapon.TYPE_ARROW, SubWeapon.TYPE_DAGGER, SubWeapon.TYPE_NINJUTSU_SCROLL
    ][item.category - 100];
    return new SubWeapon(...pre_args, t, item.baseValue, stability);
  }
  if (item.category < 300) {
    return new SubArmor(...pre_args, SubArmor.TYPE_SHIELD, item.baseValue);
  }
}

class Weapon extends CharacterEquipment {
  constructor(id, name, stats, atk = 1, stability = 0) {
    super(id, name, stats);

    atk = typeof atk === 'string' ? parseInt(atk, 10) : atk;

    this.baseAtk = atk;
    this.atk = atk;
    this.stability = stability;
  }
  get hasStability() {
    return true;
  }
}

class MainWeapon extends Weapon {
  static TYPE_ONE_HAND_SWORD = Symbol('one-hand-sword');
  static TYPE_TWO_HAND_SWORD = Symbol('two-hand-sword');
  static TYPE_BOW = Symbol('bow');
  static TYPE_BOWGUN = Symbol('bowgun');
  static TYPE_STAFF = Symbol('staff');
  static TYPE_MAGIC_DEVICE = Symbol('magic-device');
  static TYPE_KNUCKLE = Symbol('knuckle');
  static TYPE_HALBERD = Symbol('halberd');
  static TYPE_KATANA = Symbol('katana');

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
  get creatable() {
    return true;
  }
}


class SubWeapon extends Weapon {
  static TYPE_ARROW = Symbol('sub-weapon|arrow');
  static TYPE_DAGGER = Symbol('sub-weapon|dagger');
  static TYPE_NINJUTSU_SCROLL = Symbol('sub-weapon|ninjutsu-scroll');

  constructor(origin, name, stats, type, atk, stability) {
    super(origin, name, stats, atk, stability);

    this.type = type;
  }

  get hasElement() {
    return this.type === SubWeapon.TYPE_ARROW;
  }
}

class Armor extends CharacterEquipment {
  constructor(origin, name, stats, def = 0) {
    super(origin, name, stats);

    def = typeof def == 'string' ? parseInt(def, 10) : def;

    this.baseDef = def;
    this.def = def;
  }
}

class SubArmor extends Armor {
  static TYPE_SHIELD = Symbol('sub-armor|shield');

  constructor(origin, name, stats, type, def) {
    super(origin, name, stats, def);

    this.type = type;
    this.refining = 0;
  }
  get hasRefining() {
    return true;
  }
}

class BodyArmor extends Armor {
  static TYPE_NORMAL = Symbol('body-armor|normal');
  static TYPE_DODGE = Symbol('body-armor|dodge');
  static TYPE_DEFENSE = Symbol('body-armor|defense');

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
  get creatable() {
    return true;
  }
}

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