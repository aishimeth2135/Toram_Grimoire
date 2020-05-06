import Grimoire from "@Grimoire";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "@global-modules/LoadingPage.js";
import {viewInit, viewInitReady, viewInitEnd, handleInit} from "@global-modules/viewInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import zh_tw from "./LanguageData/zh_tw.js";
import en from "./LanguageData/en.js";
import ja from "./LanguageData/ja.js";
import zh_cn from "./LanguageData/zh_cn.js";


import CharacterSystem from "@lib/CharacterSystem/CharacterSystem.js";
import ItemSystem from "@lib/ItemSystem/ItemSystem.js";
import SkillSystem from "@lib/SkillSystem/SkillSystem.js";

async function start(){
    Grimoire.CharacterSystem = new CharacterSystem();
    Grimoire.ItemSystem = new ItemSystem();
    Grimoire.SkillSystem = new SkillSystem();

    const inits = [
        Grimoire.CharacterSystem.init_statList(),
        Grimoire.ItemSystem.init(),
        Grimoire.CharacterSystem.init_characterStatList(),
        Grimoire.SkillSystem.init()
    ];

    await viewInit({
        languageDatas: {zh_tw, en, ja, zh_cn},
        initItems: [{
            msg: () => GetLang('Loading Message/Character Stats'),
            promise: inits[0].next()
        }, {
            msg: () => GetLang('Loading Message/Equipments Data'),
            promise: inits[1].next()
        }, {
            msg: () => GetLang('Loading Message/Character Simulator'),
            promise: inits[2].next()
        }, {
            msg: () => GetLang('Loading Message/Skill System'),
            promise: inits[3].next()
        }]
    });
    
    await inits[0].next();
    await inits[1].next();
    await inits[2].next();
    await inits[3].next();
    
    viewInitReady();

    viewInitEnd();
}

export default function (){
    handleInit( start );
};