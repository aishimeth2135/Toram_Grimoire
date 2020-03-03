import Grimoire from "../Grimoire.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "../module/LoadingPage.js";
import {PageInitFirst, PageInitReady} from "../module/PageInit.js";
import GetLang from "../module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";


import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import ItemSystem from "../../ItemSystem/ItemSystem.js";

async function start(){
    PageInitFirst({
        languageData: {zh_tw, en, ja, zh_cn}
    });

    // Init Grimoire
    // Example:
    // Grimoire.System1 = new System1();
    
    // Init of all System
    // Exapmle: 
    // 
    // const msg_scopes = await startLoadingMsg(
    //     GetLang('xxx'),
    //     GetLang('xxx')
    // );
    // const inits = [
    //     Grimoire.SystemName.init(),
    //     Grimoire.SystemName.init()
    // ];
    // await Promise.all(
    //     inits.map((p, i) => {
    //         return p.next()
    //             .then(() => loadingFinished(msg_scopes[i]))
    //             .catch(() => loadingError(msg_scopes[i]));
    //     })
    // );
    // await inits[0].next();
    // await inits[1].next();
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
                .catch(e => loadingError(msg_scopes[i], e));
        })
    );
    await inits[0].next();
    await inits[1].next();

    {
        const scope = await startLoadingMsg(GetLang('Loading Message/Controller Init'));
        await new Promise((resolve, reject) => {
            Grimoire.CharacterSystem.CharacterSimulator.init(document.getElementById('CharacterSimulator'));
            resolve();
        })
        .then(() => loadingFinished(scope))
        .catch(e => loadingError(scope, e));
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

