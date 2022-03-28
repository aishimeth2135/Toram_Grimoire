
import type { RouteRecordRaw } from 'vue-router'

import { DataStoreIds } from '@/stores/app/datas/enums'
import { LocaleViewNamespaces } from '@/stores/app/language/enums'

import { PrepareLocaleInit, ViewInit } from '@/shared/services/ViewInit'

import ViewWrapper from './view-wrapper.vue'

const ItemQueryView = () => import('@/views/Items/ItemQuery/index.vue')
const CrystalQueryView = () => import('@/views/Items/CrystalQuery/index.vue')

export default {
  name: 'Items',
  path: '/items',
  component: ViewWrapper,
  beforeEnter(to, from, next) {
    if (to.name === 'CrystalQuery') {
      PrepareLocaleInit(LocaleViewNamespaces.CrystalQuery)
    }
    ViewInit(DataStoreIds.Stats, DataStoreIds.Items).then(next)
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.item-query',
      icon: 'jam-box-f',
      pathName: 'ItemQuery',
    }, {
      title: 'app.page-title.crystal-query',
      icon: 'bx-bx-cube-alt',
      pathName: 'CrystalQuery',
    }],
  },
  children: [{
    name: 'ItemQuery',
    path: '',
    component: ItemQueryView,
    meta: {
      title: 'app.page-title.item-query',
    },
  }, {
    name: 'CrystalQuery',
    path: 'crystal',
    component: CrystalQueryView,
    meta: {
      title: 'app.page-title.crystal-query',
    },
  }],
} as RouteRecordRaw
