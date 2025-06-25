import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

import { AppRouteNames } from '../enums'

const EnchantSimulatorView = () => import('@/views/Enchant/EnchantSimulator/index.vue')
const EnchantDollView = () => import('@/views/Enchant/EnchantDoll/index.vue')

export default {
  name: AppRouteNames.Enchant,
  path: '/enchant',
  component: ViewWrapper,
  beforeEnter(_to, _from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.EnchantSimulator, LocaleViewNamespaces.EnchantDoll)
    ViewInit(DataStoreIds.Stats, DataStoreIds.Enchant).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.enchant-simulator',
        icon: 'mdi-cube-scan',
        pathName: AppRouteNames.EnchantSimulator,
      },
      {
        title: 'app.page-title.enchant-doll',
        icon: 'mdi-leaf',
        pathName: AppRouteNames.EnchantDoll,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.EnchantSimulator,
      path: '',
      component: EnchantSimulatorView,
      meta: {
        title: 'app.page-title.enchant-simulator',
      },
    },
    {
      name: AppRouteNames.EnchantDoll,
      path: 'doll',
      component: EnchantDollView,
      meta: {
        title: 'app.page-title.enchant-doll',
      },
    },
  ],
} as RouteRecordRaw
