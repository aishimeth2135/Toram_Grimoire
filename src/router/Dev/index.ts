import type { RouteRecordRaw } from 'vue-router'

import { ViewInit } from '@/shared/services/ViewInit'

const AppDev = () => import('@/views/app/app-dev.vue')

export default {
  name: 'Dev',
  path: '/doll/dev',
  component: AppDev,
  beforeEnter(_to, _from, next) {
    ViewInit().then(next)
  },
  meta: {
    title: 'Doll',
    leftMenuViewButtons: [],
  },
} as RouteRecordRaw
