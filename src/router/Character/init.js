import Grimoire from "@Grimoire";
import { viewInit, viewInitReady, viewInitEnd, handleInit } from "@global-modules/viewInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import CharacterSystem from "@lib/CharacterSystem/CharacterSystem.js";
import ItemSystem from "@lib/ItemSystem/ItemSystem.js";
import SkillSystem from "@lib/SkillSystem/SkillSystem.js";

import store from "@store/main";

async function start() {
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
    initItems: [{
      msg: () => GetLang('Loading Message/Character System/stats'),
      promise: inits[0].next()
    }, {
      msg: () => GetLang('Loading Message/Item System/equipment'),
      promise: inits[1].next()
    }, {
      msg: () => GetLang('Loading Message/Character System/simulator'),
      promise: inits[2].next()
    }, {
      msg: () => GetLang('Loading Message/Skill System/skill'),
      promise: inits[3].next()
    }]
  });

  await inits[0].next();
  await inits[1].next();
  await inits[2].next();
  await inits[3].next();

  store.commit('character/setSkillRoot', Grimoire.SkillSystem.skillRoot);

  viewInitReady();

  viewInitEnd();
}

export default async function() {
  await handleInit(start);
}