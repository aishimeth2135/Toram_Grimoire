import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import DamageCalculationSystem from "../../CalculationSystem/Damage/DamageCalculationSystem.js";


async function start(){
    let no_error = true;
    
    readyFirst();

    // Init Grimoire
    // Example:
    // Grimoire.System1 = new System1();
    Grimoire.DamageCalculationSystem = new DamageCalculationSystem();
    
    // Init of all System
    // Exapmle: 
    // await startLoadingMsg('載入...');
    // await Grimoire.System1.init().catch(() => loadingMsg('...載入失敗。', true));
    await startLoadingMsg('初始化...');
    await Grimoire.DamageCalculationSystem.init(document.getElementById('DamageCalculation'));
    
    ready();

    if ( no_error )
        loadingFinished();
}
try {
    start();
}
catch(e) {
    loadingMsg(e);
    console.log(e);
}

