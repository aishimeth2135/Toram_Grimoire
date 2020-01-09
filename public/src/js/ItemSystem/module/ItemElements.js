import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";


class Items {
    constructor(){
        this.equipments = [];
    }
    appendEquipment(){
        const t = new Equipment(...arguments);
        this.equipments.push(t);
        return t;
    }
}

class Equipment {
    constructor(n, cat, bv, bstab, cap){
        this.name = n;
        this.category = cat;
        this.baseValue = bv;
        if ( bstab !== '' )
            this.baseStability = bstab;
        this.caption = cap;
        this.stats = [];
        this.statRestrictions = [];
        this.obtains = [];
    }
    setRecipe(){
        this.recipe = {};
        return this.recipe;
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

class Prop {
    constructor(name, quantity, cat){
        this.name = name;
        this.quantity = quantity;
        this.category = cat;
    }
}
Prop.CATEGORY_MATERIAL = Symbol('Material');
Prop.CATEGORY_MATERIAL_POINT = Symbol('Material Point');

export {Items, Equipment, Prop};