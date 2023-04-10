<template>
  <div
    class="absolute left-0 top-0 h-full w-full overflow-hidden opacity-100 duration-500"
    :class="{ ['!opacity-0']: !started }"
  >
    <canvas
      ref="mainCanvas"
      :width="viewport.width"
      :height="viewport.height"
    />
    <div
      class="absolute left-0 top-0 h-full w-full"
      style="backdrop-filter: blur(1px)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Ref } from 'vue'
import { watch } from 'vue'

import { useViewport } from '@/setup/Device'

import RenderSnowWorker from './render-snow?worker'

const { viewport } = useViewport()

const mainCanvas: Ref<HTMLCanvasElement | null> = ref(null)
const started = ref(false)

try {
  const worker = new RenderSnowWorker()

  watch(mainCanvas, canvas => {
    if (canvas) {
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

      watch(viewport, newViewport => {
        worker.postMessage({
          type: 'viewport-changed',
          width: newViewport.width,
          height: newViewport.height,
        })
      })

      setTimeout(() => (started.value = true), 1000)
    }
  })
} catch (err) {
  // not support worker?
}
</script>
