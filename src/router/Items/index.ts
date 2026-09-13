import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'
import { createCategoryViewInitGuard } from '../utils'

const ItemQueryView = () => import('@/views/Items/ItemQuery/index.vue')
const CrystalQueryView = () => import('@/views/Items/CrystalQuery/index.vue')
const ChromaticTransSimulatorView = () => import('@/views/Items/ChromaticTransSimulator/index.vue')
const TraitQueryView = () => import('@/views/Items/TraitQuery/index.vue')

const createItemsViewInitGuard = createCategoryViewInitGuard(AppRouteNames.Items)

export default {
  name: AppRouteNames.Items,
  path: '/items',
  component: ViewWrapper,
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
        title: 'app.page-title.trait-query',
        icon: 'ic:outline-pentagon',
        pathName: AppRouteNames.TraitQuery,
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
      beforeEnter: createItemsViewInitGuard(
        [LocaleViewNamespaces.ItemQuery],
        DataStoreIds.Stats,
        DataStoreIds.Items
      ),
    },
    {
      name: AppRouteNames.CrystalQuery,
      path: 'crystal',
      component: CrystalQueryView,
      meta: {
        title: 'app.page-title.crystal-query',
      },
      beforeEnter: createItemsViewInitGuard(
        [LocaleViewNamespaces.CrystalQuery],
        DataStoreIds.Stats,
        DataStoreIds.Crystals
      ),
    },
    {
      name: AppRouteNames.ChromaticTransSimulator,
      path: 'chromatic-trans',
      component: ChromaticTransSimulatorView,
      meta: {
        title: 'app.page-title.chromatic-trans-simulator',
      },
      beforeEnter: createItemsViewInitGuard([LocaleViewNamespaces.ChromaticTransSimulator]),
    },
    {
      name: AppRouteNames.TraitQuery,
      path: 'trait-query',
      component: TraitQueryView,
      meta: {
        title: 'app.page-title.trait-query',
      },
      beforeEnter: createItemsViewInitGuard(
        [LocaleViewNamespaces.TraitQuery, LocaleViewNamespaces.EquipmentTrait],
        DataStoreIds.Stats,
        DataStoreIds.EquipmentTrait
      ),
    },
  ],
} satisfies RouteRecordRaw
