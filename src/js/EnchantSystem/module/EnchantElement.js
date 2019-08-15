import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";


const Status = {};


function InitEnchantElementStatus(set){
    set = Object.assign({
        Character: {
            level: 190,
            tec: 255    
        },
        ItemPotentialLimit: 70,
        EquipmentItemMaximumNumber: 6,
        EquipmentBasePotentialMiniMum: 15
    }, set);
    Object.assign(Status, set);
}
function EnchantElementStatus(name, value){
    try {
        const l = name.split('/');
        let cur = Status;
        let res;
        l.forEach((p, i) => {
            if ( i == l.length - 1 ){
                if ( cur[p] === void 0 )
                    throw new new Error('invalid key');
                if ( value !== void 0 )
                    cur[p] = value;
                res = cur[p];
            }
            cur = cur[p];
        });
        return res;
    }
    catch(e){
        console.warn('Unknow Status name: ' + name);
    }
}

export {InitEnchantElementStatus, EnchantElementStatus};


class EnchantCategory {
    constructor(title){
        this.title = title;
        this.items = [];
    }
    appendItem(){
        const t = new EnchantItemBase(this, ...arguments);
        this.items.push(t);
        return t;
    }
}


class EnchantItemBase {
    constructor(cat, baseName, cl, ml, cuv, muv, mt, cm, mm){
        this.category = cat;
        this.statBase = Grimoire.CharacterSystem.findStatBase(baseName);
        this.conditionalAttributes = [];
        this.limit = {
            [StatBase.TYPE_CONSTANT]: cl,
            [StatBase.TYPE_MULTIPLIER]: ml
        };
        this.unitValue = {
            [StatBase.TYPE_CONSTANT]: cuv || 1,
            [StatBase.TYPE_MULTIPLIER]: muv || 1
        };
        this.materialPointType = mt;
        this.materialPointValue = {
            [StatBase.TYPE_CONSTANT]: cm,
            [StatBase.TYPE_MULTIPLIER]: mm
        };
    }
    initAttributes(){
        this.attributes = new EnchantItemBaseAttributes(...arguments);
        return this;
    }
    appendConditionalAttributes(cond, ...constructor_args){
        const t = {
            condition: cond,
            attributes: new EnchantItemBaseAttributes(...constructor_args)
        };
        this.conditionalAttributes.push(t);
    }
    realAttributes(status){
        const eligible = this.conditionalAttributes.find(p => {
            switch ( p.condition ){
                case EnchantItemBase.CONDITION_MAIN_WEAPON:
                    return status.fieldType === 0;
                case EnchantItemBase.CONDITION_BODY_ARMOR:
                    return status.fieldType === 1;
                case EnchantItemBase.CONDITION_ORIGINAL_ELEMENT:
                    return status.isOriginalElement;
            }
        });
        return eligible
            ? eligible.attributes
            : this.attributes;
    } 
    getPotential(type, status){
        const attr = this.realAttributes(status);
        return attr.potential[type];
    }
    basePotential(type){
        return this.attributes.potential[type];
    }
    getLimit(type){
        const t = this.limit[type];
        const l = Math.min(
            Math.floor(Status.ItemPotentialLimit/this.basePotential(type)),
            Math.floor(Status.Character.level/10)
        );
        return t === '' ? [l, -1*l] : t;
    }
    getUnitValue(type){
        return this.unitValue[type];
    }
    getMaterialPointType(){
        return this.materialPointType;
    }
    getMaterialPointValue(type){
        const t = this.materialPointValue[type];
        if ( t === '' ){
            return {
                '1': 5,
                '3': 16.5,
                '5': 25,
                '6': 33.5,
                '10': 50,
                '20': 100
            }[this.basePotential(type).toString()];
        }
        return parseFloat(t);
    }
}

