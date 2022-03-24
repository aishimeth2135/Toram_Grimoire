
import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas/enums'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

const EnchantSimulatorView = () => import('@/views/Enchant/EnchantSimulator/index.vue')
const EnchantDollView = () => import('@/views/Enchant/EnchantDoll/index.vue')

export default {
  name: 'Enchant',
  path: '/enchant',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    if (to.name === 'EnchantSimulator') {
      PrepareLocaleInit(LocaleViewNamespaces.EnchantSimulator)
    } else if (to.name === 'EnchantDoll') {
      PrepareLocaleInit(LocaleViewNamespaces.EnchantSimulator, LocaleViewNamespaces.EnchantDoll)
    }
    ViewInit(DataStoreIds.Stats, DataStoreIds.Enchant).then(next)
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.enchant-simulator',
      icon: 'mdi-cube-scan',
      pathName: 'EnchantSimulator',
    }, {
      title: 'app.page-title.enchant-doll',
      icon: 'mdi-leaf',
      pathName: 'EnchantDoll',
    }],
  },
  children: [{
    name: 'EnchantSimulator',
    path: '',
    component: EnchantSimulatorView,
    meta: {
      title: 'app.page-title.enchant-simulator',
    },
  }, {
    name: 'EnchantDoll',
    path: 'doll',
    component: EnchantDollView,
    meta: {
      title: 'app.page-title.enchant-doll',
    },
  }],
} as RouteRecordRaw
