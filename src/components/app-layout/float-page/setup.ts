import { Ref, watch } from 'vue'
import { onMounted } from 'vue'

import { defineState } from '@/shared/setup/State'
import { removeElement } from '@/shared/utils/array'

export const useFloatPageClose = defineState(() => {
  const handlerStack: (() => void)[] = []

  document.body.addEventListener('keydown', evt => {
    if (evt.code === 'Escape') {
      handlerStack.pop()?.()
    }
  })

  const registPageClose = (visible: Ref<boolean>, closeHandler: () => void) => {
    watch(visible, value => {
      if (value) {
        handlerStack.push(closeHandler)
      } else {
        removeElement(handlerStack, closeHandler)
      }
    })

    // unregist
    onMounted(() => removeElement(handlerStack, closeHandler))
  }

  return {
    registPageClose,
  }
})
