import {GetLang, InitLanguageData, PageInitLanguage} from "../module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";

function readyFirst(){
    InitLanguageData({zh_tw, en, ja});
    if ( localStorage['main-font-family'] !== '1' )
        document.querySelector('body').classList.add('font1');
}

function ready(setting){
    PageInitLanguage();

    document.title = GetLang('Page Title');
}

export {readyFirst, ready};