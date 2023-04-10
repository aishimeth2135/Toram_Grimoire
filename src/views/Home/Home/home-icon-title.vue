<template>
  <div
    @click="iconWrapperTouchedCount += 1"
    @mouseenter="iconWrapperTouchedCount += 1"
  >
    <div
      ref="appIcon"
      class="flex"
      :class="{
        [classes.titleIcon]: true,
        invisible: iconWrapperTouched,
      }"
    >
      <cy-icon-text icon="grimoire-cat" icon-src="custom" icon-width="2.5rem" />
    </div>
    <teleport v-if="iconWrapperTouched" :to="rootEl">
      <div
        ref="appIconTouched"
        class="flex"
        :class="[classes.titleIcon, classes.titleIconTouched]"
        :style="appIconPositionStyle"
      >
        <cy-icon-text
          icon="grimoire-cat"
          icon-src="custom"
          icon-width="2.5rem"
        />
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import {
  Ref,
  nextTick,
  onUnmounted,
  ref,
  toRefs,
  useCssModule,
  watch,
} from 'vue'

import { debounce } from '@/shared/utils/function'
import { getRandomInt, numberToFixed } from '@/shared/utils/number'

interface Props {
  rootEl: HTMLElement | null
}

const props = defineProps<Props>()
const { rootEl } = toRefs(props)

const classes = useCssModule()

const iconWrapperTouched = ref(false)

const appIcon: Ref<HTMLElement | null> = ref(null)
const appIconTouched: Ref<HTMLElement | null> = ref(null)

const iconWrapperTouchedCount = ref(0)
const appIconPosition: Ref<{ x: number; y: number } | null> = ref(null)
const appIconPositionStyle: Ref<Record<string, string> | undefined> =
  ref(undefined)
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
  setTimeout(() => (appIconAnimating = false), 175)
}

const initAppIconPosition = async () => {
  const rect = appIcon.value!.getBoundingClientRect()
  appIconPosition.value = {
    x: (rect.left * 100) / window.innerWidth,
    y: (rect.top * 100) / window.innerHeight,
  }
  await updateAppIconPositionStyle()
  await nextTick()
  iconWrapperTouched.value = true
}

const unwatchTouchingIcon = watch(iconWrapperTouchedCount, newValue => {
  if (newValue >= 12) {
    initAppIconPosition()
    unwatchTouchingIcon()
  }
})

const unwatchIconTouched = watch(appIconTouched, appIconTouchedEl => {
  if (appIconTouchedEl && rootEl.value) {
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

    const getXP = (value: number) => (value * 100) / window.innerWidth
    const getYP = (value: number) => (value * 100) / window.innerHeight

    const setRemoveText = (() => {
      let removeTextTimer: any | null = null
      return () => {
        clearTimeout(removeTextTimer)
        removeTextTimer = setTimeout(() => {
          rootEl.value
            ?.querySelectorAll(classes['icon-touched-text'])
            .forEach(el => el.remove())
        }, 3000)
      }
    })()

    unwatchIconTouched()
    mouseTrackIconListener = debounce((evt: MouseEvent) => {
      if (appIconAnimating) {
        return
      }
      const rect = appIconTouched.value!.getBoundingClientRect()
      const iconRadius = rect.width / 2
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
          newX =
            appIconPosition.value!.x +
            getRandomInt(
              Math.min(iconRadiusXP + 2, BOUNDING - 3) + directionXExtra,
              BOUNDING + directionXExtra
            ) *
              directionX
          newY =
            appIconPosition.value!.y +
            getRandomInt(
              Math.min(iconRadiusYP + 2, BOUNDING - 3) + directionYExtra,
              BOUNDING + directionYExtra
            ) *
              directionY
          maxRetries -= 1
        } while (
          ((clientXP - newX) ** 2 + (clientYP - newY) ** 2) * 10 <=
            (hitboxXP ** 2 + hitboxYP ** 2) * 12 &&
          maxRetries >= 0
        )

        if (newX >= 100 - BOUNDING) {
          directionX = -1
          directionXExtra = 5
        } else if (newX <= BOUNDING) {
          directionX = 1
          directionXExtra = 5
        } else {
          directionX =
            Math.random() * directionRandomRange - directionXRandomOffset >=
            directionRandomRange / 2
              ? 1
              : -1
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
          directionY =
            Math.random() * directionRandomRange - directionYRandomOffset >=
            directionRandomRange / 2
              ? 1
              : -1
          directionYRandomOffset += directionY * getRandomInt(1, 4)
          directionYExtra = 0
        }
        const textEl = document.createElement('div')
        textEl.innerHTML = 'MISS'
        textEl.classList.add(classes['iconTouchedText'])
        textEl.style.left = `${appIconPosition.value!.x + iconRadiusXP}%`
        textEl.style.top = `${appIconPosition.value!.y - iconRadiusXP * 3}%`
        rootEl.value!.append(textEl)
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

onUnmounted(() => {
  if (mouseTrackIconListener) {
    document.body.removeEventListener('mousemove', mouseTrackIconListener)
  }
})
</script>

<style lang="postcss" module>
.titleIcon {
  @apply pointer-events-none;

  &.titleIconTouched {
    animation: none;
    transition: 0.2s;
    z-index: 200;
    position: fixed;
    margin-right: 0;
  }
}

.iconTouchedText {
  @apply pointer-events-none fixed z-5 text-primary-50 opacity-0;
  animation: app-icon-touched-text 2.5s linear;
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
</style>
