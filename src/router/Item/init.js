import Grimoire from "@Grimoire";
import { viewInit, viewInitReady, viewInitEnd, handleInit } from "@global-modules/viewInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import CharacterSystem from "@lib/CharacterSystem/CharacterSystem.js";
import ItemSystem from "@lib/ItemSystem/ItemSystem.js";
import SkillSystem from "@lib/SkillSystem/SkillSystem.js";
import TagSystem from "@lib/TagSystem/TagSystem.js";

async function start() {
  Grimoire.CharacterSystem = new CharacterSystem();
  Grimoire.ItemSystem = new ItemSystem();

  const inits = [
    Grimoire.CharacterSystem.init_statList(),
    Grimoire.ItemSystem.init()
  ];

  await viewInit({
    initItems: [{
      msg: () => GetLang('Loading Message/Character System/stats'),
      promise: inits[0].next()
    }, {
      msg: () => GetLang('Loading Message/Item System/equipment'),
      promise: inits[1].next()
    }]
  });

  await inits[0].next();
  await inits[1].next();

  viewInitReady();

  viewInitEnd();
}

export default async function() {
  await handleInit(start);
};