import { createPinia } from 'pinia'
import { createApp } from 'vue'

import '@/assets/css/app.css'
import '@/assets/css/font/font.css'
import '@/assets/css/global.css'
import '@/assets/css/main.css'
import '@/assets/css/tailwind.css'
import Confirm from '@/plugin/Confirm'
import Notify from '@/plugin/Notify'

import AppView from './App.vue'

import { initGtag } from './app/initGtag'
import initI18n from './app/initI18n'
import initPackages from './app/initPackages'
import registGlobalComponents from './app/registGlobalComponents'
import registerServiceWorker from './app/registerServiceWorker'
import createAppRouter from './router'
import { useSettingStore } from './stores/app/setting'

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
app.use(Notify).use(Confirm)

app.mount('#app')
