import {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import {DrawSkillTree, GetDrawData} from "./DrawSkillTree.js";
import AnalysisSkill from "./AnalysisSkill/AnalysisSkill.js";
import Icons from "../../main/module/SvgIcons.js";

import GetLang from "../../main/module/LanguageSystem.js";
import strings from "./strings.js";

import CY from "../../main/module/cyteria.js";

import {getSkillAttributeData, simpleCreateHTML} from "./AnalysisSkill/main.js";

function Lang(s){
	return GetLang('Skill Query/Controller/' + s);
}

const TYPE_SKILL_LEVEL = Symbol(),
	TYPE_CHARACTER_LEVEL = Symbol(),
	TYPE_SWITCH_DISPLAY_MODE = Symbol(),
	TYPE_SKILL_RECORD = Symbol();

class SkillElementsController {
	constructor(sr){
		this.MAIN_NODE = null;
		this.skillRoot = sr;
		this.status = {
			mainWeapon: -1,
			subWeapon: -1,
			bodyArmor: -1,
			skillLevel: 10,
			characterLevel: 195,
			currentSkill: null,
			stackValues: {},
			stackNames: {},
			showOriginalFormula: false,
			skillRecords: [],
			skillEquipmentRecords: [],
			branchDevelopmentMode: false,
			currentSkillHistoryDate: null
		};

		this.nodes = {
			openSkillAttributeIconTipsButton: null,
			openSelectSkillHistoryDateButton: null
		};

		const ctrr = this;
		this.listeners = {
			closeWindow(e){
				this.parentNode.parentNode.classList.add('hidden');
			},
			setCurrentSkillHistoryDate(e){
				const t = this.getAttribute('data-date') || null;
				ctrr.status.currentSkillHistoryDate = t;

				const btn = ctrr.nodes.openSelectSkillHistoryDateButton;
				btn.querySelector('.text').innerHTML = t || btn.getAttribute('data-last');
				btn.classList[t ? 'add' : 'remove']('flip-icon');

				ctrr.updateSkillHTML();
				ctrr.MAIN_NODE.querySelector('.select-skill-history-date').classList.add('hidden');
			}
		};
	}
	initSkillQueryHTML(main_node){
		const sr = this.skillRoot;
		this.MAIN_NODE = main_node;
		const order = [
			SkillRoot.TYPE, SkillTreeCategory.TYPE, SkillTree.TYPE,
			TYPE_SKILL_LEVEL, TYPE_CHARACTER_LEVEL, TYPE_SWITCH_DISPLAY_MODE,
			SkillTree.CATEGORY_EQUIPMENT, TYPE_SKILL_RECORD, Skill.TYPE
		];
		const frg = document.createDocumentFragment();
		order.forEach(a => {
			const t = this.getSkillElementScope(a);
			frg.appendChild(t);
			switch(a){
				case SkillRoot.TYPE:
					t.appendChild(this.createSkillQueryScopeHTML(sr, strings().menu));
					break;
				case SkillTreeCategory.TYPE:
					sr.skillTreeCategorys.forEach(function(stc){
						t.appendChild(this.createSkillQueryScopeHTML(stc, strings().menu));
					}, this);
					break;
				case TYPE_SKILL_RECORD:
					t.classList.add('hidden');
				case TYPE_SKILL_LEVEL:
				case TYPE_CHARACTER_LEVEL:
				case TYPE_SWITCH_DISPLAY_MODE:
					t.appendChild(this.createSkillQueryScopeHTML(null, a));
					break;
			}
		}, this);

		main_node.appendChild(frg);

		this.status.skill_from_where_scope = simpleCreateHTML('div', ['show_skill_from_where', 'hidden']);

		const _C = this;
		document.querySelector("footer .switch_branch_development_mode").addEventListener('click', function(event){
			_C.status.branchDevelopmentMode = _C.status.branchDevelopmentMode ? false : true;
			_C.updateSkillHTML();
		});

		// defs of svg in Skill Query
		const svg = CY.svg.create();
		const defs = CY.svg.createEmpty('defs');

		const w = GetDrawData().gridWidth,
			Circle = CY.svg.drawCircle;

	    // @lock
	    const lock_pettern = CY.svg.createEmpty('pattern', {width: 1, height: 1, id: 'skill-icon-lock'});
	    const lock = CY.svg.create(w, w, {x: (w-24)/2, y: (w-24)/2});
	    lock.innerHTML = '<path fill="var(--primary-light)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>';
	    lock_pettern.appendChild(Circle(w/2, w/2, w/2, {fill: '#FFF', 'stroke-width': 0}));
	    lock_pettern.appendChild(lock);

	    defs.appendChild(lock_pettern);

	    const skillIconBg = CY.svg.createLinearGradient('skill-icon-bg',
	        '.5', '0', '.5', '1', [
	            {offset: '0%', 'stop-color': '#FFF'},
	            {offset: '50%', 'stop-color': 'var(--primary-light)'},
	            {offset: '100%', 'stop-color': 'var(--primary-light-2)'}
	        ]
	    );

	    defs.appendChild(skillIconBg);

	    svg.appendChild(defs);
	    this.MAIN_NODE.appendChild(svg);

	    // skill attribute tips
	    {
	    	const skill_attribute_icon_tips = simpleCreateHTML('div', ['Cyteria', 'window', 'top-center', 'pop-right', 'hidden', 'skill-attribute-icon-tips']);
	    	const top = simpleCreateHTML('div', 'top');
	    	top.appendChild(simpleCreateHTML('span', 'name', Lang('skill attribute icon tips: title')));
	    	const close_btn = simpleCreateHTML('span', ['button', 'right'], Icons('close'));
	    	close_btn.addEventListener('click', this.listeners.closeWindow);
	    	top.appendChild(close_btn);
	    	skill_attribute_icon_tips.appendChild(top);

		    const {ICON_DATA, TITLE_DATA, TEXT_LIST} = getSkillAttributeData();
		    
		    Object.getOwnPropertySymbols(TITLE_DATA).forEach(k => {
		    	const c = TITLE_DATA[k];
		    	const a = ICON_DATA[k];
		    	const icon = Array.isArray(a) ? Icons('label') : Icons(a);
		    	const text = Array.isArray(c) ? c.filter(q => q !== '').join(GetLang('global/split string')) : c;

		    	const frg = document.createDocumentFragment();
		    	const t = simpleCreateHTML('div', 'title');
	    		t.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], icon + '<span class="text">' + text + '</span>'));
	    		frg.appendChild(t);
		    	if ( Array.isArray(a) ){
		    		const ct = simpleCreateHTML('div', 'content');
		    		a.forEach((a, i) => ct.appendChild(simpleCreateHTML('div', ['Cyteria', 'scope-icon', 'text-small', 'light'], Icons(a) + '<span class="text">' + TEXT_LIST[k][i] + '</span>')));
		    		frg.appendChild(ct);
		    	}
		    	skill_attribute_icon_tips.appendChild(frg);
		    });
		    this.MAIN_NODE.appendChild(skill_attribute_icon_tips);
		    const open_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only'], Icons('help-rhombus'));
		    open_btn.addEventListener('click', function(e){
		    	skill_attribute_icon_tips.classList.remove('hidden');
		    	e.stopPropagation();
		    });
		    this.nodes.openSkillAttributeIconTipsButton = open_btn;
	    }
	    {
	    	const select_skill_history_date = simpleCreateHTML('div', ['Cyteria', 'window', 'top-center', 'pop-right', 'hidden', 'bg-mask','select-skill-history-date']);
	    	const top = simpleCreateHTML('div', 'top');
	    	top.appendChild(simpleCreateHTML('span', 'name', Lang('select skill history date: title')));
	    	const close_btn = simpleCreateHTML('span', ['button', 'right'], Icons('close'));
	    	close_btn.addEventListener('click', this.listeners.closeWindow);
	    	top.appendChild(close_btn);
	    	select_skill_history_date.appendChild(top);

	    	select_skill_history_date.appendChild(simpleCreateHTML('div', 'content'));
	    	this.MAIN_NODE.appendChild(select_skill_history_date);

	    	const open_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'after', 'text-light', 'no-border'], Icons('clock-arrow') + '<span class="text"></span>');
		    open_btn.addEventListener('click', function(e){
		    	select_skill_history_date.classList.remove('hidden');
		    	e.stopPropagation();
		    });

		    this.nodes.openSelectSkillHistoryDateButton = open_btn;

	    	this.getSkillElementScope(TYPE_SKILL_RECORD).appendChild(open_btn);
	    }
	}
	getSkillElementScope(type){
		const SCOPE_NAME = {
			[SkillRoot.TYPE]: 'SkillRoot_scope',
			[SkillTreeCategory.TYPE]: 'SkillTreeCategory_scope',
			[SkillTree.TYPE]: 'SkillTree_scope',
			[Skill.TYPE]: 'Skill_scope',
			[TYPE_SKILL_LEVEL]: 'SkillLevel_scope',
			[TYPE_CHARACTER_LEVEL]: 'CharacterLevel_scope',
			[TYPE_SWITCH_DISPLAY_MODE]: 'SwitchDisplayMode_scope',
			[SkillTree.CATEGORY_EQUIPMENT]: 'SkillEquipment_scope',
			[TYPE_SKILL_RECORD]: 'SkillRecord_scope'
		};
		let node = this.MAIN_NODE.getElementsByClassName(SCOPE_NAME[type])[0];
		if ( !node ){
			node = document.createElement('div');
			node.classList.add(SCOPE_NAME[type]);
		}
		return node;
	}
	getSkillElementNoStr(ele){
		let nostr = '';
		while (ele.parent){
			nostr = ele.findLocation() + (nostr != "" ? "-" : "") + nostr;
			ele = ele.parent;
		}
		return nostr;
	}
	selectSkillElement(se_no){
		const nos = se_no.split("-");
		let cur = null;
		nos.forEach(function(no, i){
			no = parseInt(no, 10);
			switch (i){
				case 0:
					cur = this.skillRoot.skillTreeCategorys[no];
					break;
				case 1:
					cur = cur.skillTrees[no];
					break;
				case 2:
					cur = cur.skills[no];
					break;
				case 3:
					cur = cur.branchs[no];
					break;
			}
		}, this);
		return cur;
	}
	skillRecord(s){
		this.status.skillRecords.push(this.status.currentSkill);
		const {mainWeapon, subWeapon, bodyArmor} = this.status;
		this.status.skillEquipmentRecords.push({mainWeapon, subWeapon, bodyArmor});
		this.initCurrentSkill(s);
		//this.updateSkillHTML();
		this.initEquipmentScope(s.parent);
	}
	popSkillRecord(){
		this.initCurrentSkill(this.status.skillRecords.pop());
		this.initEquipmentScope(this.status.currentSkill.parent, this.status.skillEquipmentRecords.pop());
		//this.updateSkillHTML();
	}
	clearSkillRecord(){
		const t = this.status.skillRecords;
		t.splice(0, t.length);
	}
	equipmentCheck(eft, equip){
		/* 通用 */
		if ( eft.mainWeapon == -1 && eft.subWeapon == -1 && eft.bodyArmor == -1 )
			return true;

		/* 非通用 */

		// or
		if ( eft.config.equipmentConfirm === 0 ){
			if ( equip.mainWeapon != -1 && equip.mainWeapon == eft.mainWeapon || (eft.mainWeapon === 0 && equip.mainWeapon === 9 && eft.parent.effects.find(a => a.mainWeapon == 9) === void 0) )
				return true;
			if ( equip.subWeapon != -1 && equip.subWeapon == eft.subWeapon )
				return true;
			if ( equip.bodyArmor != -1 && equip.bodyArmor == eft.bodyArmor )
				return true;
			return false;
		}

		// and
		if ( eft.config.equipmentConfirm === 1 ){
			if ( equip.mainWeapon != eft.mainWeapon || (eft.mainWeapon === 0 && equip.mainWeapon === 9 && eft.parent.effects.find(a => a.mainWeapon == 9) !== void 0) )
				return false;
			if ( equip.subWeapon != eft.subWeapon )
				return false;
			if ( equip.bodyArmor != eft.bodyArmor )
				return false;
			return true;
		}
	}
	setCurrentEquipment(fieldname, value){
		const cur = this.status;
		if ( cur[fieldname] === void 0 ){
			console.warn("Unknow equipment field name");
			return;
		}
		if ( value !== -1 ){
			// 對應部位不能裝的武器類型清單
			// ['箭矢', '盾牌', '小刀', '魔導具', '拳套', '拔刀劍', '無裝備']
			/* [
				'單手劍', '雙手劍',
				'弓', '弩', '法杖',
				'魔導具',
				'拳套', '旋風槍',
				'拔刀劍', '雙劍',
				'空手'
			] */
			let disable_subw_of_mainw = [
				[5], [0, 1, 2, 3, 4, 5],
				[1, 2, 3, 4], [5], [3, 5],
				[0, 1, 2, 3, 4, 5],
				[4, 5], [1, 3, 4, 5],
				[1, 3, 4, 5], [0, 1, 2, 3, 4, 5],
				[5]
			];
			switch (fieldname){
				case 'mainWeapon':
					if ( disable_subw_of_mainw[value].indexOf(cur.subWeapon) !== -1 ){
						const t = this.getSkillElementScope(SkillTree.CATEGORY_EQUIPMENT).querySelector(`li[${strings().data_subWeapon}="-1"]`);
						t ? t.click() : cur.subWeapon = -1;
					}
					break;
				case 'subWeapon':
					if ( cur.mainWeapon !== -1 && disable_subw_of_mainw[cur.mainWeapon].indexOf(value) !== -1 ){
						const t = this.getSkillElementScope(SkillTree.CATEGORY_EQUIPMENT).querySelector(`li[${strings().data_mainWeapon}="-1"]`);
						t ? t.click() : cur.mainWeapon = -1;
					}
					break;
				//case 'bodyArmor':
			}
		}
		cur[fieldname] = value;

		this.getSkillElementScope(SkillTree.TYPE).querySelectorAll('.skill-circle').forEach(td => {
			const seno = td.getAttribute(strings().data_skillElementNo);
			if ( seno === null )
				return;
			const skill = this.selectSkillElement(seno);
			skill.effects.find(eft => this.equipmentCheck(eft, cur)) === void 0
				? td.classList.add('disable')
				: td.classList.remove('disable');
		});
	}
	initCurrentSkill(s){
		this.status.currentSkill = s;
		if ( s.checkData() ){
			CY.object.empty(this.status.stackValues);
			this.status.stackValues = null;
		}

		const archs_scope = this.getSkillElementScope(TYPE_SKILL_RECORD);
		archs_scope.classList.remove('hidden');
		if ( this.status.skillRecords.length > 0 )
			archs_scope.querySelector('.back-button').classList.remove('hidden');
		else
			archs_scope.querySelector('.back-button').classList.add('hidden');
		archs_scope.querySelector('div.current_skill').innerHTML = s.name;

		this.status.currentSkillHistoryDate = null;
		this.nodes.openSelectSkillHistoryDateButton.classList.remove('flip-icon');
	}
	updateSkillHTML(){
		const skill = this.status.currentSkill;
		if ( !skill )
			return;
		const scope = this.getSkillElementScope(Skill.TYPE);
		CY.element.removeAllChild(scope);
		scope.appendChild(this.createSkillQueryScopeHTML(skill, Skill.CATEGORY_MAIN));
	}
	initEquipmentScope(skilltree, equip){
		const t = this.createSkillQueryScopeHTML(skilltree, SkillTree.CATEGORY_EQUIPMENT);
		const equip_scope = this.getSkillElementScope(SkillTree.CATEGORY_EQUIPMENT);
		CY.element.removeAllChild(equip_scope);
		if ( t !== null ){
			equip_scope.appendChild(t);
			if ( equip ){
				Object.assign(this.status, equip);
			}
			// 更新裝備邏輯
			let temp = this.getSkillElementScope(SkillTree.CATEGORY_EQUIPMENT).querySelector(`li[${strings().data_bodyArmor}="${this.status.bodyArmor}"]`);
			if ( temp ) temp.click();
			temp = this.getSkillElementScope(SkillTree.CATEGORY_EQUIPMENT).querySelector(`li[${strings().data_mainWeapon}="${this.status.mainWeapon}"]`);
			if ( temp ) temp.click();
		}
	}
	createSkillQueryScopeHTML(sEle, /*const string*/category){
		const SE_TYPE = sEle !== null ? sEle.TYPE : category;
		//const type = sEle.TYPE.toString().match(/Symbol\((.+)\)/)[1];
		switch (SE_TYPE){
			case SkillRoot.TYPE: switch (category){
				case strings().menu: {
					const _C = this;
					const li_listener = function(event){
						const cur = this.parentNode.getElementsByClassName('cur')[0];
						if ( cur )
							cur.classList.remove('cur');
						this.classList.add('cur');
						const scope = _C.getSkillElementScope(SkillTreeCategory.TYPE);
						let loc = Array.from(this.parentNode.getElementsByTagName('li')).indexOf(this);
						let menu_list = _C.getSkillElementScope(SkillTreeCategory.TYPE).querySelectorAll('div._menu');
						const cur_menu = Array.from(menu_list).find(m => !m.classList.contains('hidden'));
						if ( cur_menu )
							cur_menu.classList.add('hidden');
						menu_list[loc].classList.remove('hidden');
						CY.element.removeAllChild(_C.getSkillElementScope(SkillTree.TYPE));
						CY.element.removeAllChild(_C.getSkillElementScope(Skill.TYPE));
						CY.element.removeAllChild(_C.getSkillElementScope(SkillTree.CATEGORY_EQUIPMENT));
						_C.getSkillElementScope(TYPE_SKILL_RECORD).classList.add('hidden');
						const t = menu_list[loc].querySelector('li.cur');
						if ( t )
							t.click();
					};
					const he = document.createElement('div');
					he.className = "_" + category;
					const frg = document.createDocumentFragment();
					sEle.skillTreeCategorys.forEach((stc) => {
						const li = simpleCreateHTML('li', null, stc.name);
						li.setAttribute(strings().data_skillElementNo, _C.getSkillElementNoStr(stc));
						li.addEventListener('click', li_listener);
						frg.appendChild(li);
					});
					const ul = document.createElement("ul");
					ul.appendChild(frg);
					he.appendChild(ul);
					return he;
				}
			}
			case SkillTreeCategory.TYPE: switch (category){
				case strings().menu: {
					const _C = this;
					const li_listener = function(event){
						const cur = this.parentNode.getElementsByClassName('cur')[0];
						if ( cur )
							cur.classList.remove('cur');
						this.classList.add('cur');
						const scope = _C.getSkillElementScope(SkillTree.TYPE);
						scope.innerHTML = "";
						const ele = _C.selectSkillElement(this.getAttribute(strings().data_skillElementNo));
						scope.appendChild(_C.createSkillQueryScopeHTML(ele, SkillTree.CATEGORY_DRAW_TREE));

						_C.initEquipmentScope(ele);

						CY.element.removeAllChild(_C.getSkillElementScope(Skill.TYPE));
						_C.getSkillElementScope(TYPE_SKILL_RECORD).classList.add('hidden');
						_C.status.currentSkill = null;
					};
					const he = simpleCreateHTML('div', ['_' + category, 'hidden', 'Cyteria', 'entrance', 'fade-in']);

					const frg = document.createDocumentFragment();
					sEle.skillTrees.forEach(function(st){
						const li = simpleCreateHTML('li', null, st.name);
						li.setAttribute(strings().data_skillElementNo, _C.getSkillElementNoStr(st));
						li.addEventListener("click", li_listener);
						frg.appendChild(li);
					});
					const ul = document.createElement("ul");
					ul.appendChild(frg);
					he.appendChild(ul);
					return he;
				}
			}
			case SkillTree.TYPE: switch (category){
				case SkillTree.CATEGORY_DRAW_TREE: {
					return DrawSkillTree(sEle, this);
				}
				case SkillTree.CATEGORY_EQUIPMENT: {
					const _C = this;
					const listener = function(event){
						const mw = this.getAttribute(strings().data_mainWeapon),
							sw = this.getAttribute(strings().data_subWeapon),
							ba = this.getAttribute(strings().data_bodyArmor);
						const ary = ['mainWeapon', 'subWeapon', 'bodyArmor'];
						const list = [mw, sw, ba];
						for (let i=0; i<list.length; ++i){
							const a = list[i];
							if ( a !== null && a !== '' ){
								_C.setCurrentEquipment(ary[i], parseInt(a, 10));
								this.parentNode.getElementsByClassName('cur')[0].classList.remove('cur');
								this.classList.add('cur');
								_C.updateSkillHTML();
								return;
							}
						}
					};
					const mainw = [], subw = [], armor = [];
					sEle.skills.forEach(skill => {
						skill.effects.forEach(sef => {
							const mw = sef.mainWeapon, sw = sef.subWeapon, ba = sef.bodyArmor;
							if ( mainw.indexOf(mw) == -1 )
								mainw.push(mw);
							if ( subw.indexOf(sw) == -1 )
								subw.push(sw);
							if ( armor.indexOf(ba) == -1 )
								armor.push(ba);
						});
					});

					const he = document.createDocumentFragment();
					//const ary = [this.status.mainWeapon, this.status.subWeapon, this.status.bodyArmor];
					const field_order = ['mainWeapon', 'subWeapon', 'bodyArmor'];
					[mainw, subw, armor].forEach((field, i) => {
						if ( field.length === 0 )
							return;
						if ( field.length != 1 || field[0] != -1 ){
							let icons, names, ftitle, attrkey;
							switch (field){
								case mainw:
									attrkey = strings().data_mainWeapon;
									ftitle = Lang('main weapon');
									icons = ['', '', '', '', '', '', '', '', '', '', ''];
									names = GetLang('Skill Query/Analysis Skill/Main Weapon List');
									break;
								case subw:
									attrkey = strings().data_subWeapon;
									ftitle = Lang('sub weapon');
									icons = ['', '', '', '', '', '', ''];
									names = GetLang('Skill Query/Analysis Skill/Sub Weapon List');
									break;
								case armor:
									attrkey = strings().data_bodyArmor;
									ftitle = Lang('body armor');
									icons = ['', '', '', ''];
									names = GetLang('Skill Query/Analysis Skill/Body Armor List');
									break;
							}
							let end = null, find_default_button = false;
							const ul = document.createElement('ul');
							field.forEach(a => {
								const li = document.createElement('li');
								li.setAttribute(attrkey, a);
								li.addEventListener('click', listener);
								if ( a != -1 ){
									li.innerHTML = `<span class="icon">${icons[a]}</span><span class="value">${names[a]}</span>`;
									ul.appendChild(li);
									if ( !find_default_button ){
										li.classList.add('cur');
										this.status[field_order[i]] = a;
										find_default_button = true;
									}
								}
								else {
									li.innerHTML = `<span class="icon"></span><span class="value">${Lang('equipment: unlimited')}</span>`;
									end = li;
								}
							});
							if ( end !== null )
								ul.appendChild(end);
							
							const t = document.createElement('div');
							const title = document.createElement('div');
							title.innerHTML = ftitle;
							t.appendChild(title);
							t.appendChild(ul);

							he.appendChild(t);
						}
					});
					return he.childElementCount != 0 ? he : null;
				}
			}
			case Skill.TYPE: switch (category){
				case Skill.CATEGORY_MAIN:
					return sEle.checkData() ? AnalysisSkill(this) : simpleCreateHTML('div', 'no_data', GetLang('Skill Query/Analysis Skill/no data'));
			}
			case TYPE_CHARACTER_LEVEL: {
				const _C = this;
				const left =  simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only', 'left'], Icons('sub'));
				const right = simpleCreateHTML('span', ['Cyteria', 'Button', 'border', 'icon-only', 'right'], Icons('add'));
				const mid = simpleCreateHTML('input', ['Cyteria', 'input', 'between-button', 'mid']);

				mid.value = this.status.characterLevel;

				const ctr_listener = function(event){
					const max = 190;
					const min = 0;
					let v = parseInt(mid.value, 10);
					switch ( this.getAttribute('data-ctr') ){
						case '-': v = v - 10; break;
						case '+': v = v + 10; break;
					}
					if ( v > max )
						v = max;
					else if ( v < min )
						v = min;
					mid.value = v;
					_C.status.characterLevel = v;
					_C.updateSkillHTML();
				};
				left.setAttribute('data-ctr', '-');
				left.addEventListener('click', ctr_listener);

				right.setAttribute('data-ctr', '+');
				right.addEventListener('click', ctr_listener);

				mid.type = 'number';
				mid.addEventListener('change', ctr_listener);
				mid.addEventListener('focus', function(event){
					this.select();
				});

				const main = document.createDocumentFragment();
				main.appendChild(simpleCreateHTML('div', 'title', GetLang('Skill Query/Analysis Skill/character level')));
				main.appendChild(left);
				main.appendChild(mid);
				main.appendChild(right);

				return main;
			}
			case TYPE_SKILL_LEVEL: {
				const _C = this;
				const listener = function(event){
					const skill = _C.status.currentSkill;
					this.parentNode.getElementsByClassName('cur')[0].classList.remove('cur');
					this.classList.add('cur');
					_C.status.skillLevel = parseInt(this.getAttribute(strings().data_skillLevel), 10);
					if ( skill !== null && skill !== void 0 )
						_C.updateSkillHTML();
				};
				const min = 1, max = 10;
				const he = document.createElement('ul');
				for (let i=min; i<=max; ++i){
					const li = simpleCreateHTML('li', ['Cyteria', 'Button', 'simple'], 'Lv. ' + i);
					li.setAttribute(strings().data_skillLevel, i);
					li.addEventListener('click', listener);
					if ( i == this.status.skillLevel )
						li.classList.add('cur');
					he.appendChild(li);
				}
				return he;
			}
			case TYPE_SWITCH_DISPLAY_MODE: {
				const _C = this;
				const he = document.createDocumentFragment();
				const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple'], Icons('switch') + '<span class="text">' + Lang('switch display') + '</span>');
				btn.addEventListener('click', function(event){
					_C.status.showOriginalFormula = _C.status.showOriginalFormula ? false : true;
					_C.updateSkillHTML();
				});
				he.appendChild(btn);
				return he;
			}
			case TYPE_SKILL_RECORD: {
				const _C = this;
				const he = document.createDocumentFragment();
				const back = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'icon-big', 'back-button', 'no-border', 'no-padding'], Icons('arrow-left') + `<span class="text">${GetLang('Skill Query/button text/back')}</span>`);
				back.addEventListener('click', function(event){
					_C.popSkillRecord();
				});
				const title = simpleCreateHTML('div', 'current_skill');
				he.appendChild(back);
				he.appendChild(simpleCreateHTML('div', 'tip', Lang('current skill')));
				he.appendChild(title);
				return he;
			}
		}
	}
	updateSelectSkillHistoryDateScope(date_ary){
		date_ary.sort((a, b) => {
			a = a.split('/').map(c => parseInt(c, 10));
			b = b.split('/').map(c => parseInt(c, 10));
			const da = new Date(a[0], a[1] - 1, a[2]),
				db = new Date(b[0], b[1] - 1, b[2]);
			return db >= da ? 1 : -1;
		});

		const btn = this.nodes.openSelectSkillHistoryDateButton;
		btn.classList[date_ary.length == 0 ? 'add': 'remove']('hidden');

		const last = date_ary[0] || '';
		btn.querySelector('.text').innerHTML = this.status.currentSkillHistoryDate || last;
		btn.setAttribute('data-last', last);

		const frg = document.createDocumentFragment();
		date_ary.forEach(p => {
			const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('clock-outline') + `<span class="text">${p}</span>`);
			btn.setAttribute('data-date', p);
			btn.addEventListener('click', this.listeners.setCurrentSkillHistoryDate);
			frg.appendChild(btn);
		});
		const clear = simpleCreateHTML('span', ['Cyteria', 'Button', 'line'], Icons('close') + `<span class="text">${GetLang('global/clear')}</span>`);
		clear.addEventListener('click', this.listeners.setCurrentSkillHistoryDate);
		frg.appendChild(clear);

		const scope = this.MAIN_NODE.querySelector('.select-skill-history-date > .content');
		CY.element.removeAllChild(scope);
		scope.appendChild(frg);
	}
}

export default SkillElementsController;