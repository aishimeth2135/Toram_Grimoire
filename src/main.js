import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/SaveLoad/main.css";
import "@css/main/Cyteria/Cyteria.css";

import routerInit from "./router/init.js";
routerInit();

import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

function registComponents(requireComponent, prefix='') {
  requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName);
    const componentName = fileName.split('/').pop().replace(/\.\w+$/, '');

    // console.log(`regist "${prefix + componentName}"...`);
    Vue.component(prefix + componentName, componentConfig.default || componentConfig);
  });
}

const requireComponent_global = require.context('./components/global', false, /[a-zA-Z-]+\.vue$/);
const requireComponent_cy = require.context('./components/global/Cyteria', false, /[a-zA-Z-]+\.vue$/);

registComponents(requireComponent_global);
registComponents(requireComponent_cy, 'cy-');

import App from "./App.vue";
import router from "./router/index.js";

import VueAnalytics from 'vue-analytics';
import './registerServiceWorker';

Vue.use(VueAnalytics, {
  id: 'UA-140158974-1',
  router,
  autoTracking: {
    pageviewOnLoad: false
  }
});

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
