<template>
  <div
    v-if="supportOffscreenCanvas"
    class="absolute left-0 top-0 h-full w-full overflow-hidden opacity-100 duration-500"
    :class="{ ['!opacity-0']: !ready }"
  >
    <canvas
      ref="mainCanvas"
      :key="canvasKey"
      :width="canvasViewport.width"
      :height="canvasViewport.height"
    />
    <div
      class="absolute left-0 top-0 h-full w-full"
      style="backdrop-filter: blur(1px)"
    />
  </div>
</template>

<script lang="ts" setup>
import { Ref, ref, watch } from 'vue'

import { debounce } from '@/shared/utils/function'

import { useViewport } from '@/setup/Device'

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

  watch(mainCanvas, canvas => {
    if (canvas) {
      ready.value = false
      const offscreenCanvas = canvas.transferControlToOffscreen()
      worker.postMessage(
        {
          type: 'start',
          canvas: offscreenCanvas,
          width: viewport.width,
          height: viewport.height,
        },
        [offscreenCanvas]
      )

      setTimeout(() => (ready.value = true), 1000)
    }
  })

  const updateViewport = debounce((newViewport: typeof viewport) => {
    canvasKey.value += 1
    canvasViewport.value = {
      width: newViewport.width,
      height: newViewport.height,
    }
  }, 1000)

  watch(viewport, newViewport => {
    ready.value = false
    updateViewport(newViewport)
  })
}
</script>
