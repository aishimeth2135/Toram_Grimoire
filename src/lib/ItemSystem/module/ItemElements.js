import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";


class Items {
    constructor(){
        this.equipments = [];
        this.crystals = [];
    }
    appendEquipment(){
        const t = new Equipment(this.equipments.length, ...arguments);
        this.equipments.push(t);
        return t;
    }
    appendCrystal(){
        const t = new Crystal(this.crystals.length, ...arguments);
        this.crystals.push(t);
        return t;
    }
}

class Item {
    constructor(id, name){
        this.id = id;
        this.name = name;

        this.stats = [];
        this.statRestrictions = [];

        this.obtains = [];
    }
    appendObtain(){
        const t = {};
        this.obtains.push(t);
        return t;
    }
    appendStat(baseName, v, tail, restriction){
        let type;
        switch ( tail ){
            case '':
                type = StatBase.TYPE_CONSTANT;
                break;
            case '%':
                type = StatBase.TYPE_MULTIPLIER;
                break;
            case '~':
                type = StatBase.TYPE_TOTAL;
                break;
        }
        const stat = Grimoire.CharacterSystem.findStatBase(baseName).createSimpleStat(type, v);
        this.stats.push(stat);
        this.statRestrictions.push(restriction);
        return stat;
    }
}

class Equipment extends Item {
    constructor(id, n, cat, bv, bstab, cap){
        super(id, n);
        
        this.category = cat;

        this.baseValue = bv;
        if ( bstab !== '' )
            this.baseStability = bstab;
        this.caption = cap;
    }
    setRecipe(){
        this.recipe = {};
        return this.recipe;
    }
}

class Crystal extends Item {
    constructor(id, name, cat){
        super(id, name);

        this.category = cat;
        this.enhancer = null;
    }
    setEnhancer(t){
        this.enhancer = t;
    }
}

class Prop {
    constructor(name, quantity, cat){
        this.name = name;
        this.quantity = quantity;
        this.category = cat;
    }
}
Prop.CATEGORY_MATERIAL = Symbol('Material');
Prop.CATEGORY_MATERIAL_POINT = Symbol('Material Point');

export {Items, Prop};