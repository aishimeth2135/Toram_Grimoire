import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/SaveLoad/main.css";
import "@css/main/Cyteria/Cyteria.css";

import { createApp } from "vue";

import '@css/tailwind.css';

import RegisterLang from "@plugin/RegisterLang.js";
import ToggleService from "@plugin/ToggleService.js";

import CY from "@Utils/Cyteria";
import { InitLanguageSystem } from "@Services/Language";

// == [ init ] =========================================
InitLanguageSystem();

if (CY.storageAvailable('localStorage')) {
  if (localStorage['app--font-family'] === undefined){
    localStorage.setItem('app--font-family', '1');
    document.documentElement.classList.add('font-1');
  }
  else {
    document.documentElement.classList.add('font-' + localStorage['app--font-family']);
  }
  if (localStorage['Theme--Night-Mode'] === '1') {
    document.documentElement.classList.add('theme--night-mode');
  }
}
// ======================================================

import App from "./App.vue";
import router from "./router/index.js";
import store from "@store/main";

import VueAnalytics from 'vue-analytics';
import './registerServiceWorker';

const APP = createApp(App);
APP
  .use(router)
  .use(store)
  .use(RegisterLang)
  .use(ToggleService)
  .use(VueAnalytics, {
    id: 'UA-140158974-1',
    router,
    autoTracking: {
      pageviewOnLoad: false
    }
  });

/* == [ auto regist global components ] ================= */
function registComponents(requireComponent, prefix='') {
  requireComponent.keys().forEach(fileName => {
    const componentConfig = requireComponent(fileName);
    const componentName = fileName.split('/').pop().replace(/\.\w+$/, '');
    APP.component(prefix + componentName, componentConfig.default || componentConfig);
  });
}

const requireComponent_global = require.context('./components/global', false, /[a-zA-Z-]+\.vue$/);
const requireComponent_cy = require.context('./components/global/Cyteria', false, /[a-zA-Z-]+\.vue$/);

registComponents(requireComponent_global);
registComponents(requireComponent_cy, 'cy-');
// ======================================================

APP.mount('#app');