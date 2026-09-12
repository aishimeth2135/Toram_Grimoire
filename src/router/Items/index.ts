import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const ItemQueryView = () => import('@/views/Items/ItemQuery/index.vue')
const CrystalQueryView = () => import('@/views/Items/CrystalQuery/index.vue')
const ChromaticTransSimulatorView = () => import('@/views/Items/ChromaticTransSimulator/index.vue')

export default {
  name: AppRouteNames.Items,
  path: '/items',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(
      LocaleViewNamespaces.ItemQuery,
      LocaleViewNamespaces.CrystalQuery,
      LocaleViewNamespaces.ChromaticTransSimulator
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
      {
        title: 'app.page-title.chromatic-trans-simulator',
        icon: 'ic-outline-palette',
        pathName: AppRouteNames.ChromaticTransSimulator,
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
    {
      name: AppRouteNames.ChromaticTransSimulator,
      path: 'chromatic-trans',
      component: ChromaticTransSimulatorView,
      meta: {
        title: 'app.page-title.chromatic-trans-simulator',
      },
    },
  ],
} satisfies RouteRecordRaw
