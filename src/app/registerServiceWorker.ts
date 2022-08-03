import { registerSW } from 'virtual:pwa-register'

import { useMainStore } from '@/stores/app/main'

import Grimoire from '@/shared/Grimoire'

import Notify from '@/setup/Notify'

export default function () {
  if (import.meta.env.PROD) {
    const mainStore = useMainStore()
    const { notify } = Notify()
    const updateSW = registerSW({
      onNeedRefresh() {
        mainStore.serviceWorkerHasUpdate(updateSW)
        notify(Grimoire.i18n.t('app.settings.update.new-version-detected-tips'))
      },
      onRegisterError(error) {
        console.warn('[sw] Error during service worker registration.')
        console.error(error)
      },
    })
  }
}
