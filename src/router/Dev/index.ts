import type { RouteRecordRaw } from 'vue-router'

import { initializePage } from '@/shared/services/ViewInit'

const AppDev = () => import('@/views/app/app-dev.vue')

export default {
  name: 'Dev',
  path: '/doll/dev',
  component: AppDev,
  beforeEnter() {
    return initializePage()
  },
  meta: {
    title: 'Doll',
    leftMenuViewButtons: [],
  },
} satisfies RouteRecordRaw
