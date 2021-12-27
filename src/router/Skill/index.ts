
import type { RouteRecordRaw } from 'vue-router';

import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const SkillQueryOldView = () => import(/* webpackChunkName: "skill-query" */ '@/views/SkillQueryOld/index.vue');
const SkillQueryView = () => import(/* webpackChunkName: "skill-query-beta" */ '@/views/SkillQuery/index.vue');

export default {
  name: 'Skill',
  path: '/skill',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Skill', 'Tag').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.skill-query',
      icon: 'ic-outline-menu-book',
      pathName: 'Skill',
    }],
  },
  children: [{
    name: 'SkillQueryOld',
    path: 'old',
    component: SkillQueryOldView,
    meta: {
      title: 'app.page-title.skill-query',
    },
  }, {
    name: 'SkillQuery',
    path: ':skillId?',
    component: SkillQueryView,
    meta: {
      title: 'app.page-title.skill-query',
    },
  }],
} as RouteRecordRaw;
