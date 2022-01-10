
import type { RouteRecordRaw } from 'vue-router';

import { DataStoreIds } from '@/stores/app/datas/enums';
import { LocaleViewNamespaces } from '@/stores/app/language/enums';

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit';

import ViewWrapper from './view-wrapper.vue';

// const SkillQueryOldView = () => import(/* webpackChunkName: "skill-query-old" */ '@/views/SkillQueryOld/index.vue');
const SkillQueryView = () => import(/* webpackChunkName: "skill-query" */ '@/views/SkillQuery/index.vue');

export default {
  name: 'Skill',
  path: '/skill',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    if (to.name === 'SkillQuery') {
      PrepareLocaleInit(LocaleViewNamespaces.SkillQuery);
    }
    ViewInit(DataStoreIds.Stats, DataStoreIds.Skill, DataStoreIds.Tag).then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.skill-query',
      icon: 'ic-outline-menu-book',
      pathName: 'SkillQuery',
    }],
  },
  children: [{
    name: 'SkillQuery',
    path: ':skillId?',
    component: SkillQueryView,
    meta: {
      title: 'app.page-title.skill-query',
    },
  }, /* {
    name: 'SkillQueryOld',
    path: 'old',
    component: SkillQueryOldView,
    meta: {
      title: 'app.page-title.skill-query',
    },
  } */],
} as RouteRecordRaw;
