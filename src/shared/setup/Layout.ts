import { computed } from 'vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { defineState } from '@/shared/setup/State'

export const usePageLayout = defineState(() => {
  const { currentRoute } = useRouter()

  const isTwoColumnsLayout = computed(
    () => currentRoute.value.meta.twoColumnsLayout === true
  )
  const isWideLayout = computed(
    () => currentRoute.value.meta.wideLayout === true
  )

  const layout = reactive({
    twoColumns: isTwoColumnsLayout,
    wide: isWideLayout,
  })

  return { layout }
})
