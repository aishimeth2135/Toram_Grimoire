import {GetLang, InitLanguageData, PageInitLanguage} from "../module/LanguageSystem.js";
import {PageInitFirst} from "../module/PageInit.js";
import CY from "../module/cyteria.js";
import Icons from "../module/SvgIcons.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

function readyFirst(){
    PageInitFirst();
    InitLanguageData({zh_tw, en, ja, zh_cn});

    const btn = CY.element.simpleCreateHTML('span', ['switch_branch_development_mode', 'Cyteria', 'scope-icon'],
        `${Icons('cards')}<span class="text">技能資料對照</span>`);
    const auth = document.querySelector('footer > .author-information');
    auth.insertBefore(btn, auth.firstChild);
}

function ready(setting){
    PageInitLanguage();
    document.title = GetLang('Page Title');
}

export {readyFirst, ready};