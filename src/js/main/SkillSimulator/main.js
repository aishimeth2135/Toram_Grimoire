import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import GetLang from "../module/LanguageSystem.js";

async function start(){
    const status = {
        no_error: true
    };
    
    readyFirst();

    // Init Grimoire
    // Example:
    // Grimoire.System1 = new System1();
    
    // Init of all System
    // Exapmle: 
    // await startLoadingMsg('載入...');
    // await Grimoire.System1.init().catch(() => loadingMsg('...載入失敗。', true, status));
    
    ready();

    if ( status.no_error )
        loadingFinished();
}
try {
    start();
}
catch(e) {
    loadingMsg(e);
    console.log(e);
}

