import app from "./app.vue";

import GetLang from "@services/Language";
import ViewInit from "@services/ViewInit.js";

const vue_enchantSimulator = () => import("@/views/Enchant/EnchantSimulator/index.vue");
const vue_enchantDoll = () => import("@/views/Enchant/EnchantDoll/index.vue");

export default {
  path: '/enchant',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Enchant').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/enchant/enchant-simulator'),
      icon: 'mdi-cube-scan',
      path: ''
    }, {
      title: () => GetLang('Page Title/enchant/enchant-doll'),
      icon: 'mdi-leaf',
      path: '/doll'
    }]
  },
  children: [{
    path: '',
    component: vue_enchantSimulator,
    meta: {
      title: () => GetLang('Page Title/enchant/enchant-simulator')
    }
  }, {
    path: 'doll',
    component: vue_enchantDoll,
    meta: {
      title: () => GetLang('Page Title/enchant/enchant-doll')
    }
  }]
};