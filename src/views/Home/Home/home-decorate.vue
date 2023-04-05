<template>
  <div class="absolute left-0 top-0 h-full w-full overflow-hidden">
    <div
      v-for="starStyle in starStyles"
      :key="starStyle.id"
      :class="classes.star"
      :style="starStyle"
    />
    <div
      class="absolute left-0 top-0 h-full w-full"
      style="backdrop-filter: blur(1px)"
    />
  </div>
</template>

<script lang="ts" setup>
import { CSSProperties, computed, useCssModule } from 'vue'

import { createEmptyArray } from '@/shared/utils/array'
import { getRandomInt, numberToFixed } from '@/shared/utils/number'

import { useViewport } from '@/setup/Device'

interface StarShadow {
  x: number
  y: number
  opacity: number
}

const getRandomShadow = (): StarShadow => {
  return {
    x: getRandomInt(-1200, 1201),
    y: getRandomInt(-1200, 1201),
    opacity: getRandomInt(65, 101),
  }
}

const stars = createEmptyArray(12).map(() => ({
  shadows: createEmptyArray(120).map(() => getRandomShadow()),
  animationDuration: getRandomInt(900, 1200),
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
  return stars.map(({ shadows, animationDuration, width: starWidth }, idx) => {
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
      width: `${starWidth}px`,
      height: `${starWidth}px`,
    } as CSSPropertiesWithId
  })
})

const classes = useCssModule()
</script>

<style lang="postcss" module>
.star {
  border-radius: 999px;
  background-color: transparent;
  animation-name: star-floating;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  position: absolute;
  top: -50%;
  left: -50%;
}

@keyframes star-floating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
