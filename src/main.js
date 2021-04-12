import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/SaveLoad/main.css";
import "@css/main/Cyteria/Cyteria.css";

import Vue from "vue";
import Vuex from 'vuex';

import RegisterLang from "@plugin/RegisterLang.js";

import CY from "@Utils/Cyteria";
import { InitLanguageSystem } from "@Services/Language";

// == [ pre Init ] =====================================
Vue.use(Vuex);
Vue.use(RegisterLang);

// == [ init ] =========================================
InitLanguageSystem();

if (CY.storageAvailable('localStorage')) {
  if (localStorage['app--font-family'] === undefined){
    localStorage.setItem('app--font-family', '1');
    document.body.classList.add('font-1');
  }
  else
    document.body.classList.add('font-' + localStorage['app--font-family']);
  if (localStorage['Theme--Night-Mode'] === '1')
    document.documentElement.classList.add('theme--night-mode');
}
// ======================================================

// == [ auto regist global components ] =================
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
// ======================================================

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