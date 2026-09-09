import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/locale/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const TraitQueryView = () => import('@/views/Trait/TraitQuery/index.vue')

export default {
  name: AppRouteNames.Trait,
  path: '/trait',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.TraitQuery, LocaleViewNamespaces.EquipmentTrait)
    ViewInit(DataStoreIds.Stats, DataStoreIds.EquipmentTrait).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.trait-query',
        icon: 'mdi:book-outline',
        pathName: AppRouteNames.TraitQuery,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.TraitQuery,
      path: '',
      component: TraitQueryView,
      meta: {
        title: 'app.page-title.trait-query',
      },
    },
  ],
} satisfies RouteRecordRaw
