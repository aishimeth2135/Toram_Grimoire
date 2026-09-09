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

<style scoped>
@reference "@/tailwind.css";

.cy-loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-lg);
  background-color: var(--color-primary-5);
  width: 100%;
  height: 100%;
  min-height: 15rem;

  & > .dots-wrapper {
    display: flex;
    align-items: center;

    & > :not(:last-child) {
      margin-inline-end: --spacing(6);
    }

    & > .dot {
      animation: dot 3.5s linear infinite;
      border-radius: calc(infinity * 1px);
      background-color: var(--color-primary-30);
      width: --spacing(5);
      height: --spacing(5);
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
    background-color: var(--app-primary-50);
  }
  32% {
    background-color: var(--app-primary-30);
  }
  100% {
    background-color: var(--app-primary-30);
  }
}
</style>
