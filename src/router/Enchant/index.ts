
import type { RouteRecordRaw } from 'vue-router';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const vue_enchantSimulator = () => import(/* webpackChunkName: "enchant-simulator" */ '@/views/Enchant/EnchantSimulator/index.vue');
const vue_enchantDoll = () => import(/* webpackChunkName: "enchant-doll" */ '@/views/Enchant/EnchantDoll/index.vue');

export default {
  path: '/enchant',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('Stats', 'Enchant').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/enchant/enchant-simulator'),
      icon: 'mdi-cube-scan',
      path: '',
    }, {
      title: () => GetLang('Page Title/enchant/enchant-doll'),
      icon: 'mdi-leaf',
      path: '/doll',
    }],
  },
  children: [{
    path: '',
    component: vue_enchantSimulator,
    meta: {
      title: () => GetLang('Page Title/enchant/enchant-simulator'),
    },
  }, {
    path: 'doll',
    component: vue_enchantDoll,
    meta: {
      title: () => GetLang('Page Title/enchant/enchant-doll'),
    },
  }],
} as RouteRecordRaw;
