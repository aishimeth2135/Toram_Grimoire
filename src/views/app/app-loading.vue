<template>
  <teleport to="#app-loading">
    <div
      v-show="store.active"
      class="z-100 fixed left-0 top-0 flex size-full justify-center bg-white/60 p-4"
      @click.stop
    >
      <div class="mt-[15vh]">
        <cy-icon icon="@grimoire-cat" class="custom-icon" />
        <div class="text-primary-80 mt-4 text-xl">
          {{ store.loadingText }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { useLoadingStore } from '@/stores/app/loading'

const store = useLoadingStore()
</script>

<style scoped>
.custom-icon {
  animation: loading-page-main-icon ease 4s infinite;
  width: 6rem;
  height: 6rem;
  color: #f7a8d3;
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
