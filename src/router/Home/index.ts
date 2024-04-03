import type { RouteRecordRaw } from 'vue-router'

import { ViewInit } from '@/shared/services/ViewInit'

import HomeView from '@/views/Home/Home/index.vue'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const AboutView = () => import('@/views/Home/About/index.vue')

export default {
  name: AppRouteNames.Base,
  path: '/',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    ViewInit().then(next)
  },
  meta: {
    title: null,
    leftMenuViewButtons: [
      {
        title: 'app.page-title.home',
        icon: 'ant-design:home-outlined',
        pathName: AppRouteNames.Home,
      },
      {
        title: 'app.page-title.about',
        icon: 'bx-bxs-star-half',
        pathName: AppRouteNames.About,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.Home,
      path: '',
      component: HomeView,
    },
    {
      name: AppRouteNames.About,
      path: 'about',
      component: AboutView,
      meta: {
        title: 'app.page-title.about',
      },
    },
  ],
} as RouteRecordRaw
