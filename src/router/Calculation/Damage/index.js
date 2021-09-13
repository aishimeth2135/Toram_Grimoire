
import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import app from './app.vue';

const vue_DamageCalculatiom = () => import(/* webpackChunkName: "damage-calculation" */ '@/views/Calculation/DamageCalculation');

export default {
  path: '/damage-calculation',
  component: app,
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
    component: vue_DamageCalculatiom,
    meta: {
      title: () => GetLang('Page Title/calculation/damage-calculation'),
    },
  }],
};
