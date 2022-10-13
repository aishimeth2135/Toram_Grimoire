<template>
  <div class="inline-block">
    <transition mode="out-in" :css="false" @leave="leave">
      <svg-icon
        v-if="!available"
        key="1"
        icon-id="potum"
        class="custom-icon start-icon"
      />
      <svg-icon v-else key="2" icon-id="potum" class="custom-icon start-icon" />
    </transition>
    <!-- <transition
      appear
      :css="false"
      @enter="enter"
    >
      <div v-if="available && end" class="ball" />
    </transition> -->
  </div>
</template>

<script lang="ts" setup>
// @ts-ignore
import Velocity from 'velocity-animate'
import { computed, onMounted, ref, toRefs, watch } from 'vue'

import { InitializeStatus } from '@/stores/app/initialize/enums'
import { useMainStore } from '@/stores/app/main'

interface Props {
  status: number
}
interface Emits {
  (evt: 'done'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { status } = toRefs(props)
const mainStore = useMainStore()

const innerStatus = ref(0)
const end = ref(false)

const available = computed(() => {
  return (
    innerStatus.value >= InitializeStatus.BeforeFinished &&
    !mainStore.routerGuiding
  )
})

const leave = (el: Element, done: Function) => {
  Velocity(
    el,
    {
      opacity: 1,
    },
    {
      duration: 100,
    }
  )
  Velocity(
    el,
    {
      opacity: 0,
    },
    {
      duration: 400,
      easing: [0.42, 0, 1.0, 1.0],
      complete: () => {
        end.value = true
        done()
        emit('done')
      },
    }
  )
}
// const enter = (el: Element, done: Function) => {
//   const pwhite = getComputedStyle(document.body).getPropertyValue('--app-white').trim()
//   const opts = window.innerHeight > window.innerWidth ? {
//     width: '150vh',
//     height: '150vh',
//     left: '-=75vh',
//     top: '-=75vh',
//   } : {
//     width: '150vw',
//     height: '150vw',
//     left: '-=75vw',
//     top: '-=75vw',
//   }
//   Velocity(el, {
//     backgroundColor: pwhite,
//     ...opts,
//   }, {
//     duration: 600,
//     complete: () => {
//       done()
//       setTimeout(() => emit('done'), 100)
//     },
//   })
// }

onMounted(() => {
  innerStatus.value = status.value
  watch(status, value => (innerStatus.value = value))
})
</script>

<style lang="postcss" scoped>
.custom-icon {
  width: 6rem;
  height: 6rem;
  color: var(--app-primary-30);

  &.start-icon {
    animation: loading-page-main-icon ease 4s infinite;
  }
}

@keyframes loading-page-main-icon {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(0, -25%);
  }
  50% {
    transform: translate(0, 0);
  }
  75% {
    transform: translate(0, -15%);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
