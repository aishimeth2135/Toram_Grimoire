import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "../module/LoadingPage.js";
import {PageInitFirst, PageInitReady} from "../module/PageInit.js";
import DamageCalculationSystem from "../../CalculationSystem/Damage/DamageCalculationSystem.js";
import GetLang from "../module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

async function start(){
    PageInitFirst({
        languageData: {zh_tw, en, ja, zh_cn}
    });

    // Init Grimoire
    Grimoire.DamageCalculationSystem = new DamageCalculationSystem();
    
    // Init of all System
    const scope = await startLoadingMsg(GetLang('Loading Message/Init'));
    await Grimoire.DamageCalculationSystem.init(document.getElementById('DamageCalculation'))
        .then(() => loadingFinished(scope))
        .catch(() => loadingError(scope));
    
    PageInitReady();

    if ( loadingSuccess() )
        AllLoadingFinished();
}
try {
    start();
}
catch(e) {
    loadingMsg(e);
    console.log(e);
}

