<template>
  <div
    v-if="supportOffscreenCanvas"
    class="pointer-events-none absolute top-0 left-0 size-full overflow-hidden opacity-100 duration-500"
    :class="{ ['opacity-0!']: !ready }"
  >
    <canvas
      ref="mainCanvas"
      :key="canvasKey"
      :width="canvasViewport.width"
      :height="canvasViewport.height"
    />
    <div class="absolute top-0 left-0 size-full" style="backdrop-filter: blur(1px)" />
  </div>
</template>

<script lang="ts" setup>
import { type Ref, onUnmounted, ref, watch } from 'vue'

import { useViewport } from '@/shared/composables/Device'

import RenderSnowWorker from './render-snow?worker'

const supportOffscreenCanvas = !!window.OffscreenCanvas as boolean

const { viewport } = useViewport()

const mainCanvas: Ref<HTMLCanvasElement | null> = ref(null)
const ready = ref(false)

const canvasKey = ref(0)
const canvasViewport = ref({
  width: viewport.width,
  height: viewport.height,
})

if (supportOffscreenCanvas) {
  const worker = new RenderSnowWorker()
  let readyTimer: number | undefined
  let viewportTimer: number | undefined

  const updateVisibility = () => {
    worker.postMessage({ type: 'visibility', hidden: document.hidden })
  }
  document.addEventListener('visibilitychange', updateVisibility)

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', updateVisibility)
    window.clearTimeout(readyTimer)
    window.clearTimeout(viewportTimer)
    worker.terminate()
  })

  watch(mainCanvas, canvas => {
    if (canvas) {
      window.clearTimeout(readyTimer)
      ready.value = false
      const offscreenCanvas = canvas.transferControlToOffscreen()
      worker.postMessage(
        {
          type: 'start',
          canvas: offscreenCanvas,
          width: canvasViewport.value.width,
          height: canvasViewport.value.height,
          hidden: document.hidden,
        },
        [offscreenCanvas]
      )

      readyTimer = window.setTimeout(() => (ready.value = true), 1000)
    }
  })

  watch(viewport, newViewport => {
    window.clearTimeout(readyTimer)
    window.clearTimeout(viewportTimer)
    ready.value = false
    viewportTimer = window.setTimeout(() => {
      canvasKey.value += 1
      canvasViewport.value = {
        width: newViewport.width,
        height: newViewport.height,
      }
    }, 1000)
  })
}
</script>
