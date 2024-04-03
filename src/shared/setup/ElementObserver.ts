import { Ref, onUnmounted, watch } from 'vue'

export function useResizeObserver(
  target: Ref<HTMLElement | null>,
  cb: () => void
) {
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(cb)

    watch(target, (value, oldValue) => {
      if (value !== oldValue) {
        if (oldValue) {
          observer.unobserve(oldValue)
        }
        if (value) {
          observer.observe(value)
        }
      }
    })

    onUnmounted(() => {
      observer.disconnect()
    })
  } else {
    // for lagacy browser
    const observer = new MutationObserver(cb)
    const options = { childList: true, subtree: true }

    watch(target, (value, oldValue) => {
      if (value !== oldValue) {
        if (oldValue) {
          observer.disconnect()
        }
        if (value) {
          observer.observe(value, options)
        }
      }
    })

    onUnmounted(() => {
      observer.disconnect()
    })
  }
}
