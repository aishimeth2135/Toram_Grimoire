import "@css/main/font/font.css";
import "@css/main/main.less";
import "@css/SaveLoad/main.css";
import "@css/main/Cyteria/Cyteria.css";

import routerInit from "./router/init.js";
routerInit();

import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

import vue_iconifyIcon from "@global-vue-components/iconify-icon.vue";
import vue_svgIcon from "@global-vue-components/svg-icon.vue";
import vue_langText from "@global-vue-components/lang-text.vue";

import vuecy_window from "@global-vue-components/Cyteria/window.vue";
import vuecy_button from "@global-vue-components/Cyteria/button.vue";
import vuecy_iconText from "@global-vue-components/Cyteria/icon-text.vue";
import vuecy_titleInput from "@global-vue-components/Cyteria/title-input.vue";
import vuecy_stickyHeader from "@global-vue-components/Cyteria/sticky-header.vue";
import vuecy_dragBar from "@global-vue-components/Cyteria/drag-bar.vue";
import vuecy_inputCounter from "@global-vue-components/Cyteria/input-counter.vue";

Vue.component('iconify-icon', vue_iconifyIcon);
Vue.component('svg-icon', vue_svgIcon);
Vue.component('lang-text', vue_langText);

Vue.component('cy-window', vuecy_window);
Vue.component('cy-button', vuecy_button);
Vue.component('cy-icon-text', vuecy_iconText);
Vue.component('cy-title-input', vuecy_titleInput);
Vue.component('cy-sticky-header', vuecy_stickyHeader);
Vue.component('cy-drag-bar', vuecy_dragBar);
Vue.component('cy-input-counter', vuecy_inputCounter);

import App from "./App.vue";
import router from "./router/index.js";

import VueAnalytics from 'vue-analytics';
import './registerServiceWorker'

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
