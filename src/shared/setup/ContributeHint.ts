import { watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Notify from './Notify'

export function useContributeHint(isEmpty: ComputedRef<boolean> | Ref<boolean>) {
  const { notify } = Notify()
  const { t } = useI18n()

  watch(isEmpty, val => {
    if (val) {
      notify(t('app.contribute-hint.message'), 'mdi:github', 'contribute-hint', {
        buttons: [
          {
            text: t('app.contribute-hint.button'),
            click: () => window.open('/about#cy--about-contribute', '_blank'),
            removeMessageAfterClick: true,
          },
        ],
      })
    }
  })
}
