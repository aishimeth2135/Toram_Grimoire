import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "../module/LoadingPage.js";
import {PageInitFirst, PageInitReady} from "../module/PageInit.js";

import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import EnchantSystem from "../../EnchantSystem/EnchantSystem.js";
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

