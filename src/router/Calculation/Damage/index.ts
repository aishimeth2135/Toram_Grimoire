
import type { RouteRecordRaw } from 'vue-router';

import ViewInit from '@/shared/services/ViewInit';

import WrapperView from './wrapper.vue';

const DamageCalculatiomView = () => import(/* webpackChunkName: "damage-calculation" */ '@/views/Calculation/DamageCalculation/index.vue');

export default {
  name: 'DamageCalculation',
  path: '/damage-calculation',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit('DamageCalculation').then(next);
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
} as RouteRecordRaw;
