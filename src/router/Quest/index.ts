import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const MainQuestCalcView = () => import('@/views/Quest/main-quest-calc.vue')

export default {
  name: AppRouteNames.Quest,
  path: '/main-quest',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.MainQuestCalc)
    ViewInit(DataStoreIds.Quest).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.main-quest-calc',
        icon: 'mdi:book-outline',
        pathName: AppRouteNames.MainQuestCalc,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.MainQuestCalc,
      path: '',
      component: MainQuestCalcView,
      meta: {
        title: 'app.page-title.main-quest-calc',
        wideLayout: true,
      },
    },
  ],
} as RouteRecordRaw