EnchantItemBase.CONDITION_MAIN_WEAPON = Symbol('Main Weapon');
EnchantItemBase.CONDITION_BODY_ARMOR = Symbol('Body Armor');
EnchantItemBase.CONDITION_ORIGINAL_ELEMENT = Symbol('Original Element');


class EnchantItemBaseAttributes {
    constructor(cp, mp){
        this.potential = {
            [StatBase.TYPE_CONSTANT]: cp,
            [StatBase.TYPE_MULTIPLIER]: mp
        };
    }
}


class EnchantEquipment {
    constructor(){
        this.steps = [];
        this.status = {
            basePotential: Status.EquipmentBasePotentialMiniMum,
            originalPotential: 1,
            fieldType: 0, // 0: Main Weapon, 1: Body Armor
            isOriginalElement: false
        };
    }
    setStatus(name, v){
        this.status[name] = v;
    }
    originalPotential(v){
        if ( v !== void 0 ){
            if ( v < 1 || typeof v != 'number' )
                v = 1;
            this.status.originalPotential = v;
        }
        return this.status.originalPotential;
    }
    addOriginalPotential(v){
        this.originalPotential(this.originalPotential() + v);
    }
    basePotential(v){
        if ( v !== void 0 ){
            if ( v < Status.EquipmentBasePotentialMiniMum || typeof v != 'number' )
                v = Status.EquipmentBasePotentialMiniMum;
            this.status.basePotential = v;
        }
        return this.status.basePotential;
    }
    addBasePotential(v){
        return this.basePotential(this.basePotential() + v);
    }
    currentPotential(step_index){
        step_index = this.checkStepIndex(step_index);
        let res = this.originalPotential();
        this.steps.slice(0, step_index).forEach(p => res -= p.getPotentialCost());
        return res;
    }
    checkStepIndex(i){
        const l = this.steps.length;
        if ( i === void 0 )
            i = l;
        if ( i < 0 )
            i = l + i;
        if ( i < 0 )
            i = 0;
        return i;
    }
    appendStep(){
        const step = new EnchantStep(this);
        this.steps.push(step);
        return step;
    }
    step(i){
        return this.steps[i];
    }
    stat(itemBase, type, step_index){
        step_index = this.checkStepIndex(step_index);
        let v = 0;
        this.steps.slice(0, step_index).forEach(p => {
            const t = p.stat(itemBase, type);
            if ( t && t.valid() )
                v += t.statValue();
        });
        return new EnchantStat(itemBase, type, v);
    }
    currentStats(step_index){
        step_index = this.checkStepIndex(step_index);
        const stats = [];
        function find(t){
            return stats.find(a => a.baseName() == t.baseName() && a.statType() == t.statType());
        }
        this.steps.slice(0, step_index).forEach(p => {
            p.stepStats.forEach(a => {
                if ( !a.valid() )
                    return;
                const t = find(a);
                if ( t )
                    t.statValue(t.statValue() + a.statValue());
                else {
                    stats.push(new EnchantStat(a.itemBase, a.statType(), a.statValue()));
                }
            });
        });
        return stats;
    }
    currentStatsNumber(step_index){
        step_index = this.checkStepIndex(step_index);
        const stats = [];
        function find(t){
            return stats.find(a => a.baseName() == t.baseName() && a.statType() == t.statType());
        }
        this.steps.slice(0, step_index).forEach(p => {
            p.stepStats.forEach(a => {
                if ( !a.valid() )
                    return;
                const t = find(a);
                if ( !t )
                    stats.push(new EnchantStat(a.itemBase, a.statType(), 0));
            });
        });
        return stats.length;
    }
    checkStats(){
        return this.checkStatsNumber();
    }
    checkStatsNumber(step_index){
        return this.currentStatsNumber(step_index) < Status.EquipmentItemMaximumNumber;
    }
    checkCurrentPotential(){
        return this.currentPotential() > 0;
    }
    checkStepsPotentialCost(){
        let res = this.originalPotential();
        return !this.steps.slice(0, -1).find(p => {
            res -= p.getPotentialCost();
            return res < 1;
        });
    }
    getPotentialAdditionalRate(step_index){
        const stats = this.currentStats(step_index);
        const t = [];
        stats.forEach(p => {
            const cat = p.itemBase.category;
            const check = t.find(a => a.category == cat);
            if ( check )
                ++check.cnt;
            else {
                t.push({category: cat, cnt: 1});
            }
        });
        const res = t.reduce((a, b) => a + (b.cnt > 1 ? b.cnt*b.cnt : 0), 20);
        return res/20;
    }
    successRate(){
        const pot = this.currentPotential();
        const d = Math.max(this.currentPotential(-1), this.basePotential());
        if ( !this.checkStats() || !this.checkCurrentPotential() )
            return Math.max(130 + pot*230/d, 0);
        return -1;
    }
    refreshStats(){
        this.currentStats().forEach(p => {
            const [max, min] = p.itemBase.getLimit(p.statType());
            const v = p.statValue();
            if ( v > max || v < min ){
                const dif = v > max ? v - max : v - min;
                this.steps.slice().reverse().find(a => {
                    const t = a.stat(p.itemBase, p.statType());
                    if ( t ){
                        t.addStatValue(-1*dif);
                        return true;
                    }
                    return false;
                });
            }
        })
    }
    swapStep(i1, i2){
        if ( i1 < 0 || i2 < 0 || i1 >= this.steps.length || i2 >= this.steps.length )
            return false;
        const t = this.steps[i1];
        this.steps[i1] = this.steps[i2];
        this.steps[i2] = t;
        return true;
    }
    getAllMaterialPointCost(){
        const mats = Array(6).fill(0);
        this.steps.forEach(p => p.stepStats.forEach(a => {
            const t = a.getMaterialPointCost();
            mats[t.type] += t.value;
        }));
        return mats;
    }
}


