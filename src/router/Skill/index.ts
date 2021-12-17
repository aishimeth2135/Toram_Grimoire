
import type { RouteRecordRaw } from 'vue-router';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const SkillQueryView = () => import(/* webpackChunkName: "skill-query" */ '@/views/SkillQuery/index.vue');
const SkillQueryBetaView = () => import(/* webpackChunkName: "skill-query-beta" */ '@/views/SkillQuery_/index.vue');

export default {
  path: '/skill',
  component: WrapperView,
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
    component: SkillQueryView,
    meta: {
      title: () => GetLang('Page Title/skill-query'),
    },
  }, {
    path: 'beta',
    component: SkillQueryBetaView,
    meta: {
      title: () => GetLang('Page Title/skill-query'),
    },
  }],
} as RouteRecordRaw;
