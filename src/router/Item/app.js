import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/main/Cyteria/Cyteria.css";
import "@css/main/global.css";

import app from "./app.vue";

import Grimoire from "@Grimoire";
import vue_itemQuery from "@views/ItemQuery/main.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

export default {
  path: '/item',
  component: app,
  beforeEnter(to, from, next) {
    init().then(p => next());
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/item-query'),
      icon: 'jam-box-f',
      path: ''
    }]
  },
  children: [{
    path: '',
    component: vue_itemQuery,
    meta: {
      title: () => GetLang('Page Title/item-query')
    }
  }]
};