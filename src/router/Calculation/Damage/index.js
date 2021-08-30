import app from './app.vue';

import GetLang from '@services/Language';
import ViewInit from '@services/ViewInit.js';

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
