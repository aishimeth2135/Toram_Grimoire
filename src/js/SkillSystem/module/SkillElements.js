import SkillElementsController from './SkillElementsController.js';
import Grimoire from "../../main/Grimoire.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";
import CY from "../../main/module/cyteria.js";

function checkConstructorArgs(){
	Array.from(arguments).forEach((arg, i) => {
		if ( arg === null || arg === undefined ){
			console.log(`argument[${i}] of Constructor is null`);
			console.log(arguments);
		}
	});
}

/*
Interface SkillElementParent {
	SkillElement newElement(const string type, Object constructorArgs);
}
Interface SkillElementChild {
	int findLocation(void);
}
*/

// class SkillElement {}



/**
 * @implements {SkillElementParent}
 */
class SkillRoot {
	constructor(){
		this.skillTreeCategorys = [];
		this.controller = new SkillElementsController(this);
		this.TYPE = SkillRoot.TYPE;
	}
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
	findSkillByName(name){
		let find = void 0;
		this.skillTreeCategorys.forEach(stc => {
			if ( find ) return;
			stc.skillTrees.forEach(st => {
				if ( find ) return;
				const t = st.skills.find(skill => skill.name === name);
				if ( t !== void 0 )
					find = t;
			});
		});
		return find;
	}
}
SkillRoot.TYPE = Symbol('SkillRoot');


/**
 * @implements {SkillElementParent}
 * @implements {SkillElementChild}
 */
class SkillTreeCategory {
	constructor(sr, no, name){
		this.parent = sr;
		this.no = no;
		this.name = name;
		this.skillTrees = [];
		this.TYPE = SkillTreeCategory.TYPE;
	}
	newElement(type, cArgs){
		if ( type == SkillTree.TYPE ){
			const {name, no} = cArgs;
			checkConstructorArgs(no, name);
			let st = new SkillTree(this, no, name);
			this.skillTrees.push(st);
			return st;
		}
		return null;
	}
	findLocation(){
		return this.parent.skillTreeCategorys.indexOf(this);
	}
}
SkillTreeCategory.TYPE = Symbol("SkillTreeCategory");


/**
 * @implements {SkillElementParent}
 * @implements {SkillElementChild}
 */
class SkillTree {
	constructor(stc, no, name){
		this.parent = stc;
		this.no = no;
		this.name = name;
		this.skills = [];
		this.TYPE = SkillTree.TYPE;
	}
	newElement(type, cArgs){
		if ( type == Skill.TYPE ){
			const {name, no} = cArgs;
			checkConstructorArgs(no, name);
			let skill = new Skill(this, no, name);
			this.skills.push(skill);
			return skill;
		}
		return null;
	}
	findLocation(){
		return this.parent.skillTrees.indexOf(this);
	}
}
SkillTree.TYPE = Symbol("SkillTree");
SkillTree.CATEGORY_TABLE = Symbol();
SkillTree.CATEGORY_EQUIPMENT = Symbol();


/**
 * @implements {SkillElementParent}
 * @implements {SkillElementChild}
 */
class Skill {
	constructor(st, no, name){
		this.parent = st;
		this.name = name;
		this.effects = [];
		this.defaultEffect = null;
		this.caption = "";
		this.TYPE = Skill.TYPE;
	}
	newElement(type, cArgs){
		if ( type == SkillEffect.TYPE ){
			const {mainWeapon, subWeapon, bodyArmor} = cArgs;
			checkConstructorArgs(mainWeapon, subWeapon, bodyArmor);
			let effect = new SkillEffect(this, mainWeapon, subWeapon, bodyArmor);
			this.effects.push(effect);
			return effect;
		}
		return null;
	}
	findLocation(){
		return this.parent.skills.indexOf(this);
	}
	setDefaultEffect(sef){
		this.defaultEffect = sef;
		return this;
	}
	checkData(){
		return this.defaultEffect !== void 0 && this.defaultEffect !== null;
	}
}
Skill.TYPE = Symbol("Skill");
Skill.CATEGORY_MAIN = Symbol();


/**
 * @implements {SkillElementParent}
 * @implements {SkillElementChild}
 */
class SkillEffect {
	constructor(sk, m, s, b){
		this.parent = sk;
		this.branchs = [];
		this.mainWeapon = m;
		this.subWeapon = s;
		this.bodyArmor = b;
		this.attributes = {};
		this.config = {
			equipmentConfirm: 0 // 0: or, 1: and
		};
		this.TYPE = SkillEffect.TYPE;
	}
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
	}
	findLocation(){
		return this.parent.effects.indexOf(this);
	}
	appendAttribute(name, v){
		if ( v !== null && v !== void 0 )
			this.attributes[name] = v;
		return this;
	}
	setConfig(set){
		Object.assign(this.config, set);
		return this;
	}
}
SkillEffect.TYPE = Symbol("SkillEffect");
SkillEffect.MP_COST = Symbol('mp_cost');
SkillEffect.RANGE = Symbol('range');
SkillEffect.SKILL_TYPE = Symbol('skill_type');
SkillEffect.IN_COMBO = Symbol('in_combo');
SkillEffect.ACTION_TIME = Symbol('action_type');
SkillEffect.CASTING_TIME = Symbol('casting_time');


/**
 * @implements {SkillElementChild}
 */
class SkillBranch {
	constructor(sef, no, name){
		this.parent = sef;
		this.no = no;
		this.name = name;
		this.branchAttributes = {};
		this.stats = [];
		this.TYPE = SkillBranch.TYPE;
	}
	appendBranchAttribute(name, v){
		this.branchAttributes[name] = v;
		return this;
	}
	findLocation(){
		return this.parent.branchs.indexOf(this);
	}
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
	isEmpty(){
		return CY.object.isEmpty(this.branchAttributes) && this.stats.length == 0;
	}
}
SkillBranch.TYPE = Symbol("SkillBranch");


export {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch};