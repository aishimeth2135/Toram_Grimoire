
import type { RouteRecordRaw } from 'vue-router';

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
      title: 'app.page-title.skill-query',
      icon: 'ic-outline-menu-book',
      path: '',
    }],
  },
  children: [{
    path: 'old',
    component: SkillQueryView,
    meta: {
      title: 'app.page-title.skill-query',
    },
  }, {
    path: ':skillName?',
    component: SkillQueryBetaView,
    meta: {
      title: 'app.page-title.skill-query',
    },
  }],
} as RouteRecordRaw;
