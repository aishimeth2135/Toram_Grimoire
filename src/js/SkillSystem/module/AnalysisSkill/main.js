import GetLang from "../../../main/module/LanguageSystem.js";
import CY from "../../../main/module/cyteria.js";

const simpleCreateHTML = CY.element.simpleCreateHTML;

const GLOBAL_ICON_DATA = {
    Sword: '',
    Staff: ''
};

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

function getStackBranchIdKey(stk){
    return 'id' + stk.branchAttributes['id'];
}

function Lang(s){
    return GetLang("Skill Query/Analysis Skill/" + s);
}

export {createSkillAttributeScope, getStackBranchIdKey, simpleCreateHTML, GLOBAL_ICON_DATA, Lang};