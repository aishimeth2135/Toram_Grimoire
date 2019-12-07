import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSucceeded, AllLoadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import DamageCalculationSystem from "../../CalculationSystem/Damage/DamageCalculationSystem.js";
import GetLang from "../module/LanguageSystem.js";


async function start(){
    readyFirst();

    // Init Grimoire
    Grimoire.DamageCalculationSystem = new DamageCalculationSystem();
    
    // Init of all System
    const scope = await startLoadingMsg(GetLang('Loading Message/Init'));
    await Grimoire.DamageCalculationSystem.init(document.getElementById('DamageCalculation'))
        .then(() => loadingFinished(scope))
        .catch((err) => {loadingError(scope); console.log(err)});
    
    ready();

    if ( loadingSucceeded() )
        AllLoadingFinished();
}
try {
    start();
}
catch(e) {
    loadingMsg(e);
    console.log(e);
}

