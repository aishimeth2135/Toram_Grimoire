import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit, ViewInitSlient } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const BookPreview = () => import('@/views/Book/book-preview.vue')
const BookMain = () => import('@/views/Book/book-main.vue')

export default {
  name: AppRouteNames.Book,
  path: '/book',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.BookTemplate)
    ViewInitSlient(DataStoreIds.Stats, DataStoreIds.Items)
    ViewInit().then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.book-main',
        icon: 'mdi:tag-outline',
        pathName: AppRouteNames.BookView,
      },
      {
        title: 'app.page-title.book-preview',
        icon: 'mdi:tag-outline',
        pathName: AppRouteNames.BookPreview,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.BookView,
      path: '',
      component: BookMain,
      meta: {
        title: 'app.page-title.book-main',
      },
    },
    {
      name: AppRouteNames.BookPreview,
      path: 'preview',
      component: BookPreview,
      meta: {
        title: 'app.page-title.book-preview',
        twoColumnsLayout: true,
      },
    },
  ],
} as RouteRecordRaw
