import {Skill, SkillEffect} from "./SkillElements.js";
import GetLang from "../../main/module/LanguageSystem.js";
import CY from "../../main/module/cyteria.js";
import StatBase from "../../CharacterSystem/module/StatBase.js";
import getBranchHTML from "./AnalysisSkill/getBranchHTML.js";
import {createSkillAttributeScope, getStackBranchIdKey, simpleCreateHTML, Lang} from "./AnalysisSkill/main.js";
import {TempSkillEffect, TempSkillBranch} from "./AnalysisSkill/TempSkillElement.js";
import strings from "./strings.js";
import {InitSkillBranch} from "./InitSkillData.js";

// /* 特殊屬性
//  * @none: 無條件去除該屬性。*/
// const GLOBAL_EXTRA_VALUE = {
// 	none: '@none'
// };


/**
 * 儲存被覆蓋前的 TempSkillEffect 鏡像
 * @param  {SkillEffect} sef 複製用的
 * @return {void}     branchDevelopmentController Object
 */
function branchDevelopmentController(sef, output){
	this.baseEffect = new TempSkillEffect().from(sef);
    this.currentOutput = new TempSkillEffect().from(output); // 複製一份尚未init的output
}
branchDevelopmentController.prototype = {
	/**
	 * 取得此分支覆蓋前後的細節。
	 * @param  {TempSkillBranch} branch 欲取得細節的分支
	 * @return {dom element}      HTML介面
	 */
	branchDetail(branch, currentBranch, is_default, is_exist){
		function getAttrEx(type){
			switch (type){
				case StatBase.TYPE_CONSTANT:
					return '';
				case StatBase.TYPE_MULTIPLIER:
					return '%';
				case StatBase.TYPE_TOTAL:
					return '~';
			}
		}
        const before_init = this.currentOutput.branchs[currentBranch.findLocation()];
		const cmp = branch.no !== '-'
            ? InitSkillBranch(this.baseEffect.branchs.find(b => b.no == branch.no))
            : branch;
		const he = simpleCreateHTML('div', 'dev_branchDetail');

		const top = simpleCreateHTML('div', 'top');
		top.appendChild(simpleCreateHTML('span', '_no', branch.no));
		top.appendChild(simpleCreateHTML('span', '_name', cmp.name));
		he.appendChild(top);

		const s1 = document.createElement('tbody');
		const title1_td = simpleCreateHTML('td', null, null, {colspan: cmp.stats.length !== 0 ? 3 : 2});
		title1_td.appendChild(simpleCreateHTML('div', '_title', Lang('branch development controller/title: default')));
		s1.appendChild(title1_td);

		Object.keys(cmp.branchAttributes).forEach(k => {
			const t = document.createElement('tr');
			t.appendChild(simpleCreateHTML('td', '_name', k));
			const v = simpleCreateHTML('td', '_value', cmp.branchAttributes[k]);
			if ( cmp.stats.length !== 0 )
				v.setAttribute('colspan', 2);
			t.appendChild(v); 
			if ( before_init.branchAttributes[k] === void 0 )
				t.classList.add('by_default');
			if ( branch.branchAttributes[k] !== void 0 && branch.branchAttributes[k] !== cmp.branchAttributes[k] )
				t.classList.add('overwrite');
			s1.appendChild(t);
		});
		cmp.stats.forEach(a => {
			const t = document.createElement('tr');
			t.appendChild(simpleCreateHTML('td', '_name', a.base.baseName));
			t.appendChild(simpleCreateHTML('td', '_value', a.statValue()));
			t.appendChild(simpleCreateHTML('td', '_extra', getAttrEx(a.type)));
			if ( branch.stats.find(b => a.base === b.base && a.type === b.type && a.statValue() != b.statValue()) )
				t.classList.add('overwrite');
			s1.appendChild(t);
		});
		if ( !is_default && branch.no !== '-' && is_exist ){
			const s2 = document.createDocumentFragment();
			const title2_td = simpleCreateHTML('td', null, null, {colspan: branch.stats.length !== 0 ? 3 : 2});
			title2_td.appendChild(simpleCreateHTML('div', '_title', Lang('branch development controller/title: not default')));
			s2.appendChild(title2_td);
			Object.keys(branch.branchAttributes).forEach(k => {
				const t = document.createElement('tr');
				t.appendChild(simpleCreateHTML('td', '_name', k));
				const v = simpleCreateHTML('td', '_value', branch.branchAttributes[k]);
				if ( branch.stats.length !== 0 )
					v.setAttribute('colspan', 2);
				t.appendChild(v); 
				s2.appendChild(t);
			});
			branch.stats.forEach(a => {
				const t = document.createElement('tr');
				t.appendChild(simpleCreateHTML('td', '_name', a.base.baseName));
				t.appendChild(simpleCreateHTML('td', '_value', a.statValue()));
				t.appendChild(simpleCreateHTML('td', '_extra', getAttrEx(a.type)));
				s2.appendChild(t);
			});
			s1.appendChild(s2);
		}
		const table1 = document.createElement('table');
		table1.appendChild(s1);
		he.appendChild(table1);
		return he;
	}
};

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
		[SkillEffect.MP_COST]: Lang('mp cost'),
		[SkillEffect.RANGE]: Lang('range'),
		[SkillEffect.SKILL_TYPE]: Lang('skill type'), 
		[SkillEffect.DAMAGE_TYPE]: Lang('damage type'),
		[SkillEffect.PORATION_TYPE]: Lang('poration type'),
		[SkillEffect.IN_COMBO]: Lang('in combo'),
		[SkillEffect.ACTION_TIME]: Lang('action time'),
		[SkillEffect.CASTING_TIME]: ['', Lang('casting time'), Lang('charging time')]
	};
	const TEXT_LIST = {
		[SkillEffect.SKILL_TYPE]: Lang('skill type: List'),
		[SkillEffect.DAMAGE_TYPE]: Lang('damage type: List'),
		[SkillEffect.PORATION_TYPE]: Lang('poration type: List'),
		[SkillEffect.IN_COMBO]: Lang('in combo: List'),
		[SkillEffect.ACTION_TIME]: Lang('action time: List')
	};

	const {SLv, CLv} = data;

	let title = TITLE_DATA[attr_name],
		v = sef.attributes[attr_name],
		tail = null;
	const icon = !Array.isArray(ICON_DATA[attr_name]) ? ICON_DATA[attr_name] : ICON_DATA[attr_name][v];
	switch (attr_name){
		case SkillEffect.CASTING_TIME:
			title = TITLE_DATA[attr_name][sef.attributes[SkillEffect.SKILL_TYPE]];
			tail = GetLang('global/second');
		case SkillEffect.MP_COST:
			v = safeEval(v);
			break;
		case SkillEffect.RANGE:
			v = v != '-' ? safeEval(v) + 'm' : Lang('range: no limit');
			break;
		case SkillEffect.SKILL_TYPE:
		case SkillEffect.IN_COMBO:
		case SkillEffect.ACTION_TIME:
			v = TEXT_LIST[attr_name][v];
			break;
	}

	const he = createSkillAttributeScope(icon, title, v, tail);

	return he;
}


