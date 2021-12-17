
import type { RouteRecordRaw } from 'vue-router';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const CharacterSimulatorView = () => import(/* webpackChunkName: "character-simulator" */ '@/views/CharacterSimulator/index.vue');
const SkillSimulatorView = () => import(/* webpackChunkName: "skill-simulator" */ '@/views/SkillSimulator/index.vue');

export default {
  path: '/character',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Items', 'CharacterStats', 'Skill', 'Food').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/character-simulator'),
      icon: 'gridicons-user',
      path: '',
    }, {
      title: () => GetLang('Page Title/skill-simulator'),
      icon: 'bx-bxs-star-half',
      path: '/skill',
    }],
  },
  children: [{
    path: '',
    component: CharacterSimulatorView,
    meta: {
      title: () => GetLang('Page Title/character-simulator'),
    },
  }, {
    path: 'skill',
    component: SkillSimulatorView,
    meta: {
      title: () => GetLang('Page Title/skill-simulator'),
    },
  }],
} as RouteRecordRaw;
