import app from "./app.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import ViewInit from "@global-modules/ViewInit.js";

const vue_itemQuery = () => import(/* webpackChunkName: "item-query" */ "@views/Item/ItemQuery/main.vue");
const vue_crystalQuery = () => import(/* webpackChunkName: "crystal-query" */ "@views/Item/CrystalQuery/main.vue");

export default {
  path: '/item',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Items').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/item-query'),
      icon: 'jam-box-f',
      path: ''
    }, {
      title: () => GetLang('Page Title/crystal-query'),
      icon: 'bx-bx-cube-alt',
      path: '/crystal'
    }]
  },
  children: [{
    path: '',
    component: vue_itemQuery,
    meta: {
      title: () => GetLang('Page Title/item-query')
    }
  }, {
    path: 'crystal',
    component: vue_crystalQuery,
    meta: {
      title: () => GetLang('Page Title/crystal-query')
    }
  }]
};