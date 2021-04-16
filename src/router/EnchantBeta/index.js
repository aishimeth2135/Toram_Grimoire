import app from "./app.vue";

import GetLang from "@Services/Language";
import ViewInit from "@Services/ViewInit.js";

const vue_enchantSimulator = () => import(/* webpackChunkName: "enchant-simulator-beta" */ "@views/EnchantSimulatorBeta");

export default {
  path: '/enchant-beta',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Enchant').then(next);
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