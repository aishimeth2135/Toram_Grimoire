import Grimoire from "@Grimoire";
import { viewInit, viewInitReady, viewInitEnd, handleInit } from "@global-modules/viewInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import CharacterSystem from "@lib/CharacterSystem/CharacterSystem.js";
import SkillSystem from "@lib/SkillSystem/SkillSystem.js";
import TagSystem from "@lib/TagSystem/TagSystem.js";

async function start() {
  Grimoire.CharacterSystem = new CharacterSystem();
  Grimoire.SkillSystem = new SkillSystem();
  Grimoire.TagSystem = new TagSystem();

  const inits = [
    Grimoire.CharacterSystem.init_statList(),
    Grimoire.SkillSystem.init(),
    Grimoire.TagSystem.init()
  ];

  await viewInit({
    initItems: [{
      msg: () => GetLang('Loading Message/Character System/stats'),
      promise: inits[0].next()
    }, {
      msg: () => GetLang('Loading Message/Skill System/skill'),
      promise: inits[1].next()
    }, {
      msg: () => GetLang('Loading Message/Skill System/tag'),
      promise: inits[2].next()
    }]
  });

  await inits[0].next();
  await inits[1].next();
  await inits[2].next();

  viewInitReady();

  viewInitEnd();
}

export default async function() {
  await handleInit(start);
}