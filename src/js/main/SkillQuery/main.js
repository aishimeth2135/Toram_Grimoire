import Grimoire from "../Grimoire.js";
import SkillSystem from "../../SkillSystem/SkillSystem.js";
import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import TagSystem from "../../TagSystem/TagSystem.js";
import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";
import GetLang from "../module/LanguageSystem.js";

async function start(){
    const status = {
        no_error: true
    };
    
    readyFirst();

    Grimoire.SkillSystem = new SkillSystem();
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.TagSystem = new TagSystem();

    const loading_error_msg = GetLang('Loading Message/error');

    await startLoadingMsg(GetLang('Loading Message/Character Stats'));
    await Grimoire.CharacterSystem.init_statList().catch(() => loadingMsg(loading_error_msg, true, status));
    await startLoadingMsg(GetLang('Loading Message/Skill Data'));
    await Grimoire.SkillSystem.init().catch(() => loadingMsg(loading_error_msg, true, status));
    
    await startLoadingMsg(GetLang('Loading Message/Init Skill Data'));
    Grimoire.SkillSystem.init_SkillQuery(document.querySelector('#SkillQuery > .main'));

    await startLoadingMsg(GetLang('Loading Message/Tag Data'));
    await Grimoire.TagSystem.init({mainNode: document.getElementById('tag-scope')}).catch(() => loadingMsg(loading_error_msg, true, status));

    ready();

    if ( status.no_error )
        loadingFinished();
}

try {
    start();
}
catch(e) {
    loadingMsg(e);
    console.log(e);
}

