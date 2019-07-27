import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";

import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import ItemSystem from "../../ItemSystem/ItemSystem.js";

async function start(){
    let no_error = true;
    
    readyFirst();

    // Init Grimoire
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.ItemSystem = new ItemSystem();
    
    // Init of all System
    await startLoadingMsg('載入角色能力清單...');
    await Grimoire.CharacterSystem.init_statList().catch(() => loadingMsg('...載入失敗。', true));
    await startLoadingMsg('載入裝備清單...');
    await Grimoire.ItemSystem.init().catch(() => loadingMsg('...載入失敗。', true));
    await startLoadingMsg('初始化...');
    await Grimoire.ItemSystem.searchController.init(document.getElementById('ItemQuery'));
    
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

