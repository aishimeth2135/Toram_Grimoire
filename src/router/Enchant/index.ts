
import type { RouteRecordRaw } from 'vue-router';

import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const EnchantSimulatorView = () => import(/* webpackChunkName: "enchant-simulator" */ '@/views/Enchant/EnchantSimulator/index.vue');
const EnchantDollView = () => import(/* webpackChunkName: "enchant-doll" */ '@/views/Enchant/EnchantDoll/index.vue');

export default {
  path: '/enchant',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Enchant').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: 'app.page-title.enchant-simulator',
      icon: 'mdi-cube-scan',
      path: '',
    }, {
      title: 'app.page-title.enchant-doll',
      icon: 'mdi-leaf',
      path: '/doll',
    }],
  },
  children: [{
    path: '',
    component: EnchantSimulatorView,
    meta: {
      title: 'app.page-title.enchant-simulator',
    },
  }, {
    path: 'doll',
    component: EnchantDollView,
    meta: {
      title: 'app.page-title.enchant-doll',
    },
  }],
} as RouteRecordRaw;
