import {currentLanguage, InitLanguageSystem, PageInitLanguage, GetLang} from "./LanguageSystem.js";
import CY from "./cyteria.js";

function PageInitFirst(){
    InitLanguageSystem();

    document.querySelector('#loading-page > .content').innerHTML = GetLang('Loading Page/content');

    if ( CY.storageAvailable('localStorage') && localStorage['main-font-family'] !== '1' )
        document.querySelector('body').classList.add('font1', 'lang-' + currentLanguage());
}

function PageInit(){

}

export {PageInitFirst, PageInit};