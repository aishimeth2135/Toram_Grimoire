import type { NavigationGuard, RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { PrepareLocaleInit, ViewInit, ViewInitDeferred } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const ItemQueryView = () => import('@/views/Items/ItemQuery/index.vue')
const CrystalQueryView = () => import('@/views/Items/CrystalQuery/index.vue')
const ChromaticTransSimulatorView = () => import('@/views/Items/ChromaticTransSimulator/index.vue')

function createItemsViewInitGuard(...inits: DataStoreIds[]): NavigationGuard {
  return (_to, from) => {
    const isItemsNavigation = from.matched.some(route => route.name === AppRouteNames.Items)
    const init = isItemsNavigation ? ViewInitDeferred : ViewInit

    return init(...inits)
  }
}

export default {
  name: AppRouteNames.Items,
  path: '/items',
  component: ViewWrapper,
  beforeEnter() {
    PrepareLocaleInit(
      LocaleViewNamespaces.ItemQuery,
      LocaleViewNamespaces.CrystalQuery,
      LocaleViewNamespaces.ChromaticTransSimulator
    )
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
      beforeEnter: createItemsViewInitGuard(DataStoreIds.Stats, DataStoreIds.Items),
    },
    {
      name: AppRouteNames.CrystalQuery,
      path: 'crystal',
      component: CrystalQueryView,
      meta: {
        title: 'app.page-title.crystal-query',
      },
      beforeEnter: createItemsViewInitGuard(DataStoreIds.Stats, DataStoreIds.Crystals),
    },
    {
      name: AppRouteNames.ChromaticTransSimulator,
      path: 'chromatic-trans',
      component: ChromaticTransSimulatorView,
      meta: {
        title: 'app.page-title.chromatic-trans-simulator',
      },
      beforeEnter: createItemsViewInitGuard(),
    },
  ],
} satisfies RouteRecordRaw
