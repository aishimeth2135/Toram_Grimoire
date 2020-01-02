import Grimoire from "../Grimoire.js";
import SkillSystem from "../../SkillSystem/SkillSystem.js";
import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import TagSystem from "../../TagSystem/TagSystem.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "../module/LoadingPage.js";
import {PageInitFirst, PageInitReady} from "../module/PageInit.js";
import GetLang from "../module/LanguageSystem.js";

import zh_tw from "./module/LanguageData/zh_tw.js";
import en from "./module/LanguageData/en.js";
import ja from "./module/LanguageData/ja.js";
import zh_cn from "./module/LanguageData/zh_cn.js";

async function start(){
    PageInitFirst({
        languageData: {zh_tw, en, ja, zh_cn}
    });

    Grimoire.SkillSystem = new SkillSystem();
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.TagSystem = new TagSystem();

    const msg_scopes =  await startLoadingMsg(
        GetLang('Loading Message/Character Stats'),
        GetLang('Loading Message/Skill Data'), 
        GetLang('Loading Message/Tag Data')
    );
    const inits = [
        Grimoire.CharacterSystem.init_statList(),
        Grimoire.SkillSystem.init(),
        Grimoire.TagSystem.init({mainNode: document.getElementById('tag-scope')})
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
    await inits[2].next();
    
    {
        const scope = await startLoadingMsg(GetLang('Loading Message/Init Skill Data'));
        await Grimoire.SkillSystem.init_SkillQuery(document.getElementById('SkillQuery'))
            .then(() => loadingFinished(scope))
            .catch((err) => {
                console.log(err);
                loadingError(scope);
            });
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

