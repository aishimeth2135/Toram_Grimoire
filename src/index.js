import Vue from "vue";
import Vuex from 'vuex'

import vue_iconifyIcon from "@global-vue-components/iconify-icon.vue";
import vue_svgIcon from "@global-vue-components/svg-icon.vue";
import vue_langText from "@global-vue-components/lang-text.vue";

import vuecy_window from "@global-vue-components/Cyteria/window.vue";
import vuecy_button from "@global-vue-components/Cyteria/button.vue";
import vuecy_iconText from "@global-vue-components/Cyteria/icon-text.vue";
import vuecy_titleInput from "@global-vue-components/Cyteria/title-input.vue";
import vuecy_stickyHeader from "@global-vue-components/Cyteria/sticky-header.vue";
import vuecy_dragBar from "@global-vue-components/Cyteria/drag-bar.vue";

Vue.component('iconify-icon', vue_iconifyIcon);
Vue.component('svg-icon', vue_svgIcon);
Vue.component('lang-text', vue_langText);

Vue.component('cy-window', vuecy_window);
Vue.component('cy-button', vuecy_button);
Vue.component('cy-icon-text', vuecy_iconText);
Vue.component('cy-title-input', vuecy_titleInput);
Vue.component('cy-sticky-header', vuecy_stickyHeader);
Vue.component('cy-drag-bar', vuecy_dragBar);

import App from "./App.vue";
import router from "./router/index.js";

new Vue({
  el: '#app',
  router,
  components: { 'app': App },
  template: '<app />'
});