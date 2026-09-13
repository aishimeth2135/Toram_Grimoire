import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'

import { initializePage } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const GlossaryView = () => import('@/views/GlossaryQuery/index.vue')

export default {
  name: AppRouteNames.Glossary,
  path: '/glossary',
  component: ViewWrapper,
  beforeEnter() {
    return initializePage({ data: [DataStoreIds.Glossary] })
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.glossary-query',
        icon: 'mdi:tag-outline',
        pathName: AppRouteNames.GlossaryQuery,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.GlossaryQuery,
      path: '',
      component: GlossaryView,
      meta: {
        title: 'app.page-title.glossary-query',
      },
    },
  ],
} satisfies RouteRecordRaw
