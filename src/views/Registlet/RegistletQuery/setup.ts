import { reactive } from 'vue'

import { ViewNames } from '@/shared/consts/view'
import { defineViewState } from '@/shared/setup/State'

export type DisplayMode = 'category' | 'obtain-level'

export const useRegistletQueryState = defineViewState(ViewNames.RegistletQuery, () => {
  const registletQueryState = reactive({
    itemDefaultVisible: false,
    displayMode: 'category' as DisplayMode,
  })

  return { registletQueryState }
})
