import {SkillRoot, SkillTreeCategory, SkillTree, Skill, SkillEffect, SkillBranch} from "./SkillElements.js";
import {SkillTreeTable, SkillTreeTableData} from "./SkillTreeTable.js";
import AnalysisSkill from "./AnalysisSkill.js";

import {ConvertLangText, toLangText} from "../../main/module/LangText.js";
import strings from "./strings.js";

/*
****Interface Controller {
****	HTMLElement createSkillQueryScopeHTML(const string type);
****}
*/

function Controller(sr){
/* implements Controller */
	this.MAIN_NODE = null;
	this.skillRoot = sr;
}
Controller.prototype = {
	initSkillQueryHTML(main_node){
		const sr = this.skillRoot;
		this.MAIN_NODE = main_node;
		this.SCOPE_NAME = {
			SkillRoot: 'SkillRoot_scope',
			SkillTreeCategory: 'SkillTreeCategory_scope',
			SkillTree: 'SkillTree_scope',
			Skill: 'Skill_scope'
		};
		const frg = document.createDocumentFragment();

		/* Skill Root */
		const _SkillRoot_scope = document.createElement('div');
		_SkillRoot_scope.classList.add(this.SCOPE_NAME.SkillRoot);
		_SkillRoot_scope.appendChild(this.createSkillQueryScopeHTML(sr, strings().menu));
		frg.appendChild(_SkillRoot_scope);

		/* Skill Tree Category */
		const _SkillTreeCategory_scope = document.createElement('div');
		_SkillTreeCategory_scope.classList.add(this.SCOPE_NAME.SkillTreeCategory);
		sr.skillTreeCategorys.forEach(function(stc){
			_SkillTreeCategory_scope.appendChild(this.createSkillQueryScopeHTML(stc, strings().menu));
		}, this);
		frg.appendChild(_SkillTreeCategory_scope);

		/* Skill Tree */
		const _SkillTree_scope = document.createElement('div');
		_SkillTree_scope.classList.add(this.SCOPE_NAME.SkillTree);
		frg.appendChild(_SkillTree_scope);

		/* Skill */
		const _Skill_scope = document.createElement('div');
		_Skill_scope.classList.add(this.SCOPE_NAME.Skill);
		frg.appendChild(_Skill_scope);

		main_node.appendChild(frg);
	},
	getSkillElementScope(type){
		switch (type){
			case SkillRoot.type:
				return this.MAIN_NODE.getElementsByClassName(this.SCOPE_NAME.SkillRoot)[0];
			case SkillTreeCategory.TYPE:
				return this.MAIN_NODE.getElementsByClassName(this.SCOPE_NAME.SkillTreeCategory)[0];
			case SkillTree.TYPE:
				return this.MAIN_NODE.getElementsByClassName(this.SCOPE_NAME.SkillTree)[0];
			case Skill.TYPE:
				return this.MAIN_NODE.getElementsByClassName(this.SCOPE_NAME.Skill)[0];
		}
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
	/*| @param string cmdstr : string of command */
	command(cmdstr){
		let match = cmdstr.match(/@([^:]+)\s*:\s*(.+)/);
		let cmd = match[1], data = match[2];
		switch (cmd){
			case "select_se": {
				let nos = data.split("-");
				let cur = null;
				nos.forEach(function(no, i){
					no = parseInt(no);
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
			default:
				console.log("unknow command");
		}
	},
	createSkillQueryScopeHTML(sEle, /*const string*/category){
		const SE_TYPE = sEle.TYPE;
		//const type = sEle.TYPE.toString().match(/Symbol\((.+)\)/)[1];
		switch (SE_TYPE){
			case SkillRoot.TYPE: switch (category){
				case strings().menu: {
					const _C = this;
					const li_listener = function(event){
						const _root = this.parentNode.parentNode;
						const cur = _root.querySelector('ul > .cur');
						if ( cur ) cur.classList.remove('cur');
						const scope = _root.parentNode.getElementsByClassName("SkillTreeCategory_scope")[0];
						let loc = Array.from(this.parentNode.getElementsByTagName('li')).indexOf(this);
						let menu_list = _C.getSkillElementScope(SkillTreeCategory.TYPE).querySelectorAll('div._menu');
						const cur_menu = Array.from(menu_list).find(m => !m.classList.contains('hidden'));
						if ( cur_menu ) cur_menu.classList.add('hidden');
						menu_list[loc].classList.remove('hidden');
						this.classList.add('cur');
					};
					const he = document.createElement('div');
					he.className = "_" + category;
					const frg = document.createDocumentFragment();
					sEle.skillTreeCategorys.forEach((stc) => {
						const li = document.createElement('li');
						li.innerHTML = toLangText(stc.name);
						li.setAttribute(strings().seNo, _C.getSkillElementNoStr(stc));
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
						const _root = this.parentNode.parentNode;
						const cur = _root.querySelector('ul > .cur');
						if (cur)
							cur.classList.remove('cur');
						const scope = _C.getSkillElementScope(SkillTree.TYPE);
						scope.innerHTML = "";
						const ele = _C.command("@select_se: " + this.getAttribute(strings().seNo));
						scope.appendChild(_C.createSkillQueryScopeHTML(ele, SkillTree.CATEGORY_TABLE));
						this.classList.add('cur');
					};
					const he = document.createElement("div");
					he.className = '_' + category;
					he.classList.add('hidden');
					const frg = document.createDocumentFragment();
					sEle.skillTrees.forEach(function(st){
						const li = document.createElement("li");
						li.innerHTML = toLangText(st.name);
						li.setAttribute(strings().seNo, _C.getSkillElementNoStr(st));
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
						const s = _C.command('@select_se:' + this.getAttribute(strings().seNo));
						const scope = _C.getSkillElementScope(Skill.TYPE);
						scope.innerHTML = '';
						scope.appendChild(_C.createSkillQueryScopeHTML(s, Skill.CATEGORY_MAIN));
						ConvertLangText(scope);
					};
					const he = SkillTreeTable(SkillTreeTableData(stcn, stn));
					Array.from(he.getElementsByTagName('td')).forEach(function(td, i){
						const s = st.skills[i];
						if ( !s ){
							td.innerHTML = '-';
							return;
						}
						td.innerHTML = s.name;
						td.setAttribute(strings().seNo, _C.getSkillElementNoStr(s));
						td.addEventListener('click', td_listener);
					});
					return he;
				}
			}
			case Skill.TYPE: switch (category){
				case Skill.CATEGORY_MAIN: {
					if ( sEle.checkData() ){
						const {mainWeapon, subWeapon, bodyArmor} = sEle.defaultEffect;
						return AnalysisSkill(sEle, {mainWeapon, subWeapon, bodyArmor});	
					}
					const div = document.createElement('div');
					div.classList.add('no_data');
					div.innerHTML = '此技能資料尚未更新。';
					return div;
				}
			}
		}
	}
};

export default Controller;