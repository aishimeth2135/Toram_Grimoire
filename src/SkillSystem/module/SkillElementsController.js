import {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import {SkillTreeTable, SkillTreeTableData} from "./SkillTreeTable.js";
import AnalysisSkill from "./AnalysisSkill.js";

import {ConvertLangText, toLangText} from "../../main/module/LangText.js";
import strings from "./strings.js";

import cy from "../../main/module/cyteria.js";

const TYPE_SKILL_LEVEL = Symbol(),
	TYPE_CHARACTER_LEVEL = Symbol();
/*
Interface Controller {
	HTMLElement createSkillQueryScopeHTML(const string type);
}
*/
function Controller(sr){
/* implements Controller */
	this.MAIN_NODE = null;
	this.skillRoot = sr;
	this.currentData = {
		mainWeapon: -1,
		subWeapon: -1,
		bodyArmor: -1,
		skillLevel: 10,
		characterLevel: 185,
		currentSkill: null,
		stackValues: {}
	};
}
Controller.prototype = {
	initSkillQueryHTML(main_node){
		const sr = this.skillRoot;
		this.MAIN_NODE = main_node;
		const order = [
			SkillRoot.TYPE, SkillTreeCategory.TYPE, SkillTree.TYPE,
			TYPE_SKILL_LEVEL, TYPE_CHARACTER_LEVEL, Skill.CATEGORY_EQUIPMENT, Skill.TYPE
		];
		const frg = document.createDocumentFragment();
		order.forEach(function(a){
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
				case TYPE_SKILL_LEVEL:
				case TYPE_CHARACTER_LEVEL:
					t.appendChild(this.createSkillQueryScopeHTML(null, a));
					break;
			}
		}, this);

		main_node.appendChild(frg);
	},
	getSkillElementScope(type){
		const SCOPE_NAME = {
			[SkillRoot.TYPE]: 'SkillRoot_scope',
			[SkillTreeCategory.TYPE]: 'SkillTreeCategory_scope',
			[SkillTree.TYPE]: 'SkillTree_scope',
			[Skill.TYPE]: 'Skill_scope',
			[TYPE_SKILL_LEVEL]: 'SkillLevel_scope',
			[TYPE_CHARACTER_LEVEL]: 'CharacterLevel_scope',
			[Skill.CATEGORY_EQUIPMENT]: 'SkillEquipment_scope'
		};
		let node = this.MAIN_NODE.getElementsByClassName(SCOPE_NAME[type])[0];
		if ( !node ){
			node = document.createElement('div');
			node.classList.add(SCOPE_NAME[type]);
		}
		return node;
	},
	/*| @param SkillElement ele */
	getSkillElementNoStr(ele){
		let nostr = '';
		while (ele.parent){
			nostr = ele.findLocation() + (nostr != "" ? "-" : "") + nostr;
			ele = ele.parent;
		}
		return nostr;
	},
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
	},
	updateSkillHTML(){
		const skill = this.currentData.currentSkill;
		if ( !skill )
			return;
		const scope = this.getSkillElementScope(Skill.TYPE);
		cy.element.removeAllChild(scope);
		scope.appendChild(this.createSkillQueryScopeHTML(skill, Skill.CATEGORY_MAIN));
		ConvertLangText(scope);
	},
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
						cy.element.removeAllChild(_C.getSkillElementScope(SkillTree.TYPE));
						cy.element.removeAllChild(_C.getSkillElementScope(Skill.TYPE));
						cy.element.removeAllChild(_C.getSkillElementScope(Skill.CATEGORY_EQUIPMENT));
						const t = menu_list[loc].querySelector('li.cur');
						if ( t )
							t.click();
					};
					const he = document.createElement('div');
					he.className = "_" + category;
					const frg = document.createDocumentFragment();
					sEle.skillTreeCategorys.forEach((stc) => {
						const li = document.createElement('li');
						li.innerHTML = toLangText(stc.name);
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
						scope.appendChild(_C.createSkillQueryScopeHTML(ele, SkillTree.CATEGORY_TABLE));
						ConvertLangText(scope);
						cy.element.removeAllChild(_C.getSkillElementScope(Skill.TYPE));
						cy.element.removeAllChild(_C.getSkillElementScope(Skill.CATEGORY_EQUIPMENT));
					};
					const he = document.createElement("div");
					he.className = '_' + category;
					he.classList.add('hidden');
					const frg = document.createDocumentFragment();
					sEle.skillTrees.forEach(function(st){
						const li = document.createElement("li");
						li.innerHTML = toLangText(st.name);
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
				case SkillTree.CATEGORY_TABLE: {
					const st = sEle;
					const stcn = st.parent.findLocation(), stn = st.findLocation();
					const _C = this;
					const td_listener = function(event){
						const s = _C.selectSkillElement(this.getAttribute(strings().data_skillElementNo));
						if ( _C.currentData.currentSkill === s )
							return;
						const cur = this.parentNode.parentNode.getElementsByClassName('cur')[0];
						if ( cur )
							cur.classList.remove('cur');
						this.classList.add('cur');

						_C.currentData.currentSkill = s;
						if ( s.checkData() ){
							cy.object.empty(_C.currentData.stackValues);
							_C.currentData.stackValues = null;
							const {mainWeapon, subWeapon, bodyArmor} = s.defaultEffect;
							Object.assign(_C.currentData, {mainWeapon, subWeapon, bodyArmor});
						}

						const t = _C.createSkillQueryScopeHTML(s, Skill.CATEGORY_EQUIPMENT);
						const scope = _C.getSkillElementScope(Skill.CATEGORY_EQUIPMENT);
						cy.element.removeAllChild(scope);
						if ( t !== null ){
							scope.appendChild(t);
							ConvertLangText(scope);
						}
						_C.updateSkillHTML();
					};
					const he = SkillTreeTable(SkillTreeTableData(stcn, stn));
					let cnt = -1;
					Array.from(he.getElementsByTagName('td')).forEach(function(td){
						if ( td.getAttribute('data-empty') == '1' )
							return;
						++cnt;
						const s = st.skills[cnt];
						if ( s === void 0 ){
							td.innerHTML = '-';
							return;
						}
						if ( s.name == '@lock' ){
							td.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="M0 0h24v24H0V0z"/><path opacity=".87" d="M0 0h24v24H0V0z"/></g><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/></svg>';
							return;
						}
						td.innerHTML = toLangText(s.name);
						td.setAttribute(strings().data_skillElementNo, _C.getSkillElementNoStr(s));
						td.addEventListener('click', td_listener);
					});
					return he;
				}
			}
			case Skill.TYPE: switch (category){
				case Skill.CATEGORY_MAIN: {
					if ( sEle.checkData() ){
						return AnalysisSkill(this.currentData);	
					}
					const div = document.createElement('div');
					div.classList.add('no_data');
					div.innerHTML = '此技能資料尚未更新。';
					return div;
				}
				case Skill.CATEGORY_EQUIPMENT: {
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
								_C.currentData[ary[i]] = parseInt(a, 10);
								this.parentNode.getElementsByClassName('cur')[0].classList.remove('cur');
								this.classList.add('cur');
								_C.updateSkillHTML();
								return;
							}
						}
					};
					const mainw = [], subw = [], armor = [];
					sEle.effects.forEach(sef => {
						const mw = sef.mainWeapon, sw = sef.subWeapon, ba = sef.bodyArmor;
						if ( mainw.indexOf(mw) == -1 )
							mainw.push(mw);
						if ( subw.indexOf(sw) == -1 )
							subw.push(sw);
						if ( armor.indexOf(ba) == -1 )
							armor.push(ba);
					});
					const he = document.createDocumentFragment();
					const ary = [this.currentData.mainWeapon, this.currentData.subWeapon, this.currentData.bodyArmor];
					[mainw, subw, armor].forEach((field, i) => {
						if ( field.length != 1 || field[0] != -1 ){
							let icons, names, ftitle, attrkey;
							switch (field){
								case mainw:
									attrkey = strings().data_mainWeapon;
									ftitle = 'Main Weapon|,|主手武器';
									icons = ['', '', '', '', '', '', '', '', '', ''];
									names = ['單手劍', '雙手劍', '弓', '弩', '法杖', '魔導具', '拳套', '旋風槍', '拔刀劍', '雙劍'];
									break;
								case subw:
									attrkey = strings().data_subWeapon;
									ftitle = 'Sub Weapon|,|副手武器';
									icons = ['', '', '', '', '', ''];
									names = ['箭矢', '盾牌', '小刀', '魔導具', '套', '拔刀劍'];
									break;
								case armor:
									attrkey = strings().data_bodyArmor;
									ftitle = 'Body Armor|,|身體裝備';
									icons = ['', '', ''];
									names = ['輕量化', '重量化', '一般'];
									break;
							}
							let end = null;
							const ul = document.createElement('ul');
							field.forEach(a => {
								const li = document.createElement('li');
								if ( ary[i] == a )
									li.classList.add('cur');
								li.setAttribute(attrkey, a);
								li.addEventListener('click', listener);
								if ( a != -1 ){
									li.innerHTML = `<span class="icon">${icons[a]}</span><span class="value">${toLangText(names[a])}</span>`;
									ul.appendChild(li);
								}
								else {
									li.innerHTML = `<span class="icon"></span><span class="value">${toLangText('None|,|無限制')}</span>`;
									end = li;
								}
							});
							if ( field === mainw ){
								if ( mainw.indexOf(0/*單手劍*/) !== -1 && mainw.indexOf(9/*雙劍*/) === -1 ){
									// 創建一個外觀為「雙劍」實為「單手劍」的按鈕
									const li = document.createElement('li');
									li.innerHTML = `<span class="icon">${icons[9]}</span><span class="value">${toLangText(names[9])}</span>`;
									li.setAttribute(attrkey, 0);
									ul.appendChild(li);
									li.addEventListener('click', listener);
								}
							}
							if ( end !== null )
								ul.appendChild(end);
							
							const t = document.createElement('div');
							const title = document.createElement('div');
							title.innerHTML = toLangText(ftitle);
							t.appendChild(title);
							t.appendChild(ul);

							he.appendChild(t);
						}
					});
					return he.childElementCount != 0 ? he : null;
				}
			}
			case TYPE_CHARACTER_LEVEL: {
				const _C = this;
				const left =  cy.element.simpleCreateHTML('span', 'left', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13H6c-.55 0-1-.45-1-1s.45-1 1-1h12c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>');
				const right = cy.element.simpleCreateHTML('span', 'right', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>');
				const mid = cy.element.simpleCreateHTML('input', 'mid');

				mid.value = this.currentData.characterLevel;

				const ctr_listener = function(event){
					const max = 185;
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
					_C.currentData.characterLevel = v;
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
				main.appendChild(cy.element.simpleCreateHTML('div', 'title', toLangText('Character Level|,|角色等級')));
				main.appendChild(left);
				main.appendChild(mid);
				main.appendChild(right);

				return main;
			}
			case TYPE_SKILL_LEVEL: {
				const _C = this;
				const listener = function(event){
					const skill = _C.currentData.currentSkill;
					this.parentNode.getElementsByClassName('cur')[0].classList.remove('cur');
					this.classList.add('cur');
					_C.currentData.skillLevel = parseInt(this.getAttribute(strings().data_skillLevel), 10);
					if ( skill !== null && skill !== void 0 )
						_C.updateSkillHTML();
				};
				const min = 1, max = 10;
				const he = document.createElement('ul');
				for (let i=min; i<=max; ++i){
					const li = document.createElement('li');
					li.innerHTML = 'Lv. ' + i;
					li.setAttribute(strings().data_skillLevel, i);
					li.addEventListener('click', listener);
					if ( i == this.currentData.skillLevel )
						li.classList.add('cur');
					he.appendChild(li);
				}
				return he;
			}
		}
	}
};

export default Controller;