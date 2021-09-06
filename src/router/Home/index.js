import app from './app.vue';

import vue_home from '@/views/Home/Home';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit.js';

const vue_about = () => import(/* webpackChunkName: "home-about" */ '@/views/Home/About');

export default {
  path: '/',
  component: app,
  beforeEnter(to, from, next) {
    ViewInit().then(next);
  },
  meta: {
    title: null,
    leftMenuViewButtons: [{
      title: () => GetLang('Left Menu/Home/base'),
      icon: 'ant-design:home-outlined',
      path: '',
    }, {
      title: () => GetLang('Left Menu/Home/about'),
      icon: 'bx-bxs-star-half',
      path: 'about',
    }],
  },
  children: [{
    path: '',
    component: vue_home,
  }, {
    path: 'about',
    component: vue_about,
  }],
};
