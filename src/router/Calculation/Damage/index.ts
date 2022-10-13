import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas/enums'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import { AppRouteNames } from '@/router/enums'

import ViewWrapper from './view-wrapper.vue'

const DamageCalculatiomView = () =>
  import('@/views/Calculation/DamageCalculation/index.vue')

export default {
  name: AppRouteNames.DamageCalculationBase,
  path: '/damage-calculation',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.DamageCalculation)
    ViewInit(DataStoreIds.DamageCalculation).then(next)
  },
  meta: {
    leftMenuViewButtons: [
      {
        title: 'app.page-title.damage-calculation',
        icon: 'mdi-sword',
        pathName: AppRouteNames.DamageCalculation,
      },
    ],
  },
  children: [
    {
      name: AppRouteNames.DamageCalculation,
      path: '',
      component: DamageCalculatiomView,
      meta: {
        title: 'app.page-title.damage-calculation',
      },
    },
  ],
} as RouteRecordRaw
