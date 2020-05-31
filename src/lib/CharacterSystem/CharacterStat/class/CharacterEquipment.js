import {EquipmentField} from "./main.js";


class CharacterEquipment {
    constructor(id, name, stats){
        this.id = id;
        this.type = null;
        this.name = name;
        this.stats = stats;
    }
    get is(){
        if ( this instanceof Weapon )
            return 'weapon';
        if ( this instanceof Armor )
            return 'armor';
        if ( this instanceof Avatar )
            return 'avatar';
        return 'other';
    }
    get hasRefining(){
        return false;
    }
    get hasCrystal(){
        return false;
    }
    get customTypeList(){
        return null;
    }
    setCustomType(type){
        if ( this.customTypeList != null ){
            this.type = type;
        }
    }
    appendCrystal(id, name, stats){
        if ( this.hasCrystal ){
            this.crystals.push(new EquipmentCrystal(id, name, stats));
        }
    }
    removeCrystal(index){
        if ( this.hasCrystal )
            this.crystals.splice(index, 1);
    }
    get allStats(){
        const all = this.stats.map(p => p.copy());
        if ( this.hasCrystal ){
            this.crystals.forEach(p => {
                const t = all.find(a => a.equals(p));
                t ? t.addStatValue(p.statValue()) : all.push(p.copy());
            });
        }
        return all;
    }
}

class Weapon extends CharacterEquipment {
    constructor(id, name, stats, atk, stability){
        super(id, name, stats);

        this.atk = atk;
        this.stability = stability;
    }
}

class MainWeapon extends Weapon {
    constructor(id, type, name, stats, atk=1, stability=0){
        super(id, name, stats, atk, stability);

        this.type = type;
        this.crystals = [];
        this.refining = 0;
    }
    get refiningAdditionAmount(){
        return Math.floor(this.atk * this.refining * this.refining / 100) + this.refining;
    }
    testSubWeapon(eq){
        const t = [];
        switch (this.type){
            case MainWeapon.TYPE_ONE_HAND_SWORD: 
                t.push(MainWeapon.TYPE_ONE_HAND_SWORD);
            case MainWeapon.TYPE_BOWGUN:
            case MainWeapon.TYPE_STAFF:
                t.push(MainWeapon.TYPE_KNUCKLE);
            case MainWeapon.TYPE_KNUCKLE:
                t.push(MainWeapon.TYPE_MAGIC_DEVICE, SubWeapon.TYPE_SHIELD);
            case MainWeapon.TYPE_HALBERD:
            case MainWeapon.TYPE_KATANA:
                t.push(SubWeapon.TYPE_DAGGER, SubWeapon.TYPE_ARROW);
                break;
            case MainWeapon.TYPE_BOW:
                t.push(SubWeapon.TYPE_ARROW, MainWeapon.TYPE_KATANA);
        }
        return t.includes(eq.type);
    }
    get hasRefining(){
        return true;
    }
    get hasCrystal(){
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
    constructor(id, type, name, stats, atk, stability){
        super(id, name, stats, atk, stability);

        this.type = type;
    }
}
SubWeapon.TYPE_ARROW = Symbol('arrow');
SubWeapon.TYPE_DAGGER = Symbol('dagger');

// class OneHandSword extends MainWeapon {
//     constructor(...args){
//         super(...args);

//         this.equippableField = 
//     }
// }

class Armor extends CharacterEquipment {
    constructor(id, name, stats, def){
        super(id, name, stats);

        this.def = def;
    }
}

class SubArmor extends Armor {
    constructor(id, name, stats, def){
        super(id, name, stats, def);

        this.type = SubArmor.TYPE_SHIELD;
        this.refining = 0;
    }
    get hasRefining(){
        return true;
    }
}
SubArmor.TYPE_SHIELD = Symbol('shield');

class BodyArmor extends Armor {
    constructor(id, name, stats, def){
        super(id, name, stats, def);

        this.type = BodyArmor.TYPE_NORMAL;
        this.refining = 0;
        this.crystals = [];
    }
    setType(type){
        this.type = type;
    }
    get customTypeList(){
        return [BodyArmor.TYPE_NORMAL, BodyArmor.TYPE_DODGE, BodyArmor.TYPE_DEFENSE];
    }
    get hasRefining(){
        return true;
    }
    get hasCrystal(){
        return true;
    }
}
BodyArmor.TYPE_NORMAL = Symbol('body-armor-normal');
BodyArmor.TYPE_DODGE = Symbol('body-armor-dodge');
BodyArmor.TYPE_DEFENSE = Symbol('body-armor-defense');

class AdditionalGear extends Armor {
    constructor(id, name, stats, def){
        super(id, name, stats, def);

        this.refining = 0;
        this.crystals = [];
    }
    get hasRefining(){
        return true;
    }
    get hasCrystal(){
        return true;
    }
}

class SpecialGear extends Armor {
    constructor(id, name, stats, def){
        super(id, name, stats, def);

        this.crystals = [];
    }
    get hasCrystal(){
        return true;
    }
}

class Avatar extends CharacterEquipment {
    constructor(name, stats, atk, stability){
        super(null, name, stats);
    }
}

class EquipmentCrystal {
    constructor(id, name, stats){
        this.id = id;
        this.name = name;
        this.stats = stats;
    }
}

export {Weapon, Armor, MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar};