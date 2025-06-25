<template>
  <div class="absolute left-0 top-0 h-full w-full overflow-hidden">
    <div
      v-for="starStyle in starStyles"
      :key="starStyle.id"
      class="app-home-decorate-star"
      :style="starStyle"
    />
    <div class="absolute left-0 top-0 h-full w-full" style="backdrop-filter: blur(1px)" />
  </div>
</template>

<script lang="ts" setup>
import { type CSSProperties, computed } from 'vue'

import { useViewport } from '@/shared/setup/Device'
import { createEmptyArray } from '@/shared/utils/array'
import { getRandomInt, numberToFixed } from '@/shared/utils/number'

interface StarShadow {
  x: number
  y: number
  opacity: number
}

const getRandomShadow = (): StarShadow => {
  return {
    x: getRandomInt(20, 981),
    y: getRandomInt(20, 981),
    opacity: getRandomInt(65, 101),
  }
}

const stars = createEmptyArray(9).map(() => ({
  shadows: createEmptyArray(15).map(() => getRandomShadow()),
  animationDuration: getRandomInt(60, 120),
  animationDelay: getRandomInt(-45, 30),
  width: getRandomInt(4, 12),
}))

const { viewport } = useViewport()

interface CSSPropertiesWithId extends CSSProperties {
  id: number
}

const starStyles = computed(() => {
  const { width: _width, height: _height } = viewport
  const width = _width * 2
  const height = _height * 2
  return stars.map(({ shadows, animationDuration, animationDelay, width: starWidth }, idx) => {
    const shadowDatas = shadows.map(item => {
      const shadowX = Math.floor((width * item.x) / 1000)
      const shadowY = Math.floor((height * item.y) / 1000)
      const opacity = numberToFixed(item.opacity / 100, 2)
      return `${shadowX}px ${shadowY}px rgba(255, 255, 255, ${opacity})`
    })
    return {
      id: idx,
      boxShadow: shadowDatas.join(','),
      animationDuration: `${animationDuration}s`,
      animationDelay: `${animationDelay}s`,
      width: `${starWidth}px`,
      height: `${starWidth}px`,
    } as CSSPropertiesWithId
  })
})
</script>

<style>
.app-home-decorate-star {
  border-radius: 999px;
  background-color: transparent;
  animation-name: app-home-decorate-star-floating;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  position: absolute;
  top: -75%;
  left: 0;
  opacity: 0;
}

@keyframes app-home-decorate-star-floating {
  0% {
    top: -75%;
    opacity: 0;
  }
  2% {
    opacity: 1;
  }
  98% {
    top: 100%;
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}
</style>
