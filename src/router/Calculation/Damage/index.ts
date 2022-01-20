
import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas/enums'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

const DamageCalculatiomView = () => import(/* webpackChunkName: "damage-calculation" */ '@/views/Calculation/DamageCalculation/index.vue')

export default {
  name: 'DamageCalculation',
  path: '/damage-calculation',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    PrepareLocaleInit(LocaleViewNamespaces.DamageCalculation)
    ViewInit(DataStoreIds.DamageCalculation).then(next)
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.damage-calculation',
      icon: 'mdi-sword',
      pathName: 'DamageCalculationMain',
    }],
  },
  children: [{
    name: 'DamageCalculationMain',
    path: '',
    component: DamageCalculatiomView,
    meta: {
      title: 'app.page-title.damage-calculation',
    },
  }],
} as RouteRecordRaw
