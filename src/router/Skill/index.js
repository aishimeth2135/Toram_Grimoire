import app from "./app.vue";

import GetLang from "@services/Language";
import ViewInit from "@services/ViewInit.js";

const vue_skillQuery = () => import(/* webpackChunkName: "skill-query" */ "@/views/SkillQuery");

export default {
  path: '/skill',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Skill', 'Tag').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/skill-query'),
      icon: 'ic-outline-menu-book',
      path: '',
    }],
  },
  children: [{
    path: '',
    component: vue_skillQuery,
    meta: {
      title: () => GetLang('Page Title/skill-query'),
    },
  }],
};
