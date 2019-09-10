import zh_tw from "./LanguageData/zh_tw.js";
import en from "./LanguageData/en.js";
import ja from "./LanguageData/ja.js";
import zh_cn from "./LanguageData/zh_cn.js";

function currentLanguage(){
    return 1;
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
    if ( typeof data.zh_tw != 'undefined' )
        Object.assign(zh_tw, data.zh_tw);
    if ( typeof data.en != 'undefined' )
        Object.assign(en, data.en);
    if ( typeof data.ja != 'undefined' )
        Object.assign(ja, data.ja);
    if ( typeof data.zh_cn != 'undefined' )
        Object.assign(ja, data.zh_cn);
}

function GetLang(id, values){
    const langs = [en, zh_tw, ja, zh_cn];
    const no = currentLanguage();
    let t = Search(langs[no], id);
    
    if ( t === void 0 ){
        t = langs.find(lang => Search(lang, id));
        if ( t === void 0 ){
            console.warn(`[Unknow Language data] id: ${id}`);
            console.log(new Error().stack);
            console.log(langs);
            return '???';
        }
        return t;
    }

    if ( Array.isArray(values) )
        t = t.replace(/\$(\d+)/, (v, i) => values[i] !== void 0 && values[i] !== null ? values[i] : '?');

    return t;
};

function PageInitLanguage(){
    document.querySelectorAll("*[data-langid]").forEach(a => {
        a.innerHTML = GetLang(a.getAttribute('data-langid'));
        a.removeAttribute('data-langid');
    });
}

export default GetLang;

export {GetLang, InitLanguageData, PageInitLanguage};