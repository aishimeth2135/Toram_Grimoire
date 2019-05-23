import {SkillEffect} from "./SkillElements.js";

function InitSkillBranch(branch){
	const set_default = function(b, default_value){
		Object.keys(default_value).forEach((key) => {
			if ( b.branchAttributes[key] === void 0 )
				b.appendBranchAttribute(key, default_value[key])
		});
	};
	
	switch (branch.name){
		case 'damage':
			set_default(branch, {
				constant: '0', multiplier: '0', type: 'single', base: 'auto',
				frequency: '1', end_position: 'target',
				effective_area: 'circle', title: 'normal', judgment: 'common',
				damage_type: 'physical'
			});
			break;
		case 'stack': {
			set_default(branch, {
				min: '1', default: 'auto'
			});
		}	break;
		case 'effect': case 'hit':
			set_default(branch, {
				type: 'self', condition: 'auto'
			});
			break;
		case 'heal':
			set_default(branch, {
				target: 'self', frequency: '1', constant: '0'
			});
			break;
		case 'next':
			set_default(branch, {
				type: 'none', frequency: '1'
			});
			break;
		case 'poration':
			set_default(branch, {poration: 'auto'});
			break;
		case 'passive': case 'text': case 'tips': case 'list': case 'head': case 'extra':
		case 'reference':
		case '':
			//Do Nothing
			break;
		default:
			console.warn('Unknow Skill Branch Name.');
			console.log(branch);
			return;
	}
};

export default function(sr){
	sr.skillTreeCategorys.forEach(stc => {
		stc.skillTrees.forEach(st => {
			st.skills.forEach(skill => {
				const sef = skill.defaultEffect;
				if ( !sef )
					return;
				const have_1hsword = skill.effects.find(eft => eft.mainWeapon === 0);
				if ( have_1hsword !== void 0 ){
					const have_dualsword = skill.effects.find(eft => eft.mainWeapon === 9);
					if ( have_dualsword === void 0 )
						skill.newElement(SkillEffect.TYPE, {mainWeapon: 9, subWeapon: -1, bodyArmor: -1});
				}
				sef.branchs.forEach(branch => {
					InitSkillBranch(branch);
				});
			});
		});
	});
};