import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const RegistletQueryView = () => import('@/views/Registlet/RegistletQuery/index.vue')

export default {
  name: AppRouteNames.Registlet,
  path: '/registlet',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.RegistletQuery)
    ViewInit(
      DataStoreIds.Skill,
      DataStoreIds.Stats,
      DataStoreIds.Registlet,
      DataStoreIds.Glossary
    ).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.registlet-query',
        icon: 'mdi:book-outline',
        pathName: AppRouteNames.RegistletQuery,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.RegistletQuery,
      path: '',
      component: RegistletQueryView,
      meta: {
        title: 'app.page-title.registlet-query',
      },
    },
  ],
} satisfies RouteRecordRaw
