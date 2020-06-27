import Grimoire from "@Grimoire";
import { viewInit, viewInitReady, viewInitEnd, handleInit } from "@global-modules/viewInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import CharacterSystem from "@lib/CharacterSystem/CharacterSystem.js";
import EnchantSystem from "@lib/EnchantSystem/EnchantSystem.js";

async function start() {
  Grimoire.CharacterSystem = new CharacterSystem();
  Grimoire.EnchantSystem = new EnchantSystem();

  const inits = [
    Grimoire.CharacterSystem.init_statList(),
    Grimoire.EnchantSystem.init()
  ];

  await viewInit({
    initItems: [{
      msg: () => GetLang('Loading Message/Character System/stats'),
      promise: inits[0].next()
    }, {
      msg: () => GetLang('Loading Message/Enchant System/simulator'),
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
}