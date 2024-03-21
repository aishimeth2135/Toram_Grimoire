import { reactive } from 'vue'
import { computed } from 'vue'

import { debounce } from '@/shared/utils/function'

import { usePageLayout } from './Layout'
import { defineState } from './State'

export const useViewport = defineState(() => {
  const viewport = reactive({
    width: 0,
    height: 0,
  })
  const update = () => {
    viewport.width = window.innerWidth
    viewport.height = window.innerHeight
  }
  update()

  window.addEventListener('resize', debounce(update, 400))

  return { viewport }
})

export const useDevice = defineState(() => {
  const { viewport } = useViewport()
  const { layout } = usePageLayout()

  const device = reactive({
    isMobile: computed(() => viewport.width <= 800),
    hasAside: computed(() => viewport.width >= 1376 && !layout.wide),
  })

  return { device }
})
