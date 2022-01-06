
import type { RouteRecordRaw } from 'vue-router';

import { DataStoreIds } from '@/stores/app/datas/enums';

import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const EnchantSimulatorView = () => import(/* webpackChunkName: "enchant-simulator" */ '@/views/Enchant/EnchantSimulator/index.vue');
const EnchantDollView = () => import(/* webpackChunkName: "enchant-doll" */ '@/views/Enchant/EnchantDoll/index.vue');

export default {
  name: 'Enchant',
  path: '/enchant',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit(DataStoreIds.Stats, DataStoreIds.Enchant).then(next);
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
} as RouteRecordRaw;
