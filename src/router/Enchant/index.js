import app from './app.vue';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

const vue_enchantSimulator = () => import(/* webpackChunkName: "enchant-simulator" */ '@/views/Enchant/EnchantSimulator');
const vue_enchantDoll = () => import(/* webpackChunkName: "enchant-doll" */ '@/views/Enchant/EnchantDoll');

export default {
  path: '/enchant',
  component: app,
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
};
