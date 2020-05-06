import {GetLang, InitLanguageSystem, currentLanguage} from "@global-modules/LanguageSystem.js";
import CY from "@global-modules/cyteria.js";

export default function (){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', {'updateViaCache': 'imports'});
    });
  }

  InitLanguageSystem();

  document.body.classList.add('lang-' + currentLanguage());

  if ( CY.storageAvailable('localStorage') ){
    if ( localStorage['app--font-family'] !== '1' )
      document.body.classList.add('font1');
    if ( localStorage['Theme--Night-Mode'] === '1' )
      document.body.classList.add('theme--night-mode');
  }
  document.title = GetLang('Page Title/base');
}