<template>
  <transition v-bind="$attrs">
    <slot />
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CyTransitionFade',
})
</script>

<style scoped>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: 0.1s ease;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-slide-right-enter-from {
  transform: translateX(-20%);
  opacity: 0;
}
.fade-slide-right-enter-to {
  transform: 0;
  opacity: 1;
}
.fade-slide-right-leave-to {
  transform: translateX(20%);
  opacity: 0;
}
.fade-slide-right-enter-active,
.fade-slide-right-leave-active {
  transition: 0.3s ease;
}
</style>
