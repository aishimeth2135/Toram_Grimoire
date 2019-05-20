import zh_tw from "./LanguageStrings/zh_tw.js";
import en from "./LanguageStrings/en.js";
import ja from "./LanguageStrings/ja.js";

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

export default function Lang(id){
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
    return t;
};