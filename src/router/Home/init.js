// import Grimoire from "@Grimoire";
import { viewInit, viewInitReady, viewInitEnd, handleInit } from "@global-modules/viewInit.js";
// import GetLang from "@global-modules/LanguageSystem.js";

async function start() {
  await viewInit({});

  viewInitReady();

  viewInitEnd();
}

export default async function() {
  await handleInit(start);
}