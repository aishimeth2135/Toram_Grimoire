import app from "./app.vue";

import GetLang from "@services/Language";
import ViewInit from "@services/ViewInit.js";

const vue_itemQuery = () => import("@/views/Items/ItemQuery/index.vue");
const vue_crystalQuery = () => import("@/views/Items/CrystalQuery/index.vue");

export default {
  path: '/items',
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