import Grimoire from "../../main/Grimoire.js";

function Equimpent(n, cat, bv, bstab, cap){
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
Equimpent.prototype = {
    setRecipe(){
        this.recipe = {};
        return this.recipe;
    },
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
    },
};

export {Equimpent};