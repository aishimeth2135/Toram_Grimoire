import { computed } from 'vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { defineState } from '@/shared/composables/State'

export const usePageLayout = defineState(() => {
  const { currentRoute } = useRouter()

  const isTwoColumnsLayout = computed(() => currentRoute.value.meta.twoColumnsLayout === true)
  const isWideLayout = computed(() => currentRoute.value.meta.wideLayout === true)
  const isFillHeightLayout = computed(() => currentRoute.value.meta.fillHeightLayout === true)

  const layout = reactive({
    twoColumns: isTwoColumnsLayout,
    wide: isWideLayout,
    fillHeight: isFillHeightLayout,
  })

  return { layout }
})
