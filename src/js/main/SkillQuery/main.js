import Grimoire from "../Grimoire.js";
import SkillSystem from "../../SkillSystem/SkillSystem.js";
import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import TagSystem from "../../TagSystem/TagSystem.js";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSucceeded, AllLoadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import GetLang from "../module/LanguageSystem.js";

async function start(){
    readyFirst();

    Grimoire.SkillSystem = new SkillSystem();
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.TagSystem = new TagSystem();

    const loading_error_msg = GetLang('Loading Message/error');

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
        await Grimoire.SkillSystem.init_SkillQuery(document.querySelector('#SkillQuery > .main'))
            .then(() => loadingFinished(scope))
            .catch((err) => {
                console.log(err);
                loadingError(scope);
            });
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

