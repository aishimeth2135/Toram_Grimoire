
import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas/enums'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

const SkillQueryView = () => import('@/views/SkillQuery/index.vue')

export default {
  name: 'Skill',
  path: '/skill',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    if (to.name === 'SkillQuery') {
      PrepareLocaleInit(LocaleViewNamespaces.SkillQuery)
    }
    ViewInit(DataStoreIds.Stats, DataStoreIds.Skill, DataStoreIds.Tag).then(next)
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
      parentPathName: 'Skill',
      title: 'app.page-title.skill-query',
    },
  }],
} as RouteRecordRaw
