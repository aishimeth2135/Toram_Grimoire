import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/main/Cyteria/Cyteria.css";
import "@css/main/global.css";

import Grimoire from "@Grimoire";
import vue_page404 from "@views/app/page404.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

export default {
  path: '*',
  component: vue_page404,
  beforeEnter(to, from, next) {
    init().then(p => next());
  },
  meta: {
    title: () => '404',
    leftMenuViewButtons: []
  }
};