<template>
  <teleport to="#app-loading">
    <div
      v-show="store.active"
      class="app--loading fixed left-0 top-0 z-100 flex h-full w-full justify-center p-4"
      @click.stop
    >
      <div class="main-container">
        <cy-icon icon="@potum" class="custom-icon" />
        <div class="mt-4 text-xl">
          {{ store.loadingText }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { useLoadingStore } from '@/stores/app/loading'

export default {
  name: 'AppLoading',
}
</script>

<script lang="ts" setup>
const store = useLoadingStore()
</script>

<style lang="postcss" scoped>
.app--loading {
  background-color: rgba(var(--app-rgb-white), 0.6);
}
.custom-icon {
  width: 6rem;
  height: 6rem;
  color: #f7a8d3;
  animation: loading-page-main-icon ease 4s infinite;
}
.main-container {
  margin-top: 15vh;
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
