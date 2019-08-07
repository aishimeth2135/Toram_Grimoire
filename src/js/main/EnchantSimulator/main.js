import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";

import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import EnchantSystem from "../../EnchantSystem/EnchantSystem.js";


async function start(){
    let no_error = true;
    
    readyFirst();

    // Init Grimoire
    // Example:
    // Grimoire.System1 = new System1();
    Grimoire.EnchantSystem = new EnchantSystem();
    Grimoire.CharacterSystem = new CharacterSystem();
    
    // Init of all System
    // Exapmle: 
    // await startLoadingMsg('載入...');
    // await Grimoire.System1.init().catch(() => loadingMsg('...載入失敗。', true));
    await startLoadingMsg('載入角色能力清單...');
    await Grimoire.CharacterSystem.init_statList().catch(() => loadingMsg('...載入失敗。', true));
    await startLoadingMsg('載入所需資料...');
    await Grimoire.EnchantSystem.init().catch(() => loadingMsg('...載入失敗。', true));

    const node = document.getElementById('EnchantSimulator');
    await startLoadingMsg('初始化附魔模擬器...');
    await Grimoire.EnchantSystem.init_EnchantSimulator(node);
    
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

