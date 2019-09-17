import {GetLang, InitLanguageData, PageInitLanguage} from "../module/LanguageSystem.js";
import {PageInitFirst} from "../module/PageInit.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

function readyFirst(){
    PageInitFirst();
    InitLanguageData({zh_tw, en, ja, zh_cn});
}

function ready(setting){
    PageInitLanguage();

    document.title = GetLang('Page Title');
}

export {readyFirst, ready};