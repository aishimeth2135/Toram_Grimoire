import {EquipmentField} from "./main.js";


class CharacterEquipment {
    constructor(name, stats){
        this.name = name;
        this.stats = stats;
    }
}

class Weapon extends CharacterEquipment {
    constructor(name, stats, atk, stability){
        super(name, stats);

        this.atk = atk;
        this.stability = stability;
    }
}

class MainWeapon extends Weapon {
    constructor(type, name, stats, atk, stability){
        super(name, stats, atk, stability);

        this.type = type;
        this.refining = 0;
        this.crystals = [];
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


class SubWeapon extends Weapon {
    constructor(type, name, stats, atk, stability){
        super(name, stats, atk, stability);

        this.type = type;
    }
}
SubWeapon.TYPE_ARROW = Symbol('arrow');
SubWeapon.TYPE_SHIELD = Symbol('shield');
SubWeapon.TYPE_DAGGER = Symbol('dagger');

// class OneHandSword extends MainWeapon {
//     constructor(...args){
//         super(...args);

//         this.equippableField = 
//     }
// }

class Armor extends CharacterEquipment {
    constructor(name, stats, def){
        super(name, stats);

        this.def = def;
    }
}

class BodyArmor extends Armor {
    constructor(type, name, stats, def){
        super(name, stats, def);

        this.type = type;
        this.refining = 0;
        this.crystals = [];
    }
}
BodyArmor.TYPE_NORMAL = Symbol('body-armor-normal');
BodyArmor.TYPE_DODGE = Symbol('body-armor-dodge');
BodyArmor.TYPE_DEFENSE = Symbol('body-armor-defense');

export {MainWeapon, SubWeapon, BodyArmor};