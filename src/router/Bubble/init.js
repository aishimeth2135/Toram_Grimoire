// import Grimoire from "@Grimoire";
import { viewInit, viewInitReady, viewInitEnd, handleInit } from "@global-modules/viewInit.js";

async function start() {
  await viewInit({});

  viewInitReady();

  viewInitEnd();
}

export default async function() {
  await handleInit(start);
}