class EnchantStep {
    constructor(parent){
        this.parent = parent;
        this.stepStats = [];
        this.type = EnchantStep.TYPE_NORMAL;
        this.step = 1;
    }
    appendStat(){
        if ( !this.parent.checkStats() )
            return false;
        const stat = new EnchantStepStat(this, ...arguments);
        this.stepStats.push(stat);
        return stat;
    }
    setType(type){
        this.type = type;
    }
    addStepValue(v){
        let t = this.stepValue() + v;
        if ( t == 0 )
            t = v > 0 ? t + 1 : t - 1;
        return this.stepValue(t);
    }
    stepValue(v){
        if ( v !== void 0 )
            this.step = v;
        return this.step;
    }
    getPotentialCost(){
        if ( this.stepStats.length == 0 )
            return 0;
        switch (this.type){
            case EnchantStep.TYPE_NORMAL:
                return this.potentialCostToInteger(this.stepStats.reduce((a, b) => a + b.getPotentialCost(), 0));
            case EnchantStep.TYPE_EACH:
                return this.stepStats[0].getPotentialCost();
        }
    }
    potentialCostToInteger(p){
        return p > 0 ? Math.floor(p) : Math.ceil(p);
    }
    index(){
        return this.parent.steps.indexOf(this);
    }
    stat(itemBase, type){
        let t = typeof itemBase == 'string' // by statBase.baseName
            ? this.stepStats.find(p => p.baseName() == itemBase && p.stat.type == type)
            : this.stepStats.find(p => p.itemBase == itemBase && p.stat.type == type);
        return t;
    }
    remove(){
        const i = this.index();
        this.parent.steps.splice(i, 1);
        this.stepStats.forEach(p => p.remove());
    }
}
EnchantStep.TYPE_NORMAL = Symbol('normal');
EnchantStep.TYPE_EACH = Symbol('each');

