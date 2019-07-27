import zh_tw from "./LanguageData/zh_tw.js";
import en from "./LanguageData/en.js";
import ja from "./LanguageData/ja.js";

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
    Object.assign(zh_tw, data.zh_tw);
    Object.assign(en, data.en);
    Object.assign(ja, data.ja);
}

function GetLang(id, values){
    const langs = [en, zh_tw, ja];
    const no = currentLanguage();
    let t = Search(langs[no], id);
    
    if ( t === void 0 ){
        let find = false;
        langs.forEach(lang => {
            if ( find )
                return;
            t = Search(lang, id);
            if ( t !== void 0 ){
                find = true;
            }
        });
        if ( t === void 0 ){
            console.warn(`[Unknow Language data] id: ${id}`);
            console.log(new Error().stack);
            console.log(langs);
            return '???';
        }
        return t;
    }

    if ( values )
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