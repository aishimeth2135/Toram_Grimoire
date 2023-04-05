<template>
  <div class="flex">
    <div class="pt-6">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-75"
      >
        <cy-icon-text :icon="icon" :color="color" icon-width="1.25rem" />
      </div>
    </div>
    <div class="relative z-1 flex flex-wrap pl-2 pr-6">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  icon: string
  color: string
}

defineProps<Props>()
</script>
<!--
<style lang="postcss" module>
.bg-hexagon {
  @apply absolute opacity-30;
  top: 106px;
  left: 0;

  &,
  &::before,
  &::after {
    @apply rounded-lg bg-blue-30;
    width: 500px;
    height: 288px;
  }

  &::before,
  &::after {
    @apply absolute left-0 top-0;
    content: '';
  }
  &::before {
    transform: rotate(60deg);
  }
  &::after {
    transform: rotate(-60deg);
  }
}

.bg-grass {
  @apply absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.35);

  &,
  &::before,
  &::after {
    @apply rounded-lg;
  }

  &::before {
    content: '';
    position: absolute;
    height: 240px;
    width: 300px;
    top: 4px;
    left: 4px;
    background: linear-gradient(
      to bottom right,
      rgba(var(--home-link-group-bg), 0.5) 0%,
      transparent 75%,
      transparent 100%
    );
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 6px;
    right: 6px;
    width: 200px;
    height: 300px;
    border-radius: 3px;
    background: linear-gradient(
      to top left,
      rgba(var(--home-link-group-bg), 0.5) 0%,
      transparent 75%,
      transparent 100%
    );
  }
}
</style> -->
