import app from "./app.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

const vue_skillQuery = () => import(/* webpackChunkName: "skill-query" */ "@views/SkillQuery/main.vue");

export default {
  path: '/skill',
  component: app,
  beforeEnter(to, from, next) {
    init().then(() => next());
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/skill-query'),
      icon: 'ic-outline-menu-book',
      path: ''
    }]
  },
  children: [{
    path: '',
    component: vue_skillQuery,
    meta: {
      title: () => GetLang('Page Title/skill-query')
    }
  }]
};