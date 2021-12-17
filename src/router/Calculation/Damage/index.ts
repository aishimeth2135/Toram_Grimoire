
import type { RouteRecordRaw } from 'vue-router';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const DamageCalculatiomView = () => import(/* webpackChunkName: "damage-calculation" */ '@/views/Calculation/DamageCalculation/index.vue');

export default {
  path: '/damage-calculation',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('DamageCalculation').then(next);
  },
  meta: {
    leftMenuViewButtons: [{
      title: () => GetLang('Page Title/calculation/damage-calculation'),
      icon: 'mdi-sword',
      path: '',
    }],
  },
  children: [{
    path: '',
    component: DamageCalculatiomView,
    meta: {
      title: () => GetLang('Page Title/calculation/damage-calculation'),
    },
  }],
} as RouteRecordRaw;
