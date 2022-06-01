import type { RouteRecordRaw } from 'vue-router'

import { ViewInit } from '@/shared/services/ViewInit'

import Page404View from '@/views/app/page404.vue'

import { AppRouteNames } from '../enums'

export default {
  name: AppRouteNames.UnrecognizedPath,
  path: '/:pathMatch(.*)*',
  component: Page404View,
  beforeEnter(to, from, next) {
    ViewInit().then(next)
  },
  meta: {
    title: '404',
    leftMenuViewButtons: [],
  },
} as RouteRecordRaw