class EnchantStat {
    constructor(itemBase, type, v){        
        this.itemBase = itemBase;
        this.stat = itemBase.statBase.createSimpleStat(type, v);
    }
    baseName(){
        return this.stat.baseName();
    }
    show(v){
        const sv = this.itemBase.getUnitValue(this.statType());
        return sv == 1 ? (v == void 0 ? this.stat.show() : this.stat.show({}, v)) : this.stat.show({}, v == void 0 ? this.stat.statValue()*sv : v*sv);
    }
    statType(){
        return this.stat.type;
    }
    statValue(v){
        return this.stat.statValue(v);
    }
    addStatValue(v){
        return this.stat.addStatValue(v);
    }
}

class EnchantStepStat extends EnchantStat {
    constructor(parent, itemBase, type, v){
        super(itemBase, type, v);
        this.parent = parent;
        this.set(v);
    }
    set(v){
        const eqstat = this.belongEquipment().stat(this.itemBase, this.stat.type);
        const [max, min] = this.itemBase.getLimit(this.stat.type);
        const ov = eqstat.stat.addStatValue(-1*this.stat.statValue());
        if ( ov + v > max )
            v = max - ov;
        if ( ov + v < min )
            v = min - ov;
        
        this.statValue(v);
    }
    add(v){
        this.set(this.stat.statValue() + v);
    }
    /**
     * Get the sum of potential cost of this EnchantStat
     * @return {Float}
     */
    getPotentialCost(){
        if ( this.parent.type == EnchantStep.TYPE_NORMAL )
            return this.calcPotentialCost(this.stat.value);
        else {
            let sv = this.parent.stepValue() || 1;
            const v = this.stat.value;
            let res = 0, cur = 0;
            while ( cur != v ){
                if ( (sv > 0 && cur + sv > v) || (sv < 0 && cur + sv < v) )
                    sv = v - cur;
                cur += sv;
                res += this.parent.potentialCostToInteger(this.calcPotentialCost(sv));
            }
            return res;
        }
    }
    belongEquipment(){
        return this.parent.parent;
    }
    /**
     * Calculate potential cost of input value with a Formula.
     * @param  {Integer} v                   value
     * @param  {Integer} num                 numble of same category
     * @return {Integet}                     
     */
    calcPotentialCost(v){
        const r = this.belongEquipment().getPotentialAdditionalRate(this.parent.index() + 1);
        const p = this.itemBase.getPotential(this.stat.type, this.belongEquipment().status);
        return v > 0 ? v*p*r : v*Math.floor(5 + Status.Character.tec/10)*p*r/100;
    }
    remove(){
        const index = this.parent.stepStats.indexOf(this);
        this.parent.stepStats.splice(index, 1);
        this.belongEquipment().refreshStats();
    }
    index(){
        return this.parent.stepStats.indexOf(this);
    }
    valid(){
        return !(this.parent.type == EnchantStep.TYPE_EACH && this.index() != 0);
    }
    /**
     * 取得此項能力，之前所有步驟的加總。
     * @return {[type]} [description]
     */
    getPreviousStepStatValue(){
        return this.belongEquipment().stat(this.itemBase, this.statType(), this.parent.index()).statValue();
    }
    showCurrent(){
        return this.show(this.getPreviousStepStatValue() + this.statValue());
    }
    getMaterialPointCost(){
        const from = this.getPreviousStepStatValue(),
            to = from + this.statValue();
        return {
            type: this.itemBase.getMaterialPointType(),
            value: this.calcMaterialPointCost(from, to)
        };
    }
    calcMaterialPointCost(from, to){
        from = Math.abs(from);
        to = Math.abs(to);
        if ( from > to ){
            const t = from;
            from = to;
            to = t;
        }
        const t = this.itemBase.getMaterialPointValue(this.statType());
        return Array(to - from).fill().map((p, i) => i + from + 1).reduce((a, b) => a + Math.floor(b*b*t), 0);
    }
}

export {EnchantCategory, EnchantStep, EnchantItemBase, EnchantEquipment};