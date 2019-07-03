import Grimoire from "../Grimoire.js";
import SkillSystem from "../../SkillSystem/SkillSystem.js";
import CharacterSystem from "../../CharacterSystem/CharacterSystem.js";
import TagSystem from "../../TagSystem/TagSystem.js";
import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";

async function start(){
    let no_error = true;
    
    readyFirst();

    Grimoire.SkillSystem = new SkillSystem();
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.TagSystem = new TagSystem();

    await startLoadingMsg('載入角色能力清單...');
    await Grimoire.CharacterSystem.init_statList().catch(() => loadingMsg('...載入失敗。', true));
    await startLoadingMsg('載入技能清單...');
    await Grimoire.SkillSystem.init().catch(() => loadingMsg('...載入失敗。', true));
    
    await startLoadingMsg('初始化技能資料...');
    Grimoire.SkillSystem.init_SkillQuery(document.querySelector('#SkillQuery > .main'));

    await startLoadingMsg('載入標籤清單...');
    await Grimoire.TagSystem.init({mainNode: document.getElementById('tag-scope')}).catch(() => loadingMsg('...載入失敗。', true));

    ready();

    if ( no_error )
        loadingFinished();
}
if ( document.getElementById('SkillQuery').getAttribute('data-ready') === '0' ){
    try {
        start();
        document.getElementById('SkillQuery').setAttribute('data-ready', '1');
    }
    catch(e) {
        loadingMsg(e);
        console.log(e);
    }
}
