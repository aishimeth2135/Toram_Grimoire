function safeEval(v, dv){
    try {
        return eval(v);
    }
    catch (e){
        console.warn(e);
        return dv === void 0 ? '0' : dv;
    }
}


class Character {
    constructor(name){
        this.name = name;

        this.equipmentFields = [];
    }
    init(names){
        this.equipmentFields.push(...[
            EquipmentField.TYPE_MAIN_WEAPON,
            EquipmentField.TYPE_SUB_WEAPON,
            EquipmentField.TYPE_BODY_ARMOR,
            EquipmentField.TYPE_ADDITIONAL,
            EquipmentField.TYPE_SPECIAL,
            EquipmentField.TYPE_AVATAR,
            EquipmentField.TYPE_AVATAR
        ].map((p, i) => new EquipmentField(p)));
        return this;
    }
}

class EquipmentField {
    constructor(type){
        this.type = type;

        this.items = [];

        this.equipments = [];
        this._currentEquipmentIndex = -1;

        this._init();
    }
    // _init(){
    //     switch (this.type){
    //         case EquipmentField.TYPE_MAIN:
    //             this.appendItem(
    //                 EquipmentFieldItem.TYPE_STATS,
    //                 EquipmentFieldItem.TYPE_ATK,
    //                 EquipmentFieldItem.TYPE_REFINING,
    //                 EquipmentFieldItem.TYPE_STABILITY
    //             );
    //             break;
    //         case EquipmentField.TYPE_SUB:
    //             this.appendItem(
    //                 EquipmentFieldItem.TYPE_STATS,
    //                 EquipmentFieldItem.TYPE_ATK,
    //                 EquipmentFieldItem.TYPE_DEF,
    //                 EquipmentFieldItem.TYPE_REFINING,
    //                 EquipmentFieldItem.TYPE_STABILITY
    //             );
    //             break;
    //         case EquipmentField.TYPE_ARMOR:
    //             this.appendItem(
    //                 EquipmentFieldItem.TYPE_STATS,
    //                 EquipmentFieldItem.TYPE_DEF,
    //                 EquipmentFieldItem.TYPE_REFINING
    //             );
    //             break;
    //         case EquipmentField.TYPE_ADDITIONAL:
    //             this.appendItem(
    //                 EquipmentFieldItem.TYPE_STATS,
    //                 EquipmentFieldItem.TYPE_DEF,
    //                 EquipmentFieldItem.TYPE_REFINING
    //             );
    //             break;
    //         case EquipmentField.TYPE_SPECIAL:
    //             this.appendItem(
    //                 EquipmentFieldItem.TYPE_STATS,
    //                 EquipmentFieldItem.TYPE_DEF
    //             );
    //             break;
    //         case EquipmentField.TYPE_SPECIAL:
    //             this.appendItem(
    //                 EquipmentFieldItem.TYPE_STATS,
    //                 EquipmentFieldItem.TYPE_DEF
    //             );
    //             break;
    //     }
    // }
    // appendItem(...types){
    //     this.items.push(...types.map(t => new EquipmentFieldItem(this, t)));
    // }
    // getItem(name){
    //     const s = EquipmentFieldItem['TYPE_' + name.toUpperCase()];

    //     return this.items.find(a => a.type == s);
    // }
    // itemExisting(name){
    //     return this.getItem(name) ? true : false;
    // }
    get currentEquipment(){
        if ( this._currentEquipmentIndex == -1 )
            return null;
        return this.equipments[this._currentEquipmentIndex];
    }
    selectCurrentEquipment(index){
        this._currentEquipmentIndex = index;
    }
    equipmentCategoryConfirm(){

    }
}

EquipmentField.TYPE_MAIN_WEAPON = Symbol('main-weapon');
EquipmentField.TYPE_SUB_WEAPON = Symbol('sub-seapon');
EquipmentField.TYPE_BODY_ARMOR = Symbol('body-armor');
EquipmentField.TYPE_ADDITIONAL = Symbol('additional');
EquipmentField.TYPE_SPECIAL = Symbol('special');
EquipmentField.TYPE_AVATAR = Symbol('avatar');

class EquipmentFieldItem {
    constructor(parent, type){
        this._parent = parent;
        this.type = type;
    }
    value(){
        const eq = this.belongField.currentEquipment();
        switch (this.type){
            case EquipmentFieldItem.TYPE_STATS:
                this.value = []; break;
            case EquipmentFieldItem.TYPE_ATK:
                this.value = 0; break;
            case EquipmentFieldItem.TYPE_DEF:
                this.value = 0; break;
            case EquipmentFieldItem.TYPE_STABILITY:
                this.value = 60; break;
            case EquipmentFieldItem.TYPE_REFINING:
                this.value = 0;
        }
    }
    get belongField(){
        return this._parent;
    }
}

EquipmentFieldItem.TYPE_STATS = Symbol('stats');
EquipmentFieldItem.TYPE_ATK = Symbol('atk');
EquipmentFieldItem.TYPE_DEF = Symbol('def');
EquipmentFieldItem.TYPE_STABILITY = Symbol('stability');
EquipmentFieldItem.TYPE_REFINING = Symbol('refining');


class CharacterStatCategory {
    constructor(name){
        this.name = name;
        this.stats = [];
    }
    appendStat(...args){
        const t = new CharacterStat(this, ...args);
        this.stats.push(t);
        return t;
    }
}


class CharacterStat {
    constructor(cat, id, name, unit, link){
        this.category = cat;

        this.id = id;
        this.name = name;
        this.unit = unit;
        this.link = link;

        this.formula = null;
    }
    setFormula(str){
        this.formula = new CharacterStatFormula(str);
        return this.formula;
    }
}


class CharacterStatFormula {
    constructor(str){
        this.formula = str;
        this.extraValues = [];
    }
    appendExtraVaule(condition, value){
        this.extraValues.push({
            condition,
            value
        });
    }
    calc(vars){
        function handleCondition(o){
            const c = o.condition
                .replace(/\@([a-zA-Z0-9_.]+)/g, (m, m1) => {
                    return vars.condition['@'][m1] || 'true';
                })
                .replace(/\#([a-zA-Z0-9_.]+)/g, (m, m1) => {
                    
                    return vars.condition['#'][m1] || 'true';
                });
        }

        let defaultFormula = true;
        function handleFormula(f){
            f = f
                .replace(/\$([a-zA-Z0-9_.]+)/g, (m, m1) => {
                    const a = vars.formula['$'][m1];
                    return a ? a.calc(vars).toString() : '0';
                })
                .replace(/\@([a-zA-Z0-9_.]+)/g, (m, m1) => {
                    return vars.formula['@'][m1] || '0';
                })
                .replace(/\#([a-zA-Z0-9_.]+)/g, (m, m1) => {
                    if ( ['cvalue', 'mvalue', 'tvalue'].indexOf(m1) != -1 )
                        defaultFormula = false;
                    return vars.formula['#'][m1] || '0';
                });
            return safeEval(f);
        }
    }
}

export {Character, EquipmentField, EquipmentFieldItem};
