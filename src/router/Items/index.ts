
import type { RouteRecordRaw } from 'vue-router';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const ItemQueryView = () => import(/* webpackChunkName: "item-query" */ '@/views/Items/ItemQuery/index.vue');
const CrystalQueryView = () => import(/* webpackChunkName: "crystal-query" */ '@/views/Items/CrystalQuery/index.vue');

export default {
  path: '/items',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Items').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/item-query'),
      icon: 'jam-box-f',
      path: '',
    }, {
      title: () => GetLang('Page Title/crystal-query'),
      icon: 'bx-bx-cube-alt',
      path: '/crystal',
    }],
  },
  children: [{
    path: '',
    component: ItemQueryView,
    meta: {
      title: () => GetLang('Page Title/item-query'),
    },
  }, {
    path: 'crystal',
    component: CrystalQueryView,
    meta: {
      title: () => GetLang('Page Title/crystal-query'),
    },
  }],
} as RouteRecordRaw;