function beforeExport(he, data){
    const ctrr = data.skillRoot.controller;
    const skill_text_button_listener = function(event){
        const scope = ctrr.currentData.skill_from_where_scope;
        CY.element.removeAllChild(scope);
        scope.classList.remove('hidden');

        let temp_scope = this.querySelector("div.temp");
        if ( !temp_scope ){
            temp_scope = simpleCreateHTML('div', 'temp');
            this.appendChild(temp_scope);
        }

        temp_scope.appendChild(scope);

        const skill_scope = ctrr.getSkillElementScope(Skill.TYPE);
        const remv = CY.element.convertRemToPixels(1);
        const vr = this.getBoundingClientRect();
        const pvr = scope.getBoundingClientRect();
        const spvr = skill_scope.getBoundingClientRect();
        let x = vr.left - spvr.left, y = vr.top,
            w = pvr.width, mw = spvr.width,
            h = pvr.height, mh = window.innerHeight;
        scope.style.left = "0";
        if ( x + pvr.width > mw - remv ) // 超過右邊界
            scope.style.left = ((mw -1*w - x)/remv - 0.5) + "rem";
        else if ( x < pvr.width ) // 超過左邊界
            scope.style.left = (-1*x/remv + 0.5) + "rem";
            
        if ( y > mh/2 )
            scope.style.top = ((-1*h)/remv - 0.5) + "rem";
        else 
            scope.style.top = (vr.height/remv + 0.5) + "rem";

        const skill = ctrr.selectSkillElement(this.getAttribute(strings().data_skillElementNo));
        scope.appendChild(createSkillAttributeScope(null, GetLang('Skill Query/Skill Element/skill tree: from'), skill.parent.name));
        const btns = simpleCreateHTML('div', 'button_scope');
        const cancel = simpleCreateHTML('span', 'global_button_1', GetLang('global/cancel'));
        cancel.addEventListener('click', function(event){
            this.parentNode.parentNode.classList.add('hidden');
            event.stopPropagation();
        });
        const to_skill = simpleCreateHTML('span', 'global_button_1',Lang('button text/to skill'));
        to_skill.addEventListener('click', function(event){
            this.parentNode.parentNode.classList.add('hidden');
            ctrr.skillRecord(skill);
            event.stopPropagation();
        });
        btns.appendChild(cancel);
        btns.appendChild(to_skill);
        scope.appendChild(btns);
    }

    he.querySelectorAll('span.skill_from_where_button').forEach(btn => btn.addEventListener('click', skill_text_button_listener));

    function hiddenSubCaption(event){
        const scope1 = this.parentNode.querySelector('div.scope1');
        scope1.classList.toggle('hidden');
        this.querySelector('.open').classList.toggle('hidden');
        this.querySelector('.close').classList.toggle('hidden');
    }
    he.querySelectorAll('div.content > div.scope1').forEach(sc1 => {
        if ( sc1.parentNode.classList.contains('content_line') || sc1.childElementCount === 0 )
            return;
        const btn = simpleCreateHTML('span', 'hidden_toggle_button',
            '<span class="close hidden"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg></span><span class="open"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.12 14.71L12 10.83l3.88 3.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L12.7 8.71c-.39-.39-1.02-.39-1.41 0L6.7 13.3c-.39.39-.39 1.02 0 1.41.39.38 1.03.39 1.42 0z"/></svg></span>');

        btn.addEventListener('click', hiddenSubCaption);
        sc1.parentNode.insertBefore(btn, sc1.parentNode.firstChild);

        btn.click();
    });
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

	let overwrite_eft;

	let find = false;
	skill.effects.forEach(function(eft){
		if ( find ) return;
		if ( data.skillRoot.controller.equipmentCheck(eft, data) ){
			if ( eft != skill.defaultEffect )
				output.overWrite(eft);
			overwrite_eft = eft;
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
			// 初始化
            const branchDevelopmentMode = data.branchDevelopmentMode;
            let branchDevCtr = null;
            if ( branchDevelopmentMode )
                branchDevCtr = new branchDevelopmentController(skill.defaultEffect, output);
			output.branchs.forEach(b => InitSkillBranch(b));
			
			if ( data.stackValues === null ){
				data.stackValues = {};
				CY.object.empty(data.stackNames);
				output.branchs.forEach(branch => {
					if ( branch.name == 'stack' ){
						const _attr = branch.branchAttributes;
						const v = _attr['default'] == 'auto' ? _attr['min'] : _attr['default'];
						data.stackValues[getStackBranchIdKey(branch)] = v;
						data.stackNames[getStackBranchIdKey(branch)] = branch.branchAttributes['name'];
					}
				});
			}
			const stackValues = data.stackValues,
				stackNames = data.stackNames,
				showOriginalFormula = data.showOriginalFormula,
				skillRoot = data.skillRoot;

			let temp_html= null;
			output.branchs.forEach(branch => {
				const t = getBranchHTML(branch, {
					SLv, CLv, stackNames, stackValues, showOriginalFormula,
					skillRoot, branchDevelopmentMode
				});
				if ( t !== null ){
					if ( temp_html !== null )
						two.appendChild(temp_html);
					temp_html = t;
				}
				if ( branchDevelopmentMode ){
					const is_default = overwrite_eft === skill.defaultEffect;
					let _t = overwrite_eft.branchs.find(b => branch.no == b.no);
					two.appendChild(branchDevCtr.branchDetail(
						( !is_default && _t ) ? _t : branch, branch,
                        is_default, _t !== void 0
					));
				}
			});
			if ( temp_html !== null )
				two.appendChild(temp_html);
		}
		else {
			const t = document.createElement('div');
			t.classList.add('no_data');
			t.innerHTML = Lang('no data');
			two.appendChild(t);
		}
		frg.appendChild(two);

		beforeExport(frg, data);

		return frg;
	}
	else {
		const div = document.createElement('div');
		div.classList.add('no_data');
		div.innerHTML = Lang('equipment not confirm');
		return div;
	}
};