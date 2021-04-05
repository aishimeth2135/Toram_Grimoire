import app from "./app.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import ViewInit from "@global-modules/ViewInit.js";

const vue_damageCalc = () => import(/* webpackChunkName: "calculation-damage" */ "@views/Calculation/damage/main.vue");

export default {
  path: '/damage',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit().then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/calculation/damage'),
      icon: 'mdi-sword',
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