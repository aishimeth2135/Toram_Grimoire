// import Grimoire from "@Grimoire";
import vue_page404 from "@views/app/page404.vue";
import ViewInit from "@global-modules/ViewInit.js";

// import GetLang from "@global-modules/LanguageSystem.js";

export default {
  path: '*',
  component: vue_page404,
  beforeEnter(to, from, next) {
    ViewInit().then(next);
  },
  meta: {
    title: () => '404',
    leftMenuViewButtons: []
  }
};