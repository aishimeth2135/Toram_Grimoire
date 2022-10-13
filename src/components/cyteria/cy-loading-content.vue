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
  loading: boolean
}

defineProps<Props>()
</script>

<style lang="postcss" scoped>
.cy-loading-wrapper {
  @apply flex h-full w-full items-center justify-center rounded-lg bg-primary-5;
  min-height: 15rem;

  & > .dots-wrapper {
    @apply flex items-center space-x-6;

    & > .dot {
      @apply h-5 w-5 rounded-full bg-primary-30;
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
    @apply bg-primary-50;
  }
  32% {
    @apply bg-primary-30;
  }
  100% {
    @apply bg-primary-30;
  }
}
</style>
