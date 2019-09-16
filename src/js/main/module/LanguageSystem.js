import zh_tw from "./LanguageData/zh_tw.js";
import en from "./LanguageData/en.js";
import ja from "./LanguageData/ja.js";
import zh_cn from "./LanguageData/zh_cn.js";

import CY from "./cyteria.js";

let currentLanguageNo = 0, secondLanguageNo = 1;

const LanguageData = {};

function AutoSetCurrentLanguage(){
    const lang = (window.navigator.language || window.navigator.userLanguage).toLowerCase();
    let no = 0;
    switch (lang){
        case 'zh-tw':
        case 'zh-hk':
        case 'zh-sg':
            no = 1;
            break;
        case 'ja':
            no = 2;
            break;
        case 'zh-cn':
            no = 3;
            break;
    }
    currentLanguageNo = no;
}

function InitLanguageSystem(){
    // Init
    if ( CY.storageAvailable('localStorage') ){
        // default
        if ( !localStorage['Language-Setting'] )
            localStorage['Language-Setting'] = 'auto';
        if ( !localStorage['Second-Language-Setting'] )
            localStorage['Second-Language-Setting'] = '0';

        const current_language_setting = localStorage['Language-Setting'];
        if ( current_language_setting == 'auto' )
            AutoSetCurrentLanguage();
        else
            currentLanguageNo = parseInt(current_language_setting, 10);

        secondLanguageNo = parseInt(localStorage['Second-Language-Setting'], 10);
    }
    else
        AutoSetCurrentLanguage();

    //
    InitLanguageData({en, zh_tw, ja, zh_cn});
}

function SetLanguageData(target, obj){
    Object.keys(obj).forEach(k => {
        const p = target[k];
        const q = obj[k];
        if ( typeof q == 'object' && !Array.isArray(q) ){
            if ( p === void 0 )
                target[k] = {};
            SetLanguageData(target[k], q);
        }
        else if ( p === void 0 )
            target[k] = q;
    });
}

function currentLanguage(){
    return currentLanguageNo;
}
function secondLanguage(){
    return secondLanguageNo;
}

function Search(lang, id){
    id = id.split('/');
    let p = 0;
    let cur = lang;
    while ( p !== id.length ){
        cur = cur[id[p]];
        ++p;
        if ( cur === void 0 )
            return void 0;
    }
    return cur;
}

function InitLanguageData(data){
    // if ( typeof data.zh_tw != 'undefined' )
    //     Object.assign(zh_tw, data.zh_tw);
    // if ( typeof data.en != 'undefined' )
    //     Object.assign(en, data.en);
    // if ( typeof data.ja != 'undefined' )
    //     Object.assign(ja, data.ja);
    // if ( typeof data.zh_cn != 'undefined' )
    //     Object.assign(zh_cn, data.zh_cn);
    
    // 傳入值是function，表示function回傳一個object。在此做前處理。
    Object.keys(data).forEach(k => {
        if ( typeof data[k] == 'function' )
                data[k] = data[k]();
    });
    
    const check = v => typeof v == 'object' && v !== null;

    const lang_names = ['en', 'zh_tw', 'ja', 'zh_cn'];
    const cur = data[lang_names[currentLanguage()]];
    if ( check(cur) )
        SetLanguageData(LanguageData, cur);
    if ( currentLanguageNo != secondLanguageNo ){
        const snd = data[lang_names[secondLanguage()]];
        if ( check(snd) )
        SetLanguageData(LanguageData, snd);
    }
    lang_names.forEach((name, i) => {
        if ( i == currentLanguage() || i == secondLanguage() )
            return;
        const t = data[name];
        if ( check(t) )
            SetLanguageData(LanguageData, t);
    });
}

function GetLang(id, values){
    // const langs = [en, zh_tw, ja, zh_cn];
    // const no = currentLanguage();
    // let t = Search(langs[no], id);
    
    // if ( t === void 0 ){
    //     langs.splice(no, 1);
    //     langs.find(lang => {
    //         t = Search(lang, id);
    //         return t;
    //     });
    //     if ( t === void 0 ){
    //         console.warn(`[Unknow Language data] id: ${id}`);
    //         console.log(new Error().stack);
    //         console.log({en, zh_tw, ja, zh_cn});
    //         return '???';
    //     }
    // }
    
    const t = Search(LanguageData, id);
    if ( t === void 0 ){
        console.warn(`[Unknow Language data] id: ${id}`);
        console.log(new Error().stack);
        console.log(LanguageData);
        return '???';
    }

    if ( Array.isArray(values) )
        t = t.replace(/\$(\d+)/, (v, i) => values[i] !== void 0 && values[i] !== null ? values[i] : '?');

    return t || '???';
}

function PageInitLanguage(){
    document.querySelectorAll("*[data-langid]").forEach(a => {
        a.innerHTML = GetLang(a.getAttribute('data-langid'));
        a.removeAttribute('data-langid');
    });
}

export default GetLang;

export {InitLanguageSystem, currentLanguage, secondLanguage, GetLang, InitLanguageData, PageInitLanguage};