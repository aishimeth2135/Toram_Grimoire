import type { App } from 'vue'

import { useLoadingStore } from '@/stores/app/loading'

import Notify from '@/shared/setup/Notify'

export default function (app: App) {
  const loadingStore = useLoadingStore()
  const { notify } = Notify()
  app.config.globalProperties.$notify = notify
  app.config.globalProperties.$notify.loading = {
    show() {
      loadingStore.show()
    },
    hide() {
      loadingStore.hide()
    },
  }
}
