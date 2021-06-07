import '@/assets/css/tailwind.css';

import "@/assets/css/main/font/font.css";
import "@/assets/css/main/main.less";
import "@/assets/css/SaveLoad/main.css";
import "@/assets/css/main/Cyteria/Cyteria.css";

import { InitLanguageSystem } from "@services/Language";

// == [ init ] =========================================
InitLanguageSystem();

// ======================================================
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router/index.js";
import store from "@/store";

import VueGtag from "vue-gtag-next";

import RegisterLang from "@/plugin/RegisterLang.js";
import Notify from "@/plugin/Notify";
import Confirm from "@/plugin/Confirm";

import registerServiceWorker from './registerServiceWorker';

const APP = createApp(App);
APP
  .use(router)
  .use(store)
  .use(RegisterLang)
  .use(Notify)
  .use(Confirm)
  .use(VueGtag, {
    property: {
      id: 'UA-140158974-1'
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

registerServiceWorker();

APP.mount('#app');