import type { RouteRecordRaw } from 'vue-router'

import { ViewInit } from '@/shared/services/ViewInit'

import { AppRouteNames } from '../enums'

const vue_bubble = () => import('@/views/other/bubble.vue')

export default {
  name: AppRouteNames.Bubble,
  path: '/bubble/:iconName/:color?/:number?',
  component: vue_bubble,
  beforeEnter(to, from, next) {
    ViewInit().then(next)
  },
  meta: {
    title: '0.0',
    leftMenuViewButtons: [],
  },
}  as RouteRecordRaw
