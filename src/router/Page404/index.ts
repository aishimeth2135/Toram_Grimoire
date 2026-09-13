import type { RouteRecordRaw } from 'vue-router'

import { initializePage } from '@/shared/services/ViewInit'

import Page404View from '@/views/app/page404.vue'

import { AppRouteNames } from '../enums'

export default {
  name: AppRouteNames.UnrecognizedPath,
  path: '/:pathMatch(.*)*',
  component: Page404View,
  beforeEnter() {
    return initializePage()
  },
  meta: {
    title: '404',
    leftMenuViewButtons: [],
  },
} satisfies RouteRecordRaw
