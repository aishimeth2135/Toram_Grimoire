import '@/assets/css/font/font.css'
import '@/assets/css/main.css'
import '@/assets/css/global.css'
import '@/assets/css/tailwind.css'

import { createApp } from 'vue'
import VueGtag from 'vue-gtag-next'
import { createPinia } from 'pinia'

import { InitLanguageSystem } from '@/shared/services/Language'

import Confirm from '@/plugin/Confirm'
import Notify from '@/plugin/Notify'
import RegisterLang from '@/plugin/RegisterLang'

import AppView from './App.vue'

import registerServiceWorker from './app/registerServiceWorker'
import registGlobalComponents from './app/registGlobalComponents'
import initPackages from './app/initPackages'
import initI18n from './app/initI18n'
import createAppRouter from './router'
import { useSettingStore } from './stores/app/setting'

const app = createApp(AppView)

app
  .use(createPinia())
  .use(createAppRouter())
  .use(VueGtag, {
    property: {
      id: 'UA-140158974-1',
    },
  })

registGlobalComponents(app)
registerServiceWorker()
initPackages()
initI18n(app)
InitLanguageSystem()

{
  const settingStore = useSettingStore()
  settingStore.initDocumentElementClassList()
}

// custom pulgins
app
  .use(RegisterLang)
  .use(Notify)
  .use(Confirm)

app.mount('#app')

