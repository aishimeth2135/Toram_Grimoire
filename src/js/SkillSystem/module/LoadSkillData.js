import {SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import Grimoire from "../../main/Grimoire.js";

function LoadSkillData(sr, c){
	const 
	/* all */
		NO = 0,
		CONFIRM = 1,
	/* Skill */
		NAME = 1,
		DEFAULT_SET = 2,
		DEFAULT_SET_LIST = ['預設', '非預設', '預設/and', '非預設/and'],
		MAIN_WEAPON = 3,
		SUB_WEAPON = 4,
		BODY_ARMOR = 5,
		MAIN_WEAPON_LIST = ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍', '空手'],
		SUB_WEAPON_LIST = ['箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '無裝備'],
		BODY_ARMOR_LIST = ['輕量化', '重量化', '一般', '無裝備'],
		EFFECT_BRANCH_NO = 6,
		EFFECT_BRANCH_NAME = 7,
		EFFECT_BRANCH_ATTRIBUTE_NAME = 8,
		EFFECT_BRANCH_ATTRIBUTE_VALUE = 9,
		EFFECT_BRANCH_ATTRIBUTE_EXTRA = 10,
		MP_COST = 11,
		RANGE = 12,
		SKILL_TYPE = 13,
		IN_COMBO = 14,
		ACTION_TIME = 15,
		CASTING_TIME = 16,
		SKILL_TYPE_LIST = ['瞬發', '須詠唱', '須蓄力', '被動', 'EX技能'],
		IN_COMBO_LIST = ['可以放入連擊', '無法放入連擊', '不可放入連擊的第一招'],
		ACTION_TIME_LIST = ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快'],
	/* Skill Tree Category */
		CONFIRM_SKILL_TREE_CATEGORY = '0',
		SKILL_TREE_CATEGORY_NAME = 2,
	/* Skill Tree */
		CONFIRM_SKILL_TREE = '1',
		SKILL_TREE_NAME = 2
	
	let cur = null;

	const SKILL_ELEMENT_ORDER = [
		SkillTreeCategory.TYPE,
		SkillTree.TYPE,
		Skill.TYPE,
		SkillEffect.TYPE,
		SkillBranch.TYPE
	];

	function _TreeBack(se, se_type){
		if ( SKILL_ELEMENT_ORDER.indexOf(se.TYPE) <= SKILL_ELEMENT_ORDER.indexOf(se_type) )
			return se;
		while ( se.TYPE != se_type )
			se = se.parent;
		return se;
	}
	function _nullConfirm(v, null_v){
		if ( v === null_v )
			return null;
		return v;
	}
	function SetEffectDefault(sef, v, parent){
		switch (v){
			case 2:
			case 3:
				sef.setConfig({equipmentConfirm: 1});
				if ( v !== 2 ) break;
			case 0:
				parent.setDefaultEffect(sef);
		}
	}

	c.forEach(function(p, index){
		try {
			if ( index == 0 ) return;
			//console.log(p);
			const no = p[NO];
			if ( no != "" ){
				const confirm_name = p[CONFIRM];
				switch ( confirm_name ){
					case CONFIRM_SKILL_TREE_CATEGORY: {
						const name = p[SKILL_TREE_CATEGORY_NAME];
						cur = sr.newElement(SkillTreeCategory.TYPE, {no, name});
					} break;
					case CONFIRM_SKILL_TREE: {
						cur = _TreeBack(cur, SkillTreeCategory.TYPE);
						const name = p[SKILL_TREE_NAME];
						cur = cur.newElement(SkillTree.TYPE, {no, name});
					} break;
					default: {
						if ( confirm_name != "" ){
							cur = _TreeBack(cur, SkillTree.TYPE);
							const name = p[NAME];
							cur = cur.newElement(Skill.TYPE, {no, name});
						}
					}
					case '': {
						const mainWeapon = MAIN_WEAPON_LIST.indexOf(p[MAIN_WEAPON]),
							subWeapon = SUB_WEAPON_LIST.indexOf(p[SUB_WEAPON]),
							bodyArmor = BODY_ARMOR_LIST.indexOf(p[BODY_ARMOR]),
							default_set = DEFAULT_SET_LIST.indexOf(p[DEFAULT_SET]);
						if ( default_set === -1 )
							return;
						cur = _TreeBack(cur, Skill.TYPE);
						const sef = cur.newElement(SkillEffect.TYPE, {mainWeapon, subWeapon, bodyArmor});
						SetEffectDefault(sef, default_set, cur);

						cur = sef
							.appendAttribute(SkillEffect.MP_COST,		_nullConfirm(p[MP_COST], ''))
							.appendAttribute(SkillEffect.RANGE,			_nullConfirm(p[RANGE], ''))
							.appendAttribute(SkillEffect.SKILL_TYPE,	_nullConfirm(SKILL_TYPE_LIST.indexOf(p[SKILL_TYPE]), -1))
							.appendAttribute(SkillEffect.IN_COMBO,		_nullConfirm(IN_COMBO_LIST.indexOf(p[IN_COMBO]), -1))
							.appendAttribute(SkillEffect.ACTION_TIME,	_nullConfirm(ACTION_TIME_LIST.indexOf(p[ACTION_TIME]), -1))
							.appendAttribute(SkillEffect.CASTING_TIME,	_nullConfirm(p[CASTING_TIME], ''));
					}
				}
			}
			if ( SKILL_ELEMENT_ORDER.indexOf(cur.TYPE) < SKILL_ELEMENT_ORDER.indexOf(SkillEffect.TYPE) )
				return;
			const bno = p[EFFECT_BRANCH_NO];
			if ( bno != "" ){
				cur = _TreeBack(cur, SkillEffect.TYPE);
				const bname = p[EFFECT_BRANCH_NAME];
				cur = cur.newElement(SkillBranch.TYPE, {no: bno, name: bname});
			}
			const battrname = p[EFFECT_BRANCH_ATTRIBUTE_NAME],
				battrvalue = p[EFFECT_BRANCH_ATTRIBUTE_VALUE];
			if ( battrname != '' ){
				if ( !Grimoire.CharacterSystem.findStatBase(battrname) )
					cur.appendBranchAttribute(battrname, battrvalue);
				else
					cur.appendStat(battrname, battrvalue, p[EFFECT_BRANCH_ATTRIBUTE_EXTRA]);
			}
		}
		catch(e){
			console.warn('[Error] When Load Skill Data');
			//console.log(e);
			console.log(p);
		}
	});		
}


function LoadSkillMainData(sr, c){
	const CATEGORY = 0,
		NO = 1,
		PREVIOUS_SKILL = 2,
		DRAW_SKILL_TREE_ORDER = 3,
		CONFIRM_SKILL_TREE_CATEGORY = '0',
		CONFIRM_SKILL_TREE = '1',
		SKILL_TREE_DRAW_TREE_CODE = 3;

	let cur_stc, cur_st;

	c.forEach((p, i) => {
		if ( i == 0 || p[NO] === '' )
			return;
		try {
			const cat = p[CATEGORY], no = p[NO];
			switch (cat){
				case CONFIRM_SKILL_TREE_CATEGORY:
					cur_stc = sr.skillTreeCategorys.find(a => a.no == no);
					break;
				case CONFIRM_SKILL_TREE:
					cur_st = cur_stc.skillTrees.find(a => a.no == no);
					cur_st.init(p[SKILL_TREE_DRAW_TREE_CODE]);
					break;
				case '': 
					cur_st.skills.find(a => a.no == no).init(
						p[PREVIOUS_SKILL],
						parseInt(p[DRAW_SKILL_TREE_ORDER])
					);
			}
		}
		catch(e){
			console.warn('[Error] When Load Skill Main Data');
			console.log(e);
			console.log(p);
		}
	});
}


export {LoadSkillData, LoadSkillMainData};