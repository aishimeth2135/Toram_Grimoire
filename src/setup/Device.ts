import { reactive } from 'vue'

import { debounce } from '@/shared/utils/function'

let device: {
  isMobile: boolean
  hasAside: boolean
}

export function useDevice() {
  if (device === undefined) {
    device = reactive({
      isMobile: false,
      hasAside: false,
    })
    const update = () => {
      device.isMobile = window.innerWidth < 800
      device.hasAside = window.innerWidth >= 1376
    }
    update()

    window.addEventListener('resize', debounce(update, 100))
  }

  return { device }
}

let viewport: {
  width: number
  height: number
}

export function useViewport() {
  if (viewport === undefined) {
    viewport = reactive({
      width: 0,
      height: 0,
    })
    const update = () => {
      viewport.width = window.innerWidth
      viewport.height = window.innerHeight
    }
    update()

    window.addEventListener('resize', debounce(update, 400))
  }

  return { viewport }
}
