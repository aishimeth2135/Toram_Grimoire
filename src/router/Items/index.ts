import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const ItemQueryView = () => import('@/views/Items/ItemQuery/index.vue')
const CrystalQueryView = () => import('@/views/Items/CrystalQuery/index.vue')

export default {
  name: AppRouteNames.Items,
  path: '/items',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(
      LocaleViewNamespaces.ItemQuery,
      LocaleViewNamespaces.CrystalQuery
    )
    ViewInit(DataStoreIds.Stats, DataStoreIds.Items).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.item-query',
        icon: 'jam-box-f',
        pathName: AppRouteNames.ItemQuery,
      },
      {
        title: 'app.page-title.crystal-query',
        icon: 'bx-bx-cube-alt',
        pathName: AppRouteNames.CrystalQuery,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.ItemQuery,
      path: '',
      component: ItemQueryView,
      meta: {
        title: 'app.page-title.item-query',
      },
    },
    {
      name: AppRouteNames.CrystalQuery,
      path: 'crystal',
      component: CrystalQueryView,
      meta: {
        title: 'app.page-title.crystal-query',
      },
    },
  ],
} as RouteRecordRaw
