<template>
  <AppLayoutMain ref="rootEl" class="app-home">
    <div class="flex justify-center items-center">
      <div class="pt-2 sticky top-0 h-32">
        <router-link v-slot="{ navigate }" :to="{ name: AppRouteNames.Bubble, params: { iconName: 'potum' } }" custom>
          <div class="app-title-wrapper" @mouseenter="initAppIconPosition">
            <div
              ref="appIcon"
              class="mr-5 flex app-title-icon"
              :style="appIconPositionStyle"
              :class="{ 'app-title-icon-touched': iconWrapperTouched }"
            >
              <cy-icon-text
                icon="grimoire-cat"
                icon-src="custom"
                icon-width="2.75rem"
              />
            </div>
            <div v-if="iconWrapperTouched" class="mr-5 flex app-title-icon invisible">
              <cy-icon-text
                icon="grimoire-cat"
                icon-src="custom"
                icon-width="2.75rem"
              />
            </div>
            <div class="app-title" @click="navigate">
              Cy's Grimoire
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div class="w-full px-2 mt-auto">
      <section
        ref="mainSection"
        class="flex justify-center flex-wrap py-6 rounded-3xl app-home-main-section"
        @mousemove="pointMove"
        @mouseleave="pointLeave"
      >
        <div class="app-home-main-point" :style="pointPosition" />
        <HomeLinkButton
          v-for="data in columns"
          :key="data.name + '|' + data.pathName"
          :data="data"
          :style="linkButtonWrapperStyle"
          class="cy--home-link-button-wrapper"
        />
      </section>
    </div>
    <footer class="flex items-center justify-center w-full px-2 h-32 mt-auto">
      <div class="flex items-center sticky bottom-0 space-x-4 py-4">
        <AppSetting />
        <router-link v-slot="{ navigate }" :to="{ name: AppRouteNames.About }" custom>
          <cy-button-plain icon="bx-bxs-star-half" @click="navigate">
            {{ t('app.page-title.about') }}
          </cy-button-plain>
        </router-link>
      </div>
    </footer>
  </AppLayoutMain>
</template>

<script lang="ts">
export default {
  name: 'AppHome',
}
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { nextTick, onMounted, onUnmounted, reactive, ref, Ref, watch } from 'vue'

import { ROUTE_LINK_DATAS } from '@/shared/consts'
import { debounce } from '@/shared/utils/function'
import { getRandomInt, numberToFixed } from '@/shared/utils/number'

import AppSetting from '@/views/app/app-settings.vue'
import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import { AppRouteNames } from '@/router/enums'

import HomeLinkButton from './home-link-button.vue'

const columns = ROUTE_LINK_DATAS

const { t } = useI18n()

const mainSection: Ref<HTMLElement | null> = ref(null)
const pointPosition = reactive({
  top: '0px',
  left: '0px',
  display: 'none',
})

const pointMove = debounce((evt: MouseEvent) => {
  if (mainSection.value) {
    const rect = mainSection.value.getBoundingClientRect()
    const left = (evt.clientX - rect.left)
    const top = (evt.clientY - rect.top)
    if (left >= 0 && top >= 0) {
      pointPosition.left = left + 'px'
      pointPosition.top = top + 'px'
      pointPosition.display = 'block'
    }
  }
}, 10)
const pointLeave = () => {
  setTimeout(() => pointPosition.display = 'none', 20)
}

const rootEl: Ref<{ $el: HTMLElement } | null> = ref(null)
const appIcon: Ref<HTMLElement | null> = ref(null)
const iconWrapperTouched = ref(false)
const appIconPosition: Ref<{ x: number; y: number } | null> = ref(null)
const appIconPositionStyle: Ref<Record<string, string> | undefined> = ref(undefined)
let appIconAnimating = false
let mouseTrackIconListener: ((evt: MouseEvent) => void) | null = null

const updateAppIconPositionStyle = async () => {
  if (!appIconPosition.value) {
    return
  }
  await nextTick()
  appIconPositionStyle.value = {
    left: numberToFixed(appIconPosition.value.x, 2) + '%',
    top: numberToFixed(appIconPosition.value.y, 2) + '%',
  } as Record<string, string>
  appIconAnimating = true
  setTimeout(() => appIconAnimating = false, 175)
}

