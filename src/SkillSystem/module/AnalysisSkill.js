import {Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import Grimoire from "../../main/Grimoire.js";
import {toLangText, ConvertLangText} from "../../main/module/LangText.js";
import cy from "../../main/module/cyteria.js";
import strings from "./strings.js";

"use strict";

const GLOBAL_EXTRA_ATTRIBUTE_VALUE = {
	none: '@none'
};

function getStackBranchIdKey(stk){
	return 'id' + stk.branchAttributes['id'];
}	

function TempSkillEffect(){
	this.branchs = [];
	this.attributes = {};
}
TempSkillEffect.prototype = {
	from(sef){
		Object.getOwnPropertySymbols(sef.attributes).forEach(function(key){
			this.appendAttribute(key, sef.attributes[key]);
		}, this);
		sef.branchs.forEach(function(branch){
			this.newBranch().from(branch);
		}, this);
		return this;
	},
	newBranch(){
		const t = new TempSkillBranch(this);
		this.branchs.push(t);
		return t;
	},
	overWrite: function(sef){
		/* 特殊屬性
		| @none: 無條件去除該屬性。*/
		Object.getOwnPropertySymbols(sef.attributes).forEach(function(key){
			const v = sef.attributes[key];
			if ( v == GLOBAL_EXTRA_ATTRIBUTE_VALUE.none && this.attributes[key] ){
				delete this.attributes[key];
				return;
			}
			this.appendAttribute(key, v);
		}, this);
		// 如果 branch.no 一樣才執行覆蓋
		let branchs_no = sef.branchs.map(a => a.no);
		sef.branchs.forEach(function(branch, i){
			const loc = this.branchs.findIndex(b => b.no == branch.no);
			loc == -1 ? this.newBranch().from(branch) : this.branchs[loc].overWrite(branch);
		}, this);
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
	from: function(branch){
		this.no = branch.no;
		this.name = branch.name;
		this.branchAttributes = {};
		Object.keys(branch.branchAttributes).forEach(function(key){
			this.appendBranchAttribute(key, branch.branchAttributes[key]);
		}, this);
		branch.stats.forEach(function(a){
			this.appendStat(a.base.baseName, a.value, '').type = a.type;
		}, this);
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
		// 如果 branch.no 一樣但 branch.name 為空值。去除此 branch。
		if ( branch.name == '' ){
			const b = this.parent.branchs;
			b.splice(b.indexOf(this), 1);
			return;
		}
		// 如果 branch.no 一樣但 branch.name 不一樣，先清空所有屬性。
		if ( this.name != branch.name ){
			this.name = branch.name;
			cy.object.empty(this.branchAttributes);
		}
		Object.keys(branch.branchAttributes).forEach(function(key, i){
			const v = branch.branchAttributes[key];
			if ( v == GLOBAL_EXTRA_ATTRIBUTE_VALUE.none && this.branchAttributes[key] ){
				delete this.branchAttributes[key];
				return;
			}
			this.appendBranchAttribute(key, v);
		}, this);
		branch.stats.forEach(function(a){
			let t = this.stats.find(b => a.base === b.base && a.type === b.type);
			t === void 0 ? this.appendStat(a.base.baseName, a.value, '').type = a.type : t.statValue(a.value);
		}, this);
	}
};

const GLOBAL_ICON_DATA = {
	Sword: '',
	Staff: ''
};

const
	MAIN_WEAPON_TEXT_LIST = ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍'],
	SUB_WEAPON_TEXT_LIST = ['箭矢', '盾牌', '小刀', '魔導具', '套', '拔刀劍'],
	BODY_ARMOR_TEXT_LIST = ['輕量化', '重量化', '一般'];

function getEffectHTML(sef, attr_name, data){
	const safeEval = str => {
		try {
			return eval(str);
		}
		catch(e){
			console.warn(e);
			return '?';
		}
	};
	const ICON_DATA = {
		[SkillEffect.MP_COST]: '',
		[SkillEffect.RANGE]: '',
		[SkillEffect.SKILL_TYPE]: ['', '', '', ''], 
		[SkillEffect.DAMAGE_TYPE]: ['', ''],
		[SkillEffect.PORATION_TYPE]: ['', ''],
		[SkillEffect.IN_COMBO]: ['', '', ''],
		[SkillEffect.ACTION_TIME]: ['', '', '', '', '', '', ''],
		[SkillEffect.CASTING_TIME]: ''
	};
	const TITLE_DATA = {
		[SkillEffect.MP_COST]: 'MP消耗',
		[SkillEffect.RANGE]: '射程',
		[SkillEffect.SKILL_TYPE]: '類型', 
		[SkillEffect.DAMAGE_TYPE]: '傷害類型',
		[SkillEffect.PORATION_TYPE]: '慣性類型',
		[SkillEffect.IN_COMBO]: '連擊',
		[SkillEffect.ACTION_TIME]: '動作時間',
		[SkillEffect.CASTING_TIME]: ['', '詠唱時間', '蓄力時間']
	};
	const TEXT_LIST = {
		[SkillEffect.SKILL_TYPE]: ['瞬發', '須詠唱', '須蓄力', '被動'],
		[SkillEffect.DAMAGE_TYPE]: ['物理', '魔法'],
		[SkillEffect.PORATION_TYPE]: ['物理', '魔法', '普通攻擊'],
		[SkillEffect.IN_COMBO]: ['可以放入連擊', '無法放入連擊', '不可放入連擊的第一招'],
		[SkillEffect.ACTION_TIME]: ['極慢', '慢', '稍慢', '一般', '稍快', '快', '極快']
	};

	const {SLv, CLv} = data;

	let title = TITLE_DATA[attr_name],
		v = sef.attributes[attr_name],
		tail = null;
	const icon = !Array.isArray(ICON_DATA[attr_name]) ? ICON_DATA[attr_name] : ICON_DATA[attr_name][v];
	switch (attr_name){
		case SkillEffect.CASTING_TIME:
			title = TITLE_DATA[attr_name][sef.attributes[SkillEffect.SKILL_TYPE]];
		case SkillEffect.MP_COST:
			v = safeEval(v);
			break;
		case SkillEffect.RANGE:
			v = v != '-' ? safeEval(v) + 'm' : toLangText('無限制');
			break;
		case SkillEffect.SKILL_TYPE:
		case SkillEffect.IN_COMBO:
		case SkillEffect.ACTION_TIME:
			v = toLangText(TEXT_LIST[attr_name][v]);
			break;
	}

	const he = document.createElement('div');
	he.className = 'skill_attribute';
	let res = `<span class="_icon">${icon}</span><span class="_title">${toLangText(title)}</span><span class="_value">${v}</span>`;
	if ( tail !== null )
		res += `<span class="_tail">${tail}</span>`;
	he.innerHTML = res;
	return he;
}


const
	SUFFIX_LIST = ['extra', 'poration'],
	EXTRA_FIX_LIST = ['stack'];

function getBranchHTML(branch, data){
	if ( branch.finish )
		return null;
	function safeEval(str, dftv){
		try {
			return eval(str);
		}
		catch(e){
			console.warn(e);
			return dftv === void 0 ? '?' : dftv;
		}
	}
	function replaceExtraFromulaValue(str){
		const FORMULA_EXTRA_VALUE_LIST = {
			'STR': '角色STR',
			'DEX': '角色DEX',
			'INT': '角色INT',
			'AGI': '角色AGI',
			'VIT': '角色VIT',
			'BSTR': '角色基礎STR',
			'BDEX': '角色基礎DEX',
			'BINT': '角色基礎INT',
			'BAGI': '角色基礎AGI',
			'BVIT': '角色基礎VIT',
			'shield_refining': '盾精煉值',
			'dagger_atk': '小刀ATK'
		};
		Object.keys(FORMULA_EXTRA_VALUE_LIST).forEach(key => {
			str = str.replace(new RegExp(key, 'g'), FORMULA_EXTRA_VALUE_LIST[key]);
		});
		str = str.replace(new RegExp('*', 'g'), '×');
		return str;
	}
	function processText(b, _main){
		const _attr = b.branchAttributes;
		let str = safeEval("`" + _attr[_main === void 0 ? 'text': _main] + "`");
		if ( _attr['mark'] !== void 0 ){
			_attr['mark'].split(/\s*,\s*/).forEach(t => {
				str = str.replace(new RegExp(t, 'g'), lightText(t));
			});
		}
		if ( _attr['branch'] !== void 0 ){
			_attr['branch'].split(/\s*,\s*/).forEach(t => {
				str = str.replace(new RegExp(t, 'g'), lightText(t));
			});
		}
		if ( _attr['skill'] !== void 0 ){
			_attr['skill'].split(/\s*,\s*/).forEach(t => {
				str = str.replace(new RegExp(t, 'g'), lightText(t));
			});
		}
		return toLangText(str);
	}
	function processValue(v, setting){
		setting = Object.assign({
			calc: true, tail: ''
		}, setting);
		const span = document.createElement('span');
		span.innerHTML = (setting.calc ? safeEval(v) : v) + setting.tail;
		if ( v.includes('stack') )
			span.classList.add('effect_by_stack');
		return span.outerHTML;
	}
	function simpleCreateHTML(type, classList, html){
		const t = document.createElement(type);
		if ( t !== null ){
			Array.isArray(classList) ? t.classList.add(...classList): t.classList.add(classList);
		}
		if ( html !== void 0 && html !== null )
			t.innerHTML = html;
		return t;
	}
	function createSkillAttributeScope(icon, t, v, tail){
		const a = simpleCreateHTML('div', 'skill_attribute');
		if ( icon !== null )
			a.appendChild(simpleCreateHTML('span', '_icon', icon));
		if ( t !== null )
			a.appendChild(simpleCreateHTML('span', '_title', t));
		if ( v !== null && v !== void 0 )
			a.appendChild(simpleCreateHTML('span', '_value', v));
		if ( tail !== null && tail !== void 0 )
			a.appendChild(simpleCreateHTML('span', '_tail', tail));
		return a;
	}
	function lightText(text){
		return '<span class="light">' + text + '</span>';
	}
	function darkText(text){
		return '<span class="dark">' + text + '</span>';
	}
	function markText(text){
		return lightText(text);
	}
	function getPorationHTML(poration_branch){
		const _attr = poration_branch.branchAttributes;
		const dict1 = {
			physical: '物理', magic: '魔法',
			normal_attack: '一般攻擊', none: '不受慣性影響'
		};
		const dict2 = Object.assign({}, dict1, {
			auto: dict1[_attr['damage']],
			none: '不影響慣性'
		});
		let one = createSkillAttributeScope(null, toLangText('傷害慣性'), toLangText(dict1[_attr['damage']]));
		let two = createSkillAttributeScope(null, toLangText('造成慣性'), toLangText(dict2[_attr['poration']]));

		return {one, two};
	}
	function getDamageElementHTML(ele_type){
		const ELEMEMT_DICT = {
			neutral: 'Neutral|,|無屬性',
			fire: 'Fire|,|火屬性',
			water: 'Water|,|水屬性',
			earth: 'Earth|,|地屬性',
			wind: 'Wind|,|風屬性',
			light: 'Light|,|光屬性',
			dark: 'Dark|,|暗屬性',
			arrow: '套用箭矢屬性'
		};
		const t = simpleCreateHTML('div', 'skill_attribute');
		if ( ele_type != 'arrow' )
			t.appendChild(simpleCreateHTML('span', ['_icon', 'element_' + ele_type, 'element_ball']));
		t.appendChild(simpleCreateHTML('span', ['_value', 'element_value'], toLangText(ELEMEMT_DICT[ele_type])));
		return t;
	}

	const {SLv, CLv} = data;

	const btype = branch.name;
	const suffix = [];

	let attr = branch.branchAttributes;

	let p = branch.findLocation() + 1;
	let c = branch.parent.branchs[p];
	while ( c !== void 0 && SUFFIX_LIST.indexOf(c.name) != -1 ){
		suffix.push(c);
		c = branch.parent.branchs[++p];
	}

	const extra_fix = branch.parent.branchs.filter(b => EXTRA_FIX_LIST.indexOf(b.name) != -1);

	const stack_value_list = extra_fix
		.filter(b => b.name == 'stack' && (attr['stack_id'] || '').split(',').indexOf(b.branchAttributes['id']) != -1 )
		.map(stk => safeEval(data.stackValues[getStackBranchIdKey(stk)]));
	const stack = stack_value_list.length > 1 ? stack_value_list : stack_value_list[0];

	switch (btype){
		case 'stack': {
			const left = simpleCreateHTML('span', 'left', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>');
			const right = simpleCreateHTML('span', 'right', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>');
			const mid = simpleCreateHTML('input', 'mid');

			mid.value = data.stackValues[getStackBranchIdKey(branch)];

			const stk = branch;
			left.addEventListener('click', function(event){
				const min = parseInt(stk.branchAttributes['min'], 10);
				const v = parseInt(mid.value, 10);
				if ( v == min )
					return;
				mid.value = v - 1;
				mid.dispatchEvent(new Event('change'));
			});
			right.addEventListener('click', function(event){
				const max = parseInt(stk.branchAttributes['max'], 10);
				const v = parseInt(mid.value, 10);
				if ( v == max )
					return;
				mid.value = v + 1;
				mid.dispatchEvent(new Event('change'));
			});
			mid.addEventListener('change', function(event){
				const max = parseInt(stk.branchAttributes['max'], 10);
				const min = parseInt(stk.branchAttributes['min'], 10);
				const id = stk.branchAttributes['min'];
				let v = parseInt(this.value, 10);
				if ( v > max )
					v = max;
				else if ( v < min )
					v = min;
				this.value = v;
				data.stackValues[getStackBranchIdKey(stk)] = v;
				Grimoire.SkillSystem.skillRoot.controller.updateSkillHTML();
			});
			mid.addEventListener('focus', function(event){
				this.select();
			})

			const scope1 = simpleCreateHTML('div', 'scope1');
			if ( attr['name'] !== void 0 ){
				scope1.appendChild(simpleCreateHTML('span', '_main_title', toLangText(attr['name'])));
			}
			scope1.appendChild(createSkillAttributeScope(null, toLangText('Min|,|最小值'), processValue(attr['min'])));
			if ( attr['max'] !== void 0 )
				scope1.appendChild(createSkillAttributeScope(null, toLangText('Max|,|最大值'), processValue(attr['max'])));

			const main = simpleCreateHTML('div', 'scope2');
			main.appendChild(left);
			main.appendChild(mid);
			main.appendChild(right);

			const content = simpleCreateHTML('div', ['content', 'content_line']);
			content.appendChild(scope1);
			content.appendChild(main);

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			he.appendChild(content);
			return he;
		}
		case 'poration': {
			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			const content = simpleCreateHTML('div', 'content');

			const {one, two} = getPorationHTML(branch);

			content.appendChild(one);
			content.appendChild(two);

			he.appendChild(content);

			branch.finish = true;
			return he;
		}
		case 'damage': {
			// 分支name
			let damage_name = null;
			if ( attr['name'] !== void 0 ){
				damage_name = simpleCreateHTML('span', '_name', toLangText(attr['name']));
			}

			// 標題
			let text = '';
			switch ( attr['title'] ){
				case 'normal': 
					text = attr['frequency'] == '1' ? '單下傷害' : '總傷害'; break;
				case 'each':
					text = '每下傷害'; break;
				case 'normal_attack':
					text = '一般攻擊傷害提升'; break;
			}
			const title = simpleCreateHTML('span', '_main_title', toLangText(text));

			// 技能常數基底
			const valid_base = createSkillAttributeScope(
				null, null,
				toLangText(attr['damage_type'] == 'physical' ? 'Valid ATK|,|有效ATK' : 'Valid MATK|,|有效MATK')
			);

			// 技能常數
			text = '';
			attr['constant'].split(',,').forEach((v, i) => {
				if ( i == 0 ){
					v = processValue(v);
					if ( v !== 0 )
						text += v;
				}
				else {
					text += '+' + toLangText(replaceExtraFromulaValue(v));
				}
			});
			if ( text === '' )
				text = '0';
			const constant = createSkillAttributeScope(
				null, 
				toLangText('Skill Constant|,|技能常數'), text
			);

			text = '';
			attr['multiplier'].split(',,').forEach((v, i) => {
				if ( i == 0 ){
					v = processValue(v);
					if ( v !== 0 )
						text += v;
				}
				else {
					text += '+' + toLangText(replaceExtraFromulaValue(v));
				}
			});
			if ( text === '' )
				text = '0';

			const multiplier = createSkillAttributeScope(
				null,
				toLangText('Skill Multiplier|,|技能倍率'),
				text, '%'
			);

			//異常狀態
			let aliment = null;
			if ( attr['aliment_name'] ) {
				aliment = simpleCreateHTML('div', ['content', 'content_line']);
				const s1 = simpleCreateHTML('div', 'scope1');
				s1.appendChild(simpleCreateHTML('span', '_main_title', toLangText('Aliment|,|異常狀態')));
				const s2 = simpleCreateHTML('div', 'scope2');
				s2.appendChild(createSkillAttributeScope(null, null, attr['aliment_name']));
				s2.appendChild(createSkillAttributeScope(null, toLangText('Chance|,|機率'), processValue(attr['aliment_chance']) + '%'));
				aliment.appendChild(s1);
				aliment.appendChild(s2);
			}
			
			// 傷害目標類型
			if ( attr['type'] == 'single' ){
				text = 'Single|,|單體';
			}
			else {
				text = 'AOE|,|範圍';	
			}
			const target_type = createSkillAttributeScope(null, null, toLangText(text));

			let damage_element = null;
			if ( attr['element'] ){
				damage_element = getDamageElementHTML(attr['element']);
			}

			// 傷害次數
			let damage_frequency = null, damage_judgment = null;
			if ( parseInt(attr['frequency']) > 1 || attr['title'] == 'each' ) {
				damage_frequency = createSkillAttributeScope(
					null, toLangText('Frequency|,|傷害次數'),
					processValue(attr['frequency'])
				);
				text = attr['judgment'] == 'common' ? 'common|,|共用判定' : 'separate|,|分開判定'
				damage_judgment = createSkillAttributeScope(
					null, null,
					toLangText(text)
				);
			}

			// @poration後綴
			const poration_branch = suffix.find(b => b.name == 'poration');
			let poration_damage = null, poration_poration = null;
			if ( poration_branch !== void 0 ){
				const {one, two} = getPorationHTML(poration_branch);
				poration_damage = one;
				poration_poration = two;
				poration_branch.finish = true;
			}

			// @extra後綴
			const damage_extras = suffix.filter(b => b.name == 'extra');
			const damage_extras_frg = document.createDocumentFragment();
			damage_extras.forEach(ex => {
				const _attr = ex.branchAttributes;
				let c = _attr['condition'];
				if ( c === void 0 )
					c = '技能加成';
				const line = simpleCreateHTML('div', ['content', 'content_line']);
				const s1 = simpleCreateHTML('div', 'scope1');
				s1.appendChild(simpleCreateHTML('span', '_main_title', toLangText(c)));
				const s2 = simpleCreateHTML('div', 'scope2');
				if ( _attr['constant'] ){
					const t = _attr['constant'];
					const sign = t >= 0 ? '+' : '';
					t = toLangText('Skill Constant |,|技能常數') + sign + t;
					if ( t < 0 )
						t = darkText(t);
					s2.appendChild(createSkillAttributeScope(null, null, t));
				}
				if ( _attr['element'] ){
					s2.appendChild(getDamageElementHTML(_attr['element']));
				}
				if ( _attr['caption'] ){
					s2.appendChild(simpleCreateHTML('div', 'text_scope', processText(ex, 'caption')));
				}
				ex.stats.forEach(stat => {
					const v = stat.statValue(processValue(stat.statValue()));
					let t = stat.show();
					t = v < 0 ? darkText(t) : t;
					s2.appendChild(createSkillAttributeScope(null, null, t));
				});
				line.appendChild(s1);
				line.appendChild(s2);
				damage_extras_frg.appendChild(line);
			});

			/*** 開始介面配置 ***/
			const top = simpleCreateHTML('div', 'top');
			if ( damage_name !== null )
				top.appendChild(damage_name);
			
			const scope1 = simpleCreateHTML('div', 'scope1');
			scope1.appendChild(title);
			scope1.appendChild(target_type);
			if ( damage_element !== null )
				scope1.appendChild(damage_element);
			if ( damage_judgment !== null )
				scope1.appendChild(damage_judgment);
			if ( damage_frequency !== null )
				scope1.appendChild(damage_frequency);
			if ( poration_damage !== null )
				scope1.appendChild(poration_damage);
			if ( poration_poration != null )
				scope1.appendChild(poration_poration);

			const scope2 = simpleCreateHTML('div', 'scope2');
			scope2.appendChild(valid_base);
			scope2.appendChild(constant);
			scope2.appendChild(multiplier);

			const content = simpleCreateHTML('div', 'content');
			content.appendChild(scope1);
			content.appendChild(scope2);

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			he.setAttribute(strings().data_branchIndex, branch.findLocation());
			if ( top.childElementCount != 0 )
				he.appendChild(top);
			he.appendChild(content);
			if ( aliment !== null )
				he.appendChild(aliment);
			if ( damage_extras_frg.childElementCount > 0 )
				he.appendChild(damage_extras_frg);

			branch.finish = true;
			return he;
		}
		case 'buffs': case 'next': case 'passive': case 'heal': {
			let text_name = null;
			if ( attr['name'] ){
				text_name = simpleCreateHTML('span', '_name', toLangText(attr['name']));
			}
			
			let c = attr['condition'];
			if ( c == 'auto' )
				c = '施放成功後';
			if ( c == 'hit' )
				c = '命中成功後';
			if ( btype == 'next' ){
				if ( attr['frequency'] == '1' )
					c = '下一招技能';
				else
					c = `之後的${attr['frequency']}招技能`;
			}
			if ( btype == 'passive' )
				c = 'Passive|,|被動效果';

 			const condition = c != 'none' ? simpleCreateHTML('span', '_main_title', toLangText(c)) : null;
 			let end_condition = null;
 			if ( attr['end_condition'] )
 				end_condition = simpleCreateHTML('span', '_main_title', toLangText(attr['end_condition']));
 			let duration = null;
 			if ( attr['duration'] ){
 				let v = processValue(attr['duration']);
 				duration = simpleCreateHTML('span', '_main_title', toLangText(`in ${v} secs|,|${v}秒內`));
 			}
 			let text;
 			switch (attr['type']){
 				case 'self':
 					text = '自身'; break;
 				case 'party':
 					text = '全隊伍'; break;
 				case 'aura':
 					text = '光環內的隊伍成員'; break;
 				case 'none':
 					text = 'none'; break;
 			}
 			const target_type = text != 'none' ? simpleCreateHTML('span', '_main_title', toLangText(text)) : null;
 			
 			const scope1 = simpleCreateHTML('div', 'scope1');
 			if ( condition !== null )
 				scope1.appendChild(condition);
 			if ( end_condition !== null )
 				scope1.appendChild(end_condition);
 			if ( duration !== null )
 				scope1.appendChild(duration);
 			if ( target_type != null )
 				scope1.appendChild(target_type);

 			const scope2 = simpleCreateHTML('div', 'scope2');
 			if ( attr['caption'] )
 				scope2.appendChild(simpleCreateHTML('div', 'text_scope', processText(branch, 'caption')));
 			else {
 				const statList = Grimoire.CharacterSystem.StatList();
				const showList = [];
				branch.stats.forEach(a => {
					const v = a.statValue(safeEval(a.statValue()));
					let t = a.show();
					t = v < 0  ? darkText(t) : t;
					showList.push(t);
				});
 				showList.forEach(l => {
	 				scope2.appendChild(createSkillAttributeScope(null, null, processValue(l, {calc: false})));
	 			});
 			}

 			const top = simpleCreateHTML('div', 'top');
			if ( text_name !== null )
				top.appendChild(text_name);

 			const content = simpleCreateHTML('div', ['content', 'content_line']);
 			content.appendChild(scope1);
 			content.appendChild(scope2);

 			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
 			he.setAttribute(strings().data_branchIndex, branch.findLocation());
 			if ( top.childElementCount != 0 )
				he.appendChild(top);
 			he.appendChild(content);

			return he;
		}
		case 'text': case 'tips': {
			let text_name = null;
			if ( attr['name'] ){
				text_name = simpleCreateHTML('span', '_name', toLangText(attr['name']));
			}

			let main_text = simpleCreateHTML('div', 'text_scope', processText(branch));

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			he.setAttribute(strings().data_branchIndex, branch.findLocation());

			const top = simpleCreateHTML('div', 'top');
			if ( text_name !== null )
				top.appendChild(text_name);

			const content = simpleCreateHTML('div', 'content');
			content.appendChild(main_text);

			if ( top.childElementCount != 0 )
				he.appendChild(top);
			he.appendChild(content);

			return he;
		}
		case 'list': {
			const lists = [];
			lists.push(branch);
			let p = branch.findLocation() + 1;
			let cur = branch.parent.branchs[p];
			while ( cur !== void 0 && cur.name == btype ){
				lists.push(cur);
				cur = branch.parent.branchs[++p];
			}
			const ul = simpleCreateHTML('ul', '_lists');
			lists.forEach(b => {
				ul.appendChild(simpleCreateHTML('li', null, processText(b)));
				b.finish = true;
			});

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			he.setAttribute(strings().data_branchIndex, branch.findLocation());

			const content = simpleCreateHTML('div', 'content');
			content.appendChild(ul);

			he.appendChild(content);

			return he;
		}
	}
	return null;
}



/*
| @param SkillElement.Skill skill ::使用者選取的技能
| @param Object equip ::使用者選取的裝備
| @return documentFragment
*/
export default function(data){
	
	const skill = data.currentSkill;
	const equip = data;
	const SLv = data.skillLevel, CLv = data.characterLevel;

	/* Load Default SkillEffect */
	let output = new TempSkillEffect().from(skill.defaultEffect);
	
	const equip_confirm = function(_equip){
		/* 通用 */
		if ( equip.mainWeapon == -1 && equip.subWeapon == -1 && equip.bodyArmor == -1 )
			return true;
		/* 非通用 */
		if ( equip.mainWeapon != -1 && equip.mainWeapon == _equip.mainWeapon )
			return true;
		if ( equip.subWeapon != -1 && equip.subWeapon == _equip.subWeapon )
			return true;
		if ( equip.bodyArmor != -1 && equip.bodyArmor == _equip.bodyArmor )
			return true;
		return false;
	};

	let find = false;
	skill.effects.forEach(function(eft){
		if ( find ) return;
		let {mainWeapon, subWeapon, bodyArmor} = eft;
		if ( equip_confirm({mainWeapon, subWeapon, bodyArmor}) ){
			if ( eft != skill.defaultEffect )
				output.overWrite(eft);
			find = true;
			return;
		}
	});
	/* 產生輸出介面 */
	if ( find ){
		const frg = document.createDocumentFragment();

		const order = [
			SkillEffect.MP_COST,
			SkillEffect.RANGE,
			SkillEffect.SKILL_TYPE,
			SkillEffect.DAMAGE_TYPE,
			SkillEffect.PORATION_TYPE,
			SkillEffect.IN_COMBO,
			SkillEffect.ACTION_TIME,
			SkillEffect.CASTING_TIME
		];
		const one = document.createElement('div');
		one.className = 'skill_attributes';
		order.forEach(function(item){
			if ( output.attributes[item] === void 0 )
				return;
			const he = getEffectHTML(output, item, {SLv, CLv});
			if ( he )
				one.appendChild(he);
		});
		frg.appendChild(one);

		const two = document.createElement('div');
		two.className = 'skill_branchs';
		if ( output.checkData() ){
			if ( data.stackValues === null ){
				data.stackValues = {};
				output.branchs.forEach(branch => {
					if ( branch.name == 'stack' ){
						const _attr = branch.branchAttributes;
						const v = _attr['default'] == 'auto' ? _attr['min'] : _attr['default'];
						data.stackValues[getStackBranchIdKey(branch)] = v;
					}
				});
			}
			const stackValues = data.stackValues;
			output.branchs.forEach(branch => {
				const t = getBranchHTML(branch, {SLv, CLv, stackValues});
				if ( t !== null )
					two.appendChild(t);
			});
		}
		else {
			const t = document.createElement('div');
			t.classList.add('no_data');
			t.innerHTML = '此技能資料尚未齊全。';
			two.appendChild(t);
		}
		frg.appendChild(two);

		return frg;
	}
	else {
		return '<div>所選取的武器無法使用此技能。</div>';
	}
};