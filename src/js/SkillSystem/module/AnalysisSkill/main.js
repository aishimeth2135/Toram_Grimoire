import GetLang from "../../../main/module/LanguageSystem.js";
import CY from "../../../main/module/cyteria.js";
import {SkillEffect} from "../SkillElements.js";

const simpleCreateHTML = CY.element.simpleCreateHTML;

function createSkillAttributeScope(icon, t, v, tail){
    const a = simpleCreateHTML('div', 'skill-attribute');

    let html = '';
    if ( icon !== null )
        html += icon;
    if ( t !== null )
        html += '<span class="text">' + t + '</span>';
    if ( html !== '' )
        a.appendChild(simpleCreateHTML('span', ['Cyteria', 'scope-icon'], html));

    if ( v !== null && v !== void 0 )
        a.appendChild(simpleCreateHTML('span', 'value', v));
    if ( tail !== null && tail !== void 0 )
        a.appendChild(simpleCreateHTML('span', 'tail', tail));
    return a;
}

function getSkillAttributeData(){
    const ICON_DATA = {
        [SkillEffect.MP_COST]: 'water',
        [SkillEffect.RANGE]: 'target',
        [SkillEffect.SKILL_TYPE]: 'rhombus-split',
        [SkillEffect.IN_COMBO]: ['selection-ellipse-arrow-inside', 'forbid', 'numeric-1-circle-outline'],
        [SkillEffect.ACTION_TIME]: 'time-sand-fill',
        [SkillEffect.CASTING_TIME]: 'clock-arrow'
    };
    const TITLE_DATA = {
        [SkillEffect.MP_COST]: Lang('mp cost'),
        [SkillEffect.RANGE]: Lang('range'),
        [SkillEffect.SKILL_TYPE]: Lang('skill type'), 
        [SkillEffect.IN_COMBO]: Lang('in combo'),
        [SkillEffect.ACTION_TIME]: Lang('action time'),
        [SkillEffect.CASTING_TIME]: ['', Lang('casting time'), Lang('charging time')]
    };
    const TEXT_LIST = {
        [SkillEffect.SKILL_TYPE]: Lang('skill type: List'),
        [SkillEffect.IN_COMBO]: Lang('in combo: List'),
        [SkillEffect.ACTION_TIME]: Lang('action time: List')
    };

    return {ICON_DATA, TITLE_DATA, TEXT_LIST};
}

function getStackBranchIdKey(stk){
    return 'id' + stk.branchAttributes['id'];
}

function Lang(s){
    return GetLang("Skill Query/Analysis Skill/" + s);
}

export {createSkillAttributeScope, getStackBranchIdKey, simpleCreateHTML, Lang, getSkillAttributeData};