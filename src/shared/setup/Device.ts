import { reactive, watch } from 'vue'

import { debounce } from '@/shared/utils/function'

let _viewport: {
  width: number
  height: number
}

export function useViewport() {
  if (_viewport === undefined) {
    _viewport = reactive({
      width: 0,
      height: 0,
    })
    const update = () => {
      _viewport.width = window.innerWidth
      _viewport.height = window.innerHeight
    }
    update()

    window.addEventListener('resize', debounce(update, 400))
  }

  return { viewport: _viewport }
}

let _device: {
  isMobile: boolean
  hasAside: boolean
}

export function useDevice() {
  if (_device === undefined) {
    const { viewport } = useViewport()
    _device = reactive({
      isMobile: false,
      hasAside: false,
    })

    watch(
      viewport,
      newViewport => {
        _device.isMobile = newViewport.width <= 800
        _device.hasAside = newViewport.width >= 1376
      },
      { immediate: true }
    )
  }

  return { device: _device }
}
