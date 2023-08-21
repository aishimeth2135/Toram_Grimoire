import { reactive, watch } from 'vue'

import { debounce } from '@/shared/utils/function'

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
  const device = reactive({
    isMobile: false,
    hasAside: false,
  })

  watch(
    viewport,
    newViewport => {
      device.isMobile = newViewport.width <= 800
      device.hasAside = newViewport.width >= 1376
    },
    { immediate: true }
  )

  return { device }
})
