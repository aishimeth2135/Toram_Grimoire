import '@/assets/css/font/font.css'
import '@/assets/css/main.css'
import '@/assets/css/global.css'
import '@/assets/css/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Confirm from '@/plugin/Confirm'
import Notify from '@/plugin/Notify'

import AppView from './App.vue'

import registerServiceWorker from './app/registerServiceWorker'
import registGlobalComponents from './app/registGlobalComponents'
import initPackages from './app/initPackages'
import initI18n from './app/initI18n'
import createAppRouter from './router'
import { useSettingStore } from './stores/app/setting'
import { initGtag } from './app/initGtag'

const app = createApp(AppView)

app.use(createPinia())

const router = createAppRouter()
app.use(router)

initGtag(app, router)

registGlobalComponents(app)
registerServiceWorker()
initPackages()
initI18n(app)

{
  const settingStore = useSettingStore()
  settingStore.initDocumentElementClassList()
}

// custom pulgins
app
  .use(Notify)
  .use(Confirm)

app.mount('#app')

