import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/main/Cyteria/Cyteria.css";
import "@css/main/global.css";

import app from "./app.vue";

import Grimoire from "@Grimoire";
import vue_damageCalc from "@views/Calculation/damage/main.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

export default {
  path: '/damage',
  component: app,
  beforeEnter(to, from, next) {
    init().then(p => next());
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/calculation/damage'),
      icon: 'bi-music-note-beamed',
      path: ''
    }]
  },
  children: [{
    path: '',
    component: vue_damageCalc,
    meta: {
      title: () => GetLang('Page Title/calculation/damage')
    }
  }]
};