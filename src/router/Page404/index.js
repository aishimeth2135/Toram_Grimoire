// import Grimoire from "@Grimoire";
import vue_page404 from "@views/app/page404.vue";

// import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

export default {
  path: '*',
  component: vue_page404,
  beforeEnter(to, from, next) {
    init().then(() => next());
  },
  meta: {
    title: () => '404',
    leftMenuViewButtons: []
  }
};