<template>
  <div class="cy-card-rows-content">
    <slot />
  </div>
</template>

<style lang="postcss" scoped>
div.cy-card-rows-content {
  @apply bg-white;

  & > :deep(.cy-card-row):nth-child(even) {
    background-color: rgba(var(--app-rgb-primary-5), 0.5);
  }
}
</style>