const initAppIconPosition = async () => {
  const rect = appIcon.value!.getBoundingClientRect()
  appIconPosition.value = {
    x: rect.left * 100 / window.innerWidth,
    y: rect.top * 100 / window.innerHeight,
  }
  await updateAppIconPositionStyle()
  await nextTick()
  iconWrapperTouched.value = true
}

const unwatchIconTouched = watch(iconWrapperTouched, newValue => {
  if (rootEl.value && appIcon.value) {
    const BOUNDING = 8 // persentage
    const ICON_HITBOX_PADDING = 4 // px

    // direction
    let directionX = 1
    let directionY = 1

    // control extra move distance when touching bounding
    let directionXExtra = 0
    let directionYExtra = 0

    // offset of random probability
    const directionRandomRange = 128
    let directionXRandomOffset = 0
    let directionYRandomOffset = 0

    const getXP = (value: number) => value * 100 / window.innerWidth
    const getYP = (value: number) => value * 100 / window.innerHeight

    const setRemoveText = (() => {
      let removeTextTimer: any | null = null
      return () => {
        clearTimeout(removeTextTimer)
        removeTextTimer = setTimeout(() => {
          rootEl.value?.$el.querySelectorAll('.app-icon-touched-text').forEach(el => el.remove())
        }, 3000)
      }
    })()

    unwatchIconTouched()
    mouseTrackIconListener = debounce((evt: MouseEvent) => {
      if (appIconAnimating) {
        return
      }
      const rect = appIcon.value!.getBoundingClientRect()
      const iconRadius = (rect.width / 2)
      const iconRadiusXP = getXP(iconRadius)
      const iconRadiusYP = getYP(iconRadius)
      const distanceX = Math.abs(evt.clientX - rect.left - iconRadius)
      const distanceY = Math.abs(evt.clientY - rect.top - iconRadius)
      const hitboxRadius = iconRadius + ICON_HITBOX_PADDING
      if (distanceX <= hitboxRadius || distanceY <= hitboxRadius) {
        const clientXP = getXP(evt.clientX)
        const clientYP = getYP(evt.clientY)
        const hitboxXP = getXP(hitboxRadius)
        const hitboxYP = getYP(hitboxRadius)
        let newX = 0
        let newY = 0
        let maxRetries = 10
        do {
          newX = appIconPosition.value!.x + getRandomInt(Math.min(iconRadiusXP + 2, BOUNDING - 3) + directionXExtra, BOUNDING + directionXExtra) * directionX
          newY = appIconPosition.value!.y + getRandomInt(Math.min(iconRadiusYP + 2, BOUNDING - 3) + directionYExtra, BOUNDING + directionYExtra) * directionY
          maxRetries -= 1
        } while (((clientXP - newX) ** 2 + (clientYP - newY) ** 2) * 10 <= (hitboxXP ** 2 + hitboxYP ** 2) * 12 && maxRetries >= 0)

        if (newX >= 100 - BOUNDING) {
          directionX = -1
          directionXExtra = 5
        } else if (newX <= BOUNDING) {
          directionX = 1
          directionXExtra = 5
        } else {
          directionX = ((Math.random() * directionRandomRange - directionXRandomOffset) >= directionRandomRange / 2) ? 1 : -1
          directionXRandomOffset += directionX * getRandomInt(1, 4)
          directionXExtra = 0
        }
        if (newY >= 100 - BOUNDING) {
          directionY = -1
          directionYExtra = 5
        } else if (newY <= BOUNDING) {
          directionY = 1
          directionYExtra = 5
        } else {
          directionY = ((Math.random() * directionRandomRange - directionYRandomOffset) >= directionRandomRange / 2) ? 1 : -1
          directionYRandomOffset += directionY * getRandomInt(1, 4)
          directionYExtra = 0
        }
        const textEl = document.createElement('div')
        textEl.innerHTML = 'MISS'
        textEl.classList.add('app-icon-touched-text')
        textEl.style.left = `${appIconPosition.value!.x + iconRadiusXP}%`
        textEl.style.top = `${appIconPosition.value!.y - iconRadiusXP * 3}%`
        rootEl.value!.$el.append(textEl)
        setRemoveText()
        appIconPosition.value = {
          x: newX,
          y: newY,
        }
        updateAppIconPositionStyle()
      }
    }, 10)
    document.body.addEventListener('mousemove', mouseTrackIconListener)
  }
})

let linkButtonWrapperStyle: Ref<string | null> = ref(null)

