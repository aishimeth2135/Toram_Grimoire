import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const SkillQueryView = () => import('@/views/SkillQuery/index.vue')

export default {
  name: AppRouteNames.Skill,
  path: '/skill',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.SkillQuery)
    ViewInit(
      DataStoreIds.Stats,
      DataStoreIds.Skill,
      DataStoreIds.Glossary,
      DataStoreIds.Registlet
    ).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.skill-query',
        icon: 'ic-outline-menu-book',
        pathName: AppRouteNames.SkillQuery,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.SkillQuery,
      path: ':skillId?',
      component: SkillQueryView,
      meta: {
        title: 'app.page-title.skill-query',
      },
    },
  ],
} satisfies RouteRecordRaw
