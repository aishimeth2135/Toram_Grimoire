import SkillElementsController from './SkillElementsController.js';
import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";

/*| @param arguments */
function checkConstructorArgs(){
	Array.from(arguments).forEach(function(arg, i){
		if ( arg === null || arg === undefined ){
			console.log(`argument[${i}] of Constructor is null`);
			console.log(arguments);
		}
	});
}

/*
Interface Parent {
	SkillElement newElement(const string type, Object constructorArgs);
}
Interface Child {
	int findLocation(void);
}
*/

// function SkillElement(){
// }

function SkillRoot(){
	this.skillTreeCategorys = [];
	this.controller = new SkillElementsController(this);
}
SkillRoot.TYPE = Symbol('SkillRoot');
SkillRoot.prototype = {
	TYPE: SkillRoot.TYPE,
	newElement(type, cArgs){
		if ( type == SkillTreeCategory.TYPE ){
			const {name, no} = cArgs;
			checkConstructorArgs(no, name);
			let stc = new SkillTreeCategory(this, no, name);
			this.skillTreeCategorys.push(stc);
			return stc;
		}
		return null;
	}
};

function SkillTreeCategory(sr, no, name){
	this.parent = sr;
	this.no = no;
	this.name = name;
	this.skillTrees = [];
}
SkillTreeCategory.TYPE = Symbol("SkillTreeCategory");
SkillTreeCategory.prototype = {
	TYPE: SkillTreeCategory.TYPE,
	newElement(type, cArgs){
		if ( type == SkillTree.TYPE ){
			const {name, no} = cArgs;
			checkConstructorArgs(no, name);
			let st = new SkillTree(this, no, name);
			this.skillTrees.push(st);
			return st;
		}
		return null;
	},
	findLocation(){
		return this.parent.skillTreeCategorys.indexOf(this);
	}
}

function SkillTree(stc, no, name){
	this.parent = stc;
	this.no = no;
	this.name = name;
	this.skills = [];
}
SkillTree.TYPE = Symbol("SkillTree");
SkillTree.prototype = {
	TYPE: SkillTree.TYPE,
	newElement(type, cArgs){
		if ( type == Skill.TYPE ){
			const {name, no} = cArgs;
			checkConstructorArgs(no, name);
			let skill = new Skill(this, no, name);
			this.skills.push(skill);
			return skill;
		}
		return null;
	},
	findLocation(){
		return this.parent.skillTrees.indexOf(this);
	}
};
SkillTree.CATEGORY_TABLE = Symbol();

function Skill(st, no, name){/* implements Parent, Child */
	this.parent = st;
	this.name = name;
	this.effects = [];
	this.defaultEffect = null;
	this.caption = "";
}
Skill.TYPE = Symbol("Skill");
Skill.prototype = {
	TYPE: Skill.TYPE,
	newElement(type, cArgs){
		if ( type == SkillEffect.TYPE ){
			const {mainWeapon, subWeapon, bodyArmor} = cArgs;
			checkConstructorArgs(mainWeapon, subWeapon, bodyArmor);
			let effect = new SkillEffect(this, mainWeapon, subWeapon, bodyArmor);
			this.effects.push(effect);
			return effect;
		}
		return null;
	},
	findLocation(){
		return this.parent.skills.indexOf(this);
	},
	setDefaultEffect(sef){
		this.defaultEffect = sef;
		return this;
	},
	checkData(){
		return this.defaultEffect !== void 0 && this.defaultEffect !== null;
	}
};
Skill.CATEGORY_MAIN = Symbol();
Skill.EQUIPMENT = Symbol();

function SkillEffect(sk, m, s, b){
	this.parent = sk;
	this.branchs = [];
	this.mainWeapon = m || '';
	this.subWeapon = s || '';
	this.bodyArmor = b || '';
	this.attributes = {};
}
SkillEffect.TYPE = Symbol("SkillEffect");
SkillEffect.prototype =  {/* implements Parent, Child */
	TYPE: SkillEffect.TYPE,
	newElement(type, cArgs){
		if ( type == SkillBranch.TYPE ){
			const no = cArgs.no;
			const name = cArgs.name;
			checkConstructorArgs(no, name);
			let branch = new SkillBranch(this, no, name);
			this.branchs.push(branch);
			return branch;
		}
		return null;
	},
	findLocation(){
		return this.parent.effects.indexOf(this);
	},
	appendAttribute(name, v){
		if ( v !== null )
			this.attributes[name] = v;
		return this;
	}
}
SkillEffect.MP_COST = Symbol('mp_cost');
SkillEffect.RANGE = Symbol('range');
SkillEffect.SKILL_TYPE = Symbol('skill_type');
SkillEffect.IN_COMBO = Symbol('in_combo');
SkillEffect.ACTION_TIME = Symbol('action_type');
SkillEffect.CASTING_TIME = Symbol('casting_time');

function SkillBranch(sef, no, name){/* implements Child */
	this.parent = sef;
	this.no = no;
	this.name = name;
	this.branchAttributes = {};
	this.stats = [];
}
SkillBranch.TYPE = Symbol("SkillBranch");
SkillBranch.prototype = {
	TYPE: SkillBranch.TYPE,
	appendBranchAttribute(name, v){
		this.branchAttributes[name] = v;
		return this;
	},
	findLocation(){
		return this.parent.branchs.indexOf(this);
	},
	appendStat(baseName, v, tail){
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
		return stat;
	}
}

export {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch};