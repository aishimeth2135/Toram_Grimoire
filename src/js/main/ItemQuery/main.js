import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSucceeded, AllLoadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import ItemSystem from "../../ItemSystem/ItemSystem.js";
import GetLang from "../module/LanguageSystem.js";

async function start(){
    readyFirst();

    // Init Grimoire
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.ItemSystem = new ItemSystem();
    
    // Init of all System
    const msg_scopes = await startLoadingMsg(
        GetLang('Loading Message/Character Stats'),
        GetLang('Loading Message/Equipmemt Data')
    );
    const inits = [
        Grimoire.CharacterSystem.init_statList(),
        Grimoire.ItemSystem.init()
    ];
    await Promise.all(
        inits.map((p, i) => {
            return p.next()
                .then(() => loadingFinished(msg_scopes[i]))
                .catch(() => loadingError(msg_scopes[i]));
        })
    );
    await inits[0].next();
    await inits[1].next();

    {
        const scope = await startLoadingMsg(GetLang('Loading Message/Controller Init'));
        await new Promise((resolve, reject) => {
            Grimoire.ItemSystem.searchController.init(document.getElementById('ItemQuery'));
            resolve();
        })
        .then(() => loadingFinished(scope))
        .catch(() => loadingError(scope));
    }
    
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

