import '@/assets/css/font/font.css';
import '@/assets/css/main.css';
import '@/assets/css/global.css';
import '@/assets/css/tailwind.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router/index.js';
import store from '@/store';

import VueGtag from 'vue-gtag-next';

import RegisterLang from '@/plugin/RegisterLang.js';
import Notify from '@/plugin/Notify';
import Confirm from '@/plugin/Confirm';

import registerServiceWorker from './app/registerServiceWorker';
import registGlobalComponents from './app/registGlobalComponents';

const APP = createApp(App);
APP
  .use(router)
  .use(store)
  .use(RegisterLang)
  .use(Notify)
  .use(Confirm)
  .use(VueGtag, {
    property: {
      id: 'UA-140158974-1',
    },
  });

registGlobalComponents(APP);
registerServiceWorker();

APP.mount('#app');
