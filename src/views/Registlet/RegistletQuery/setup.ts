import { reactive } from 'vue'

import { defineViewState } from '@/shared/composables/State'
import { ViewNames } from '@/shared/consts/view'

export type DisplayMode = 'category' | 'obtain-level'

export const useRegistletQueryState = defineViewState(ViewNames.RegistletQuery, () => {
  const registletQueryState = reactive({
    itemDefaultVisible: false,
    displayMode: 'category' as DisplayMode,
  })

  return { registletQueryState }
})
