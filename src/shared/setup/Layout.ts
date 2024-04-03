import { computed } from 'vue'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { defineState } from '@/shared/setup/State'

// import { debounce } from '../utils/function'

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

// interface ScrollChangedEvent {
//   (scrollDiff: number): void
// }

// export function useAppScrollDetect(onScrollChanged: ScrollChangedEvent) {
//   const el = document.getElementById('app-root')!

//   let lastTop = 0

//   const handler = () => {
//     const top = el.scrollTop
//     onScrollChanged(top - lastTop)
//     lastTop = top
//   }

//   el.addEventListener('scroll', debounce(handler, 200), { passive: true })
// }
