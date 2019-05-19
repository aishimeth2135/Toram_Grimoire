import {Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import Grimoire from "../../main/Grimoire.js";
import {toLangText, ConvertLangText} from "../../main/module/LangText.js";
import CY from "../../main/module/cyteria.js";
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
			CY.object.empty(this.branchAttributes);
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
			tail = 'sec|,|秒';
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
		res += `<span class="_tail">${toLangText(tail)}</span>`;
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
		str = str.replace(/\*/g, '×');
		str = str.replace(/(\d+\.\d+)/, () => Number(RegExp.$1)*100 + '%');
		return str;
	}
	function processText(b, _main){
		const _attr = b.branchAttributes;
		let str = _attr[_main === void 0 ? 'text': _main];
		str = str.replace(/(\$\{[^\}]+\})([%]?)/g, () =>
			RegExp.$2 !== '%'
			? processValue(RegExp.$1, {calc: false, light: true})
			: processValue(RegExp.$1, {calc: false, tail: '%', light: true})
		);
		str = safeEval("`" + str + "`");
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
		v = v.split(',,');
		setting = Object.assign({
			calc: true, tail: '', toPercentage: false,
			checkHasStack: v[0], light: false
		}, setting);
		
		let res;
		v.forEach((a, i) => {
			if ( i === 0 ){
				if ( setting.calc ){
					let t = safeEval(a);
					if ( !Number.isInteger(t) )
						t = t.toFixed(2);
					res = t;
				}
				else
					res = a;
				if ( setting.toPercentage )
					res = res*100 + '%';
				res += setting.tail;
			}
			else {
				a = replaceExtraFromulaValue(a);
				res += a.charAt(0) !== '-' ? '+' + a : a;
			}
		});
		
		const span = document.createElement('span');
		if ( setting.checkHasStack.includes('stack') )
			span.classList.add('effect_by_stack');
		else if ( setting.light )
			span.classList.add('light');;
		span.innerHTML = res;
		return span.outerHTML;
	}
	function processStat(stat){
		const data = stat.getShowData();
		const v = processValue(data.value);
		const t = createSkillAttributeScope(null,
			data.title, v,
			data.tail !== '' ? data.tail : void 0
		);
		t.classList.add('stat_scope');
		return t;
	}
	const simpleCreateHTML = CY.element.simpleCreateHTML;
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
			arrow: '套用箭矢屬性',
			one_hand_sword: '套用單手劍屬性'
		};
		const t = simpleCreateHTML('div', 'skill_attribute');
		if ( ele_type != 'arrow' )
			t.appendChild(simpleCreateHTML('span', ['_icon', 'element_' + ele_type, 'element_ball']));
		t.appendChild(simpleCreateHTML('span', ['_value', 'element_value'], toLangText(ELEMEMT_DICT[ele_type])));
		return t;
	}
	function createContentLine(frg1, frg2, extrafrgs){
		const t = simpleCreateHTML('div', ['content', 'content_line']);
		const s1 = simpleCreateHTML('div', 'scope1');
		const s2 = simpleCreateHTML('div', 'scope2');
		s1.appendChild(frg1);
		s2.appendChild(frg2);
		t.appendChild(s1);
		t.appendChild(s2);
		if ( extrafrgs !== void 0 && extrafrgs !== null ){
			if ( !Array.isArray(extrafrgs) )
				t.appendChild(extrafrgs);
			else
				[...extrafrgs].forEach(a => t.appendChild(a));
		}
		return t;
	}
	function getTargetText(s, _is_place){
		const dict = {
			self: 'Self|,|自身', party: !_is_place ? 'Party|,|全隊伍' : 'Team Members in Area|,|區域內的隊伍成員',
			aura: 'Team Members in Aura|,|光環內的隊伍成員',
			target: 'Target|,|目標', none: null
		};
		const res = dict[s];
		return res !== null ? toLangText(res) : res;
	}
	function getEffectiveAreaHTML(b){
		// radius, angle, end_position, effective_area, move_distance
		const _attr = b.branchAttributes;
		const is_self = _attr['end_position'] === 'self';

		const caption = simpleCreateHTML('div', 'scope1');
		{
			const a = simpleCreateHTML('div', 'skill_attribute');
			a.appendChild(simpleCreateHTML('span', ['_icon', 'element_ball', 'ball_character']));
			a.appendChild(simpleCreateHTML('span', '_value', toLangText('Character Position|,|角色位置')));
			caption.appendChild(a);
			if ( !is_self ){
				const b = simpleCreateHTML('div', 'skill_attribute');
				b.appendChild(simpleCreateHTML('span', ['_icon', 'element_ball', 'ball_target']));
				b.appendChild(simpleCreateHTML('span', '_value', toLangText('Target Position|,|目標位置')));
				caption.appendChild(b);
			}
		}
		let radius, angle, areaType;
		['radius', 'angle', 'effective_area', 'move_distance'].forEach(a => {
			if ( _attr[a] ){
				let t, v = _attr[a];
				switch (a){
					case 'radius':
						t = 'Radius|,|半徑';
						radius = safeEval(v);
						v = processValue(v, {tail: 'm'});
						break;
					case 'angle':
						t = 'Angle|,|夾角';
						angle = safeEval(v);
						v = processValue(v, {tail: '°'});
						break;
					case 'effective_area':
						areaType = _attr[a];
						t = 'Type|,|類別';
						v = toLangText({circle: 'Circle|,|圓形', line: 'Line|,|直線型', sector: 'Sector|,|扇型'}[v]);
						break;
					case 'move_distance':
						t = 'Move Distance|,|移動距離';
						v = processValue(v, {tail: 'm'});
						break;
				}
				caption.appendChild(createSkillAttributeScope(null, toLangText(t), v));
			}
		});
		const frg = document.createDocumentFragment();

		const unit = v => v !== void 0 ? 10*v : 10;
		const base_distance = 8, base_distance_long = 12;
		let h, w, ox, oy, endx, endy;
		const pcolor = '#ff5fb7', pcolorl = '#FFD1EA', pcolorl2 = '#feeaf5';
		
		const dis = _attr['move_distance'] === void 0 ? base_distance : base_distance_long;
		switch ( areaType ){
			case 'line': case 'circle': {
				w = !is_self ? unit(radius*2 + dis + 2) : unit(radius*2 + 2);
				h = unit(radius*2 + 2);
				ox = unit(radius + 1),
				oy = h/2,
				endx = !is_self ? ox + unit(base_distance) : ox,
				endy = oy;
				
				switch ( areaType ){
					case 'circle': {
						const area = CY.svg.drawCircle(endx, endy, unit(radius), {fill: pcolorl2});
						frg.appendChild(area);
						const ocircle = CY.svg.drawCircle(endx, endy, unit(radius), {stroke: pcolorl, fill: 'none'});
						ocircle.appendChild(CY.svg.createAnimate('stroke', {values: `${pcolorl};${pcolor};${pcolor}`, keyTimes: '0;0.2;1', dur: '2.5s'}));
						frg.appendChild(ocircle);
					} break;
					case 'line': {
						const _end = ox + unit(dis);
						const area = CY.svg.drawPath(`M${ox} ${oy-unit(radius)} A${unit(radius)} ${unit(radius)} 0 0 0 ${ox} ${oy+unit(radius)} L${_end} ${oy+unit(radius)} A${unit(radius)} ${unit(radius)} 0 0 0 ${_end} ${endy-unit(radius)} Z`, {fill: pcolorl2});
						frg.appendChild(area);
						const ocircle = CY.svg.drawCircle(ox, oy, unit(radius), {stroke: pcolorl, fill: 'none'});
						ocircle.appendChild(CY.svg.createAnimate('stroke', {id: 'a1', values: `${pcolorl};${pcolor};${pcolor}`, keyTimes: '0;0.2;1', dur: '1s',repeatCount: '1', begin: '0s;a2.end', fill: 'freeze'}));
						ocircle.appendChild(CY.svg.createAnimate('cx', {id: 'a2', values: `${ox};${_end};${_end}`, keyTimes: '0;0.2;1', dur: '1.5s', repeatCount: '1', begin: 'a1.end'}));
						frg.appendChild(ocircle);
					} break;
				}
			} break;
			case 'sector': {
				w = unit(dis + 6);
				h = unit(dis)*Math.sin(angle*Math.PI/180) + unit(2);
				ox = unit(4);
				oy = h/2;
				endx = ox + unit(base_distance);
				endy = oy;

				const start_dis = 0, sector_width = 2;
				radius = 2;

				const area = CY.svg.drawSector(ox, oy, unit(start_dis), unit(dis), angle/2, 360-angle/2, 1, {fill: pcolorl2});
				frg.appendChild(area);
				const osector = CY.svg.drawSector(ox, oy, unit(start_dis), unit(start_dis+1), angle/2, 360-angle/2, 1, {stroke: pcolor});
				osector.appendChild(CY.svg.createAnimate('d', {id: 'a1', to: CY.svg.getSectorD(ox, oy, unit(dis - sector_width), unit(dis), angle/2, 360-angle/2, 1), dur: '0.4s', repeatCount: 1, begin: '0s;a2.end', fill: 'freeze'}));
				osector.appendChild(CY.svg.createAnimate('stroke', {id: 'a2', to: pcolor, dur: '2s', repeatCount: 1, begin: 'a1.end'}));
				frg.appendChild(osector);
			} break;
		}
		const point_radius = 0.5;
		const chara = CY.svg.drawCircle(ox, oy, unit(radius <= point_radius && is_self ? point_radius/2 : point_radius), {fill: pcolor});
		if ( _attr['is_sprint'] === '1' )
			chara.appendChild(CY.svg.createAnimate('cx', {values: `${ox};${ox + unit(dis)};${ox + unit(dis)}`, keyTimes: '0;0.2;1', dur: '1.5s', repeatCount: '1', begin: 'a1.end'}));
		frg.appendChild(chara);
		if ( !is_self ){
			const targetPosition = CY.svg.drawCircle(endx, endy, unit(radius > point_radius ? point_radius : point_radius/2), {fill: '#2196f3'});	
			frg.appendChild(targetPosition);
		}

		const svg = CY.svg.create(w, h);
		svg.appendChild(frg);

		const scope = simpleCreateHTML('div', ['effective_area', 'content', 'hidden']);
		const svg_scope = document.createElement('div');
		svg_scope.appendChild(svg);
		scope.appendChild(svg_scope);
		scope.appendChild(caption);

		return scope;
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

			const stk = branch,
				maxv = parseInt(safeEval(stk.branchAttributes['max']), 10),
				minv = parseInt(safeEval(stk.branchAttributes['min']), 10);
			const ctr_listener = function(event){
				const max = parseInt(mid.getAttribute('data-maxv'), 10);
				const min = parseInt(mid.getAttribute('data-minv'), 10);
				let v = parseInt(mid.value, 10);
				switch ( this.getAttribute('data-ctr') ){
					case '-': --v; break;
					case '+': ++v; break;
				}
				if ( v > max )
					v = max;
				else if ( v < min )
					v = min;
				mid.value = v;
				data.stackValues[getStackBranchIdKey(stk)] = v;
				Grimoire.SkillSystem.skillRoot.controller.updateSkillHTML();
			};
			left.setAttribute('data-ctr', '-');
			left.addEventListener('click', ctr_listener);

			right.setAttribute('data-ctr', '+');
			right.addEventListener('click', ctr_listener);

			mid.type = 'number';
			mid.setAttribute('data-maxv', maxv);
			mid.setAttribute('data-minv', minv);
			mid.addEventListener('change', ctr_listener);
			mid.addEventListener('focus', function(event){
				this.select();
			});

			const scope1 = document.createDocumentFragment();
			if ( attr['name'] !== void 0 ){
				scope1.appendChild(simpleCreateHTML('span', '_main_title', toLangText(attr['name'])));
			}
			scope1.appendChild(createSkillAttributeScope(null, toLangText('Min|,|最小值'), processValue(attr['min'])));
			if ( attr['max'] !== void 0 )
				scope1.appendChild(createSkillAttributeScope(null, toLangText('Max|,|最大值'), processValue(attr['max'])));

			const main = document.createDocumentFragment();
			main.appendChild(left);
			main.appendChild(mid);
			main.appendChild(right);

			const content = createContentLine(scope1, main);

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			he.appendChild(content);

			branch.finish = true;
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

			const damage_type = createSkillAttributeScope(
				null, null,
				toLangText({physical: 'Physical|,|物理', magic: 'Magic|,|魔法'}[attr['damage_type']])
			);

			// 技能常數
			const constant = createSkillAttributeScope(
				null, 
				toLangText('Skill Constant|,|技能常數'),
				processValue(attr['constant'])
			);

			const multiplier = createSkillAttributeScope(
				null,
				toLangText('Skill Multiplier|,|技能倍率'),
				processValue(attr['multiplier']), '%'
			);

			//異常狀態
			let aliment = null;
			if ( attr['aliment_name'] !== void 0 ) {
				const s2 = document.createDocumentFragment();
				s2.appendChild(createSkillAttributeScope(null, null, attr['aliment_name']));
				s2.appendChild(createSkillAttributeScope(null, toLangText('Chance|,|機率'), processValue(attr['aliment_chance'] || '0') + '%'));
				aliment = createContentLine(
					simpleCreateHTML('span', '_main_title', toLangText('Aliment|,|異常狀態')),
					s2
				);
			}
			
			// 傷害目標類型
			let area_scope = null;
			let target_type = null;
			if ( attr['type'] == 'single' )
				target_type = createSkillAttributeScope(null, null, toLangText('Single|,|單體'));
			else {
				target_type = createSkillAttributeScope(
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
					null, toLangText('AOE|,|範圍')
				);
				area_scope = getEffectiveAreaHTML(branch);
				target_type.addEventListener('click', () => {
					area_scope.classList.toggle('hidden');
				});
				target_type.classList.add('show_area');
			}

			// 屬性
			let damage_element = null;
			if ( attr['element'] !== void 0 ){
				damage_element = getDamageElementHTML(attr['element']);
			}
			let damage_isPlace = null;
			if ( attr['is_place'] == '1' ){
				damage_isPlace = createSkillAttributeScope(null, null, toLangText('Is Place|,|設置型'));
			}

			// 傷害次數  週期、頻率
			let damage_frequency = null, damage_judgment = null, damage_cycle = null;
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
				if ( attr['is_place'] == '1' && attr['cycle'] !== void 0 ) {
					damage_cycle = createSkillAttributeScope(null, null, toLangText('per |,|每') + processValue(attr['cycle'], {tail: toLangText(' sec|,|秒')}));
				}
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
				if ( _attr['condition'] === void 0 )
					_attr['condition'] = '額外效果';
				const s2 = document.createDocumentFragment();

				if ( _attr['aliment_name'] )
					s2.appendChild(createSkillAttributeScope(null, null, _attr['aliment_name']));
				if ( _attr['aliment_chance'] )
					s2.appendChild(createSkillAttributeScope(null, toLangText('Chance|,|機率'), processValue(_attr['aliment_chance']) + '%'));
				if ( _attr['constant'] ){
					let t = safeEval(_attr['constant']);
					const sign = t >= 0 ? '+' : '';
					let res = toLangText('Skill Constant |,|技能常數') + sign + t;
					if ( t < 0 )
						res = darkText(res);
					res = processValue(res, {calc: false, checkHasStack: _attr['constant']});
					s2.appendChild(createSkillAttributeScope(null, null, res));
				}
				if ( _attr['element'] ){
					s2.appendChild(getDamageElementHTML(_attr['element']));
				}
				if ( _attr['caption'] ){
					s2.appendChild(simpleCreateHTML('div', 'text_scope', processText(ex, 'caption')));
				}
				ex.stats.forEach(stat => s2.appendChild(processStat(stat)));
				
				damage_extras_frg.appendChild(createContentLine(simpleCreateHTML('span', '_main_title', processText(ex, 'condition')), s2));
				ex.finish = true;
			});

			/*** 開始介面配置 ***/
			const top = simpleCreateHTML('div', 'top');
			if ( damage_name !== null )
				top.appendChild(damage_name);
			
			const scope1 = simpleCreateHTML('div', 'scope1');
			scope1.appendChild(title);
			scope1.appendChild(damage_type);
			scope1.appendChild(target_type);
			if ( damage_isPlace !== null )
				scope1.appendChild(damage_isPlace);
			if ( damage_element !== null )
				scope1.appendChild(damage_element);
			if ( damage_judgment !== null )
				scope1.appendChild(damage_judgment);
			if ( damage_frequency !== null )
				scope1.appendChild(damage_frequency);
			if ( damage_cycle !== null )
				scope1.appendChild(damage_cycle);
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
			
			if ( top.childElementCount != 0 )
				he.appendChild(top);
			he.appendChild(content);
			if ( aliment !== null )
				he.appendChild(aliment);
			if ( damage_extras_frg.childElementCount > 0 )
				he.appendChild(damage_extras_frg);
			if ( area_scope !== null )
				he.appendChild(area_scope);

			branch.finish = true;
			return he;
		}
		case 'effect': case 'next': case 'passive': {
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

			attr['condition'] = c;

 			const condition = c != 'none' ? simpleCreateHTML('span', '_main_title', processText(branch, 'condition')) : null;
 			let end_condition = null;
 			if ( attr['end_condition'] )
 				end_condition = simpleCreateHTML('span', '_main_title', toLangText(attr['end_condition']));
 			let duration = null;
 			if ( attr['duration'] ){
 				let v = processValue(attr['duration']);
 				if ( attr['is_place'] === '1' )
 					duration = createSkillAttributeScope(null, toLangText('Duration|,|持續時間'), processValue(attr['duration']), toLangText('sec|,|秒'))
 				else
 					duration = simpleCreateHTML('span', '_main_title', toLangText(`in ${v} secs|,|${v}秒內`));
 			}
 			let isPlace = null;
			if ( attr['is_place'] === '1' ){
				isPlace = createSkillAttributeScope(null, null, toLangText('Is Place|,|設置型'));
			}

 			let text = attr['type'] !== void 0 ? getTargetText(attr['type'], attr['is_place'] === '1') : null;
 			let target_type = null;
 			let area_scope = null;
 			
 			if ( attr['radius'] === void 0 )
 				target_type = text !== null ? createSkillAttributeScope(null, null, text) : null;
 			else {
 				target_type = createSkillAttributeScope(
					'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
					null, text
				);
 				attr['end_position'] = 'self';
 				attr['effective_area'] = 'circle';
 				area_scope = getEffectiveAreaHTML(branch);
				target_type.addEventListener('click', () => {
					area_scope.classList.toggle('hidden');
				});
				target_type.classList.add('show_area');
 			}
 			
 			const extras = suffix.filter(a => a.name == 'extra');
 			const extras_frg = document.createDocumentFragment();
 			extras.forEach(ex => {
 				const _attr = ex.branchAttributes;
				if ( _attr['condition'] === void 0 )
					_attr['condition'] = '額外效果';
				const s2 = document.createDocumentFragment();

				if ( _attr['caption'] ){
					s2.appendChild(simpleCreateHTML('div', 'text_scope', processText(ex, 'caption')));
				}
				ex.stats.forEach(stat => s2.appendChild(processStat(stat)));
				const s1 = document.createDocumentFragment();
				s1.appendChild(simpleCreateHTML('span', '_main_title', processText(ex, 'condition')));
				if ( _attr['target'] !== void 0 ){
					s1.appendChild(simpleCreateHTML('span', '_main_title', toLangText(_attr['target'])));
				}
				extras_frg.appendChild(createContentLine(s1, s2));
				ex.finish = true;
 			});

 			const scope1 = document.createDocumentFragment();
 			if ( condition !== null )
 				scope1.appendChild(condition);
 			if ( isPlace !== null )
 				scope1.appendChild(isPlace);
 			if ( end_condition !== null )
 				scope1.appendChild(end_condition);
 			if ( duration !== null )
				scope1.appendChild(duration);
 			if ( target_type != null )
 				scope1.appendChild(target_type);

 			const scope2 = document.createDocumentFragment();
 			if ( attr['caption'] )
 				scope2.appendChild(simpleCreateHTML('div', 'text_scope', processText(branch, 'caption')));
 			else
				branch.stats.forEach(a => scope2.appendChild(processStat(a)));

 			const top = simpleCreateHTML('div', 'top');
			if ( text_name !== null )
				top.appendChild(text_name);

 			
 			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
 			
 			if ( top.childElementCount != 0 )
				he.appendChild(top);
			const content = createContentLine(scope1, scope2);
			if ( isPlace !== null )
				content.classList.remove('content_line');
 			he.appendChild(content);
 			if ( extras_frg.childElementCount !== 0 )
 				he.appendChild(extras_frg);
 			if ( area_scope !== null )
 				he.appendChild(area_scope);

 			branch.finish = true;
			return he;
		}
		case 'heal': {
			let text = {
				hp: 'Restore HP|,|恢復HP',
				mp: 'Restore MP|,|恢復MP'
			}[attr['type']];
			const title =  simpleCreateHTML('span', '_main_title', toLangText(text));

			text = getTargetText(attr['target']);
 			const target = text != null ? createSkillAttributeScope(null, null, text) : null;

 			const constant = createSkillAttributeScope(
 				null,
 				attr['constant'] != '0' ? toLangText('Restore|,|恢復量') : toLangText('Base Restore|,|基本恢復量'),
 				processValue(attr['constant'])
 			);

 			let duration = null;
 			if ( attr['duration'] !==  void 0 ){
 				let v = processValue(attr['duration']);
 				duration = createSkillAttributeScope(null, toLangText('Duration|,|持續時間'), processValue(attr['duration']), toLangText('sec|,|秒'));
 			}

 			let frequency = null;
 			if ( attr['frequency'] !==  void 0 ) {
				frequency = createSkillAttributeScope(
					null, toLangText('Frequency|,|作用次數'),
					processValue(attr['frequency'])
				);
			}

			let cycle = null;
 			if ( attr['cycle'] !==  void 0 ) {
				cycle = createSkillAttributeScope(null, null, toLangText('per |,|每') + processValue(attr['cycle'], {tail: toLangText(' sec|,|秒')}));
			}

			const extra_frg = document.createDocumentFragment();
			if ( attr['extra_text'] !==  void 0 ){
				const ta = attr['extra_text'].split(','),
					va = attr['extra_value'].split(',').map(a => processValue(a, {toPercentage: true}));
				const frg2 = document.createDocumentFragment();
				ta.forEach((a, i) => {
					frg2.appendChild(createSkillAttributeScope(null, a, va[i]));
				});
				extra_frg.appendChild(createContentLine(simpleCreateHTML('span', '_main_title', toLangText('extra|,|恢復量加成')),frg2));
			}

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			const content = simpleCreateHTML('div', 'content');

			const scope1 = simpleCreateHTML('div', 'scope1');
			scope1.appendChild(title);
			scope1.appendChild(target);
			if ( duration !== null )
				scope1.appendChild(duration);
			if ( frequency !== null )
				scope1.appendChild(frequency);
			if ( cycle !== null )
				scope1.appendChild(cycle);

			const scope2 = simpleCreateHTML('div', 'scope2');
			scope2.appendChild(constant);

			content.appendChild(scope1);
			content.appendChild(scope2);

			he.appendChild(content);
			if ( extra_frg.childElementCount !== 0 )
				he.appendChild(extra_frg);

			branch.finish = true;
			return he;
		}
		case 'text': case 'tips': {
			let text_name = null;
			if ( attr['name'] ){
				text_name = simpleCreateHTML('span', '_name', toLangText(attr['name']));
			}

			const main_text = simpleCreateHTML('div', 'text_scope', processText(branch));

			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);

			const top = simpleCreateHTML('div', 'top');
			if ( text_name !== null )
				top.appendChild(text_name);

			const content = simpleCreateHTML('div', 'content');
			content.appendChild(main_text);

			if ( top.childElementCount != 0 )
				he.appendChild(top);
			he.appendChild(content);

			branch.finish = true;
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

			const content = simpleCreateHTML('div', 'content');
			content.appendChild(ul);

			he.appendChild(content);

			branch.finish = true;
			return he;
		}
		case 'reference': {
			let main_text = null;
			if ( attr['text'] )
				main_text = simpleCreateHTML('div', 'text_scope', processText(branch));

			let url_scope = null;
			if ( attr['url'] ){
				url_scope = document.createDocumentFragment();
				let urls = attr['url'].split(',');
				let url_texts = attr['url_text'].split(',');
				urls.forEach((a, i) => {
					url_scope.appendChild(createSkillAttributeScope(null, null, toLangText(url_texts[i], {href: a, class: 'url_text'})));
				});
			}
			const he = simpleCreateHTML('div', ['branch', 'branch_' + btype]);
			if ( main_text !== null)
				he.appendChild(main_text);
			if ( url_scope !== null )
				he.appendChild(createContentLine(simpleCreateHTML('span', '_main_title', toLangText('Reference url|,|資料參考連結')), url_scope));

			branch.finish = true;
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
		if ( _equip.mainWeapon == -1 && _equip.subWeapon == -1 && _equip.bodyArmor == -1 )
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
		const div = document.createElement('div');
		div.classList.add('no_data');
		div.innerHTML = '所選取的裝備無法使用此技能。';
		return div;
	}
};