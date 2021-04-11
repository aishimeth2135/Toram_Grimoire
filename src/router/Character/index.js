import app from "./app.vue";

import GetLang from "@Services/Language";
import ViewInit from "@Services/ViewInit.js";

const vue_characterSimulator = () => import(/* webpackChunkName: "character-simulator" */ "@views/CharacterSimulator/main.vue");
const vue_skillSimulator = () => import(/* webpackChunkName: "skill-simulator" */ "@views/SkillSimulator/main.vue");

export default {
  path: '/character',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Items', 'CharacterStats', 'Skill').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/character-simulator'),
      icon: 'gridicons-user',
      path: ''
    }, {
      title: () => GetLang('Page Title/skill-simulator'),
      icon: 'bx-bxs-star-half',
      path: '/skill'
    }]
  },
  children: [{
    path: '',
    component: vue_characterSimulator,
    meta: {
      title: () => GetLang('Page Title/character-simulator')
    }
  }, {
    path: 'skill',
    component: vue_skillSimulator,
    meta: {
      title: () => GetLang('Page Title/skill-simulator')
    }
  }]
};