<template>
  <div class="absolute left-0 top-0 h-full w-full overflow-hidden">
    <div :class="classes.pink" />
  </div>
</template>

<script lang="ts" setup>
import { useCssModule } from 'vue'

const classes = useCssModule()
</script>

<style lang="postcss" module>
.pink {
  @apply absolute bottom-0 right-0;
  background: linear-gradient(
    to bottom right,
    transparent 0%,
    transparent 10%,
    var(--app-primary-20) 100%
  );
  width: 100%;
  height: 100%;

  &::before {
    @apply absolute;
    content: '';
    background: radial-gradient(
      circle at 0% 0%,
      var(--app-blue-20) 0%,
      var(--app-blue-20) 30%,
      transparent 70%,
      transparent 100%
    );
    top: -65vw;
    left: 0;
    width: 100vw;
    height: 100vw;
  }

  &::after {
    @apply absolute;
    content: '';
    background: radial-gradient(
      circle at 100% 0%,
      var(--app-blue-20) 0%,
      var(--app-blue-20) 8%,
      transparent 50%,
      transparent 100%
    );
    top: -32vw;
    right: 0vw;
    width: 100vw;
    height: 100vw;
  }
}
</style>