onMounted(async () => {
  await nextTick()
  if (mainSection.value && mainSection.value.offsetHeight) {
    const wrappers = mainSection.value.querySelectorAll('.cy--home-link-button-wrapper')
    let max = 0
    wrappers.forEach(node => {
      const rect = node.getBoundingClientRect()
      max = Math.max(max, rect.width)
    })
    linkButtonWrapperStyle.value = `width: ${max}px`
  }
})

onUnmounted(() => {
  if (mouseTrackIconListener) {
    document.body.removeEventListener('mousemove', mouseTrackIconListener)
  }
})
</script>

<style lang="postcss" scoped>
.app-home {
  &:deep(.app-icon-touched-text) {
    @apply text-light-3 fixed pointer-events-none opacity-0;
    animation: app-icon-touched-text 2.5s linear;
  }
}

@keyframes app-icon-touched-text {
  0% {
    opacity: 1;
    transform: translate(0, 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, -200%);
  }
}

.app-home-main-section {
  @apply relative overflow-hidden;

  &::before {
    content: '';
    opacity: 0.75;

    @apply w-full h-full bg-white absolute top-0 left-0;
  }

  & > .app-home-main-point {
    @apply bg-light bg-opacity-50 w-8 h-8 absolute rounded-full pointer-events-none duration-200 ease-out;
    transform: translate(-50%, -50%);
    animation: app-home-main-point 2.5s ease infinite;
  }
}

@keyframes app-home-main-point {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 1;
  }
}

.app-title-wrapper {
  @apply flex items-center pt-4 px-6 rounded-2xl;
  padding-bottom: 1.5rem;
}

.app-title {
  /* @apply bg-clip-text text-transparent text-4xl;

  background-image: linear-gradient(to left, #f9a5bf, #fecfef, #f9a5bf, #fecfef, #f9a5bf);
  background-size: 200% 200%;
  background-position: 100% 50%;
  animation: app-title 2s ease-in infinite; */
  @apply text-4xl;
  color: var(--app-favicon-color-main);
}

@keyframes app-title {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.app-title-icon {
  /* &:deep(path:nth-child(1)) {
    animation: app-title-icon-path-fill 1.5s ease infinite;
  }
  &:deep(path:nth-child(2)) {
    animation: app-title-icon-path-fill 2s ease infinite;
  }
  &:deep(path:nth-child(3)) {
    animation: app-title-icon-path-fill 2.5s ease infinite;
  }
  &:deep(path:nth-child(4)) {
    animation: app-title-icon-path-fill 3s ease infinite;
  }
  &:deep(path:nth-child(5)) {
    animation: app-title-icon-path-fill 3.5s ease infinite;
  }
  &:deep(path:nth-child(6)) {
    animation: app-title-icon-path-fill 4s ease infinite;
  }
  animation: move-rotate ease 0.75s infinite;
  z-index: 200;
  position: fixed;
  top: calc(50% - 20rem);
  left: calc(50% - 20rem); */
  /* &:deep(path:nth-child(5)) {
    animation: loading-icon 4s ease infinite;
  } */
  animation: loading-icon 4s ease infinite;

  @apply pointer-events-none;

  &.app-title-icon-touched {
    animation: none;
    transition: 0.2s;
    z-index: 200;
    position: fixed;
    margin-right: 0;
  }
}

@keyframes app-title-icon-path-bg {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
}

/* @keyframes app-title-icon-path-fill {
  0% {
    fill: var(--app-light);
  }
  10% {
    fill: var(--app-light-3);
  }
  20% {
    fill: var(--app-dark-light);
  }
  30% {
    fill: var(--app-purple);
  }
  40% {
    fill: var(--app-blue-purple);
  }
  50% {
    fill: var(--app-water-blue);
  }
  60% {
    fill: var(--app-blue-green);
  }
  70% {
    fill: var(--app-green);
  }
  80% {
    fill: var(--app-orange);
  }
  90% {
    fill: var(--app-red);
  }
  100% {
    fill: var(--app-light);
  }
} */

@keyframes loading-icon {
  0% {
    transform: translate(0, 5%);
  }
  25% {
    transform: translate(0, -10%);
  }
  50% {
    transform: translate(0, 5%);
  }
  75% {
    transform: translate(0, -5%);
  }
  100% {
    transform: translate(0, 5%);
  }
}
</style>
