import app from "./app.vue";

import vue_home from "@views/Home/Home/main.vue";
import vue_about from "@views/Home/About/main.vue";

import GetLang from "@Service/Language";
import ViewInit from "@Service/ViewInit.js";

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
      icon: 'gridicons-user',
      path: '/'
    }, {
      title: () => GetLang('Left Menu/Home/about'),
      icon: 'bx-bxs-star-half',
      path: '/about'
    }]
  },
  children: [{
    path: '',
    component: vue_home
  }, {
    path: 'about',
    component: vue_about
  }]
};