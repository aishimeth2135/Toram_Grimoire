import '@/assets/css/font/font.css';
import '@/assets/css/main.css';
import '@/assets/css/global.css';
import '@/assets/css/tailwind.css';

import { createApp } from 'vue';
import VueGtag from 'vue-gtag-next';

import store from '@/store';

import Confirm from '@/plugin/Confirm';
import Notify from '@/plugin/Notify';
import RegisterLang from '@/plugin/RegisterLang.js';

import AppView from './App.vue';
import registerServiceWorker from './app/registerServiceWorker';
import registGlobalComponents from './app/registGlobalComponents';
import initPackages from './app/initPackages';
import router from './router/index.js';

const app = createApp(AppView);
app
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

registGlobalComponents(app);
registerServiceWorker();
initPackages();

app.mount('#app');
