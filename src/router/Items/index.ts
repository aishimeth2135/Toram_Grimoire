
import type { RouteRecordRaw } from 'vue-router';

import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const ItemQueryView = () => import(/* webpackChunkName: "item-query" */ '@/views/Items/ItemQuery/index.vue');
const CrystalQueryView = () => import(/* webpackChunkName: "crystal-query" */ '@/views/Items/CrystalQuery/index.vue');

export default {
  name: 'Items',
  path: '/items',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Items').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.item-query',
      icon: 'jam-box-f',
      path: '',
    }, {
      title: 'app.page-title.crystal-query',
      icon: 'bx-bx-cube-alt',
      path: '/crystal',
    }],
  },
  children: [{
    name: 'ItemsQuery',
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
} as RouteRecordRaw;
