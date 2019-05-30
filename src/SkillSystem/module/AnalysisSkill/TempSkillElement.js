import CY from "../../../main/module/cyteria.js";
import {SkillBranch} from "../SkillElements.js";

function TempSkillEffect(){
    this.branchs = [];
    this.attributes = {};
}
TempSkillEffect.prototype = {
    from(sef){
        Object.getOwnPropertySymbols(sef.attributes).forEach(key => {
            this.appendAttribute(key, sef.attributes[key]);
        });
        sef.branchs.forEach(branch => {
            this.newBranch().from(branch);
        });
        return this;
    },
    newBranch(){
        const t = new TempSkillBranch(this);
        this.branchs.push(t);
        return t;
    },
    overWrite: function(sef){
        Object.getOwnPropertySymbols(sef.attributes).forEach(key => {
            const v = sef.attributes[key];
            if ( v == '' && this.attributes[key] ){
                delete this.attributes[key];
                return;
            }
            this.appendAttribute(key, v);
        });
        // 如果 branch.no 一樣才執行覆蓋
        sef.branchs.forEach((branch, i) => {
            const loc = this.branchs.findIndex(b => b.no !== '-' && b.no == branch.no);
            loc == -1 ? this.newBranch().from(branch) : this.branchs[loc].overWrite(branch);
        });
    },
    appendAttribute(name, v){
        this.attributes[name] = v;
        return this;
    },
    checkData(){
        return this.branchs.length != 0;
    }
}

function TempSkillBranch(tsef){
    this.parent = tsef;
    this.branchAttributes = {};
    this.stats = [];
    this.finish = false;
}
TempSkillBranch.prototype = {
    from(branch){
        this.no = branch.no;
        this.name = branch.name;
        this.branchAttributes = {};
        Object.keys(branch.branchAttributes).forEach(key => {
            this.appendBranchAttribute(key, branch.branchAttributes[key]);
        });
        branch.stats.forEach(a => {
            this.appendStat(a.base.baseName, a.value, '').type = a.type;
        });
        return this;
    },
    appendBranchAttribute(name, v){
        return SkillBranch.prototype.appendBranchAttribute.call(this, ...arguments);
    },
    findLocation(){
        return SkillBranch.prototype.findLocation.call(this);
    },
    appendStat(baseName, v, tail){
        return SkillBranch.prototype.appendStat.call(this, ...arguments);
    },
    overWrite: function(branch){
        // 如果 branch.no 一樣但 branch.name 為空值且 brahch.branchAttributes 為空。去除此 branch。
        if ( branch.name === '' &&  CY.object.isEmpty(branch.branchAttributes) ){
            const b = this.parent.branchs;
            b.splice(b.indexOf(this), 1);
            return;
        }
        // 如果 branch.no 一樣但 branch.name 不一樣，先清空所有屬性。branch.name 為空值時，默認兩者同名。
        if ( branch.name !== '' && this.name != branch.name ){
            this.name = branch.name;
            CY.object.empty(this.branchAttributes);
        }
        Object.keys(branch.branchAttributes).forEach((key, i) => {
            const v = branch.branchAttributes[key];
            if ( v == '' && this.branchAttributes[key] ){
                delete this.branchAttributes[key];
                return;
            }
            this.appendBranchAttribute(key, v);
        });
        branch.stats.forEach(a => {
            let t = this.stats.find(b => a.base === b.base && a.type === b.type);
            if ( t === void 0 )
                this.appendStat(a.base.baseName, a.value, '').type = a.type;
            else {
                if ( a.value == '' )
                    this.stats.splice(this.stats.indexOf(t), 1);
                else
                    t.statValue(a.value);
            }
        });
    }
};

export {TempSkillEffect, TempSkillBranch};