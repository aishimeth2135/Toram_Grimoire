import app from "./app.vue";

import Grimoire from "@Grimoire";
import vue_enchantSimulator from "@views/EnchantSimulator/main.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

export default {
  path: '/enchant',
  component: app,
  beforeEnter(to, from, next) {
    init().then(p => next());
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/enchant-simulator'),
      icon: 'mdi-cube-scan',
      path: ''
    }]
  },
  children: [{
    path: '',
    component: vue_enchantSimulator,
    meta: {
      title: () => GetLang('Page Title/enchant-simulator')
    }
  }]
};