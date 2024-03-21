import { onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import Notify from './Notify'

type AutoSaveOptions = {
  readonly save: () => void
  readonly loadFirst: () => void
}

export default function ({ save, loadFirst }: AutoSaveOptions): void {
  const { t } = useI18n()
  const { notify } = Notify()

  try {
    loadFirst()
  } catch (error) {
    notify(t('common.auto-save.load-unknown-error-tips'))
    return
  }
  const saveHandler = () => {
    try {
      save()
    } catch (error) {
      notify(t('common.auto-save.save-unknown-error-tips'))
      console.error(error)
    }
  }
  const beforeunload = () => saveHandler()
  const visibilitychange = () =>
    document.visibilityState === 'hidden' && saveHandler()
  window.addEventListener('beforeunload', beforeunload)
  document.addEventListener('visibilitychange', visibilitychange)
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeunload)
    document.removeEventListener('visibilitychange', visibilitychange)
    saveHandler()
  })
}
