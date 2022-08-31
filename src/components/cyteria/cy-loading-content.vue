<template>
  <div>
    <cy-transition>
      <div v-if="loading" class="cy-loading-wrapper">
        <div class="dots-wrapper">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
        </div>
      </div>
      <slot v-else />
    </cy-transition>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  loading: boolean;
}

defineProps<Props>()
</script>

<style lang="postcss" scoped>
.cy-loading-wrapper {
  @apply flex items-center justify-center w-full h-full bg-light-0 rounded-lg;
  min-height: 15rem;

  & > .dots-wrapper {
    @apply flex items-center space-x-6;

    & > .dot {
      @apply w-5 h-5 bg-light rounded-full;
      animation: dot 3.5s linear infinite;
    }

    & > .dot-2 {
      animation-delay: 1s;
    }
    & > .dot-3 {
      animation-delay: 2s;
    }
  }
}

@keyframes dot {
  5% {
    @apply bg-light-3;
  }
  32% {
    @apply bg-light;
  }
  100% {
    @apply bg-light;
  }
}
</style>
