import type { RouteRecordRaw } from 'vue-router';

import ViewInit from '@/shared/services/ViewInit';

import HomeView from '@/views/Home/Home/index.vue';

import WrapperView from './wrapper.vue';

const AboutView = () => import(/* webpackChunkName: "home-about" */ '@/views/Home/About/index.vue');

export default {
  name: 'Index',
  path: '/',
  component: WrapperView,
  beforeEnter(to, from, next) {
    ViewInit().then(next);
  },
  meta: {
    title: null,
    leftMenuViewButtons: [{
      title: 'app.page-title.home',
      icon: 'ant-design:home-outlined',
      path: '',
    }, {
      title: 'app.page-title.about',
      icon: 'bx-bxs-star-half',
      path: 'about',
    }],
  },
  children: [{
    name: 'Home',
    path: '',
    component: HomeView,
  }, {
    name: 'About',
    path: 'about',
    component: AboutView,
    meta: {
      title: 'app.page-title.about',
    },
  }],
} as RouteRecordRaw;
