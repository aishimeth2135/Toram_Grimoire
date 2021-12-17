import type { RouteRecordRaw } from 'vue-router';

import GetLang from '@/shared/services/Language';
import ViewInit from '@/shared/services/ViewInit';

import HomeView from '@/views/Home/Home/index.vue';

import WrapperView from './wrapper.vue';

const AboutView = () => import(/* webpackChunkName: "home-about" */ '@/views/Home/About/index.vue');

export default {
  path: '/',
  component: WrapperView,
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
    component: HomeView,
  }, {
    path: 'about',
    component: AboutView,
  }],
} as RouteRecordRaw;
