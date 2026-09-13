import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { initializePage } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const RegistletQueryView = () => import('@/views/Registlet/RegistletQuery/index.vue')

export default {
  name: AppRouteNames.Registlet,
  path: '/registlet',
  component: ViewWrapper,
  beforeEnter() {
    return initializePage({
      data: [DataStoreIds.Skill, DataStoreIds.Stats, DataStoreIds.Registlet, DataStoreIds.Glossary],
      locales: [LocaleViewNamespaces.RegistletQuery],
    })
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
