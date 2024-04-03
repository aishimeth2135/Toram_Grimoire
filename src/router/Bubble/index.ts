import type { RouteRecordRaw } from 'vue-router'

import { ViewInit } from '@/shared/services/ViewInit'

import { AppRouteNames } from '../enums'

const BubbleView = () => import('@/views/other/bubble.vue')

export default {
  name: AppRouteNames.Bubble,
  path: '/bubble/:iconName/:color?/:number?',
  component: BubbleView,
  beforeEnter(_to, _from, next) {
    ViewInit().then(next)
  },
  meta: {
    title: '0.0',
    leftMenuViewButtons: [],
  },
} as RouteRecordRaw
