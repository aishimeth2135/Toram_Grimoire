import type { RouteRecordRaw } from 'vue-router'

import { initializePage } from '@/shared/services/ViewInit'

import { AppRouteNames } from '../enums'

const BubbleView = () => import('@/views/other/bubble.vue')

export default {
  name: AppRouteNames.Bubble,
  path: '/bubble/:iconName/:color?/:number?',
  component: BubbleView,
  beforeEnter() {
    return initializePage()
  },
  meta: {
    title: '0.0',
    leftMenuViewButtons: [],
  },
} satisfies RouteRecordRaw
