// import { EquipmentField } from "./main.js";


class CharacterEquipment {
  constructor(id, name="", stats=[]) {
    this.id = id;
    this.name = name;
    this.stats = stats;
    this._isCustom = false;
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
  setCustom(set) {
    this._isCustom = set;
  }
  setCustomType(type) {
    this.type = type;
  }
  findStat(baseName, type) {
    return this.stats.find(stat => stat.baseName() == baseName && stat.type == type);
  }
  appendCrystal(origin, id, name, stats) {
    if (this.hasCrystal && this.crystals.length < 2) {
      this.crystals.push(new EquipmentCrystal(origin, id, name, stats));
    }
  }
  removeCrystal(crystal) {
    if (this.hasCrystal) {
      const idx = this.crystals.indexOf(crystal);
      this.crystals.splice(idx, 1);
    }
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
  constructor(id, name, stats, type, atk, stability) {
    super(id, name, stats, atk, stability);

    this.type = type;
    this.crystals = [];
    this.refining = 0;
  }
  get refiningAdditionAmount() {
    return Math.floor(this.atk * this.refining * this.refining / 100) + this.refining;
  }
  testSubWeapon(eq) {
    const t = [];
    switch (this.type) {
      case MainWeapon.TYPE_ONE_HAND_SWORD:
        t.push(MainWeapon.TYPE_ONE_HAND_SWORD);
        // fall through
      case MainWeapon.TYPE_BOWGUN:
      case MainWeapon.TYPE_STAFF:
        t.push(MainWeapon.TYPE_KNUCKLE);
        // fall through
      case MainWeapon.TYPE_KNUCKLE:
        t.push(MainWeapon.TYPE_MAGIC_DEVICE, SubWeapon.TYPE_SHIELD);
        // fall through
      case MainWeapon.TYPE_HALBERD:
      case MainWeapon.TYPE_KATANA:
        t.push(SubWeapon.TYPE_DAGGER, SubWeapon.TYPE_ARROW);
        break;
      case MainWeapon.TYPE_BOW:
        t.push(SubWeapon.TYPE_ARROW, MainWeapon.TYPE_KATANA);
    }
    return t.includes(eq.type);
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
  constructor(id, name, stats, type, atk, stability) {
    super(id, name, stats, atk, stability);

    this.type = type;
  }
  get hasElement() {
    return this.type == SubWeapon.TYPE_ARROW;
  }
}
SubWeapon.TYPE_ARROW = Symbol('arrow');
SubWeapon.TYPE_DAGGER = Symbol('dagger');

class Armor extends CharacterEquipment {
  constructor(id, name, stats, def = 0) {
    super(id, name, stats);

    def = typeof def == 'string' ? parseInt(def, 10) : def;

    this.baseDef = def;
    this.def = def;
  }
}

class SubArmor extends Armor {
  constructor(id, name, stats, type, def) {
    super(id, name, stats, def);

    this.type = type;
    this.refining = 0;
  }
  get hasRefining() {
    return true;
  }
}
SubArmor.TYPE_SHIELD = Symbol('shield');

class BodyArmor extends Armor {
  constructor(id, name, stats, def) {
    super(id, name, stats, def);

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
BodyArmor.TYPE_NORMAL = Symbol('body-armor-normal');
BodyArmor.TYPE_DODGE = Symbol('body-armor-dodge');
BodyArmor.TYPE_DEFENSE = Symbol('body-armor-defense');

class AdditionalGear extends Armor {
  constructor(id, name, stats, def) {
    super(id, name, stats, def);

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
  constructor(id, name, stats, def) {
    super(id, name, stats, def);

    this.crystals = [];
  }
  get hasCrystal() {
    return true;
  }
}

class Avatar extends CharacterEquipment {
  constructor(id, name, stats) {
    super(id, name, stats);
  }
}

class EquipmentCrystal {
  constructor(origin, id, name, stats) {
    this.origin = origin;
    this.id = id;
    this.name = name;
    this.stats = stats;
  }
}

export { CharacterEquipment, Weapon, Armor, MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar };