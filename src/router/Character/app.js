import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/main/Cyteria/Cyteria.css";
import "@css/main/global.css";

import app from "./app.vue";

import Grimoire from "@Grimoire";
import vue_characterSimulator from "@views/CharacterSimulator/main.vue";
import vue_skillSimulator from "@views/SkillSimulator/main.vue";

import GetLang from "@global-modules/LanguageSystem.js";
import init from "./init.js";

export default {
  path: '/character',
  component: app,
  beforeEnter(to, from, next) {
    init().then(p => next());
  },
  meta: {
    leftMenuViewButtons: [/*{
      title: () => GetLang('Page Title/character-simulator'),
      icon: 'gridicons-user',
      path: ''
    },*/{
      title: () => GetLang('Page Title/skill-simulator'),
      icon: 'bx-bxs-star-half',
      path: '/skill'
    }],
    pathInit: init
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