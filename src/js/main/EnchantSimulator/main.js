import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSucceeded, AllLoadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";

import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import EnchantSystem from "../../EnchantSystem/EnchantSystem.js";
import GetLang from "../module/LanguageSystem.js";


async function start(){
    readyFirst();

    // Init Grimoire
    Grimoire.EnchantSystem = new EnchantSystem();
    Grimoire.CharacterSystem = new CharacterSystem();
    
    // Init of all System
    const msg_scopes = await startLoadingMsg(
        GetLang('Loading Message/Character Stats'),
        GetLang('Loading Message/Enchant Data')
    );
    const inits = [
        Grimoire.CharacterSystem.init_statList(),
        Grimoire.EnchantSystem.init()
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
        const scope = await startLoadingMsg(GetLang('Loading Message/Enchant System Init'));
        await Grimoire.EnchantSystem.init_EnchantSimulator(document.getElementById('EnchantSimulator'))
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

