import Grimoire from "@Grimoire";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "@global-modules/LoadingPage.js";
import {PageInitFirst, PageInitReady} from "@global-modules/PageInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";


import CharacterSystem from "@lib/CharacterSystem/CharacterSystem.js";
import ItemSystem from "@lib/ItemSystem/ItemSystem.js";
import SkillSystem from "@lib/SkillSystem/SkillSystem.js";

async function start(){
    PageInitFirst({
        languageData: {zh_tw, en, ja, zh_cn}
    });

    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.ItemSystem = new ItemSystem();
    Grimoire.SkillSystem = new SkillSystem();
    
    // Init of all System
    const msg_scopes = await startLoadingMsg(
        GetLang('Loading Message/Character Stats'),
        GetLang('Loading Message/Equipments Data'),
        GetLang('Loading Message/Character Simulator'),
        GetLang('Loading Message/Skill System')
    );
    const inits = [
        Grimoire.CharacterSystem.init_statList(),
        Grimoire.ItemSystem.init(),
        Grimoire.CharacterSystem.init_characterSimulator(),
        Grimoire.SkillSystem.init()
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
    await inits[2].next();
    await inits[3].next();

    {
        const scope = await startLoadingMsg(GetLang('Loading Message/Controller Init'));
        await new Promise((resolve, reject) => {
            Grimoire.CharacterSystem.CharacterSimulatorController.init(document.getElementById('CharacterSimulator'));
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

