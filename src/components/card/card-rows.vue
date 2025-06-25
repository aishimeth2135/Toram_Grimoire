<template>
  <div class="cy-card-rows-content">
    <slot />
  </div>
</template>

<style>
div.cy-card-rows-content {
  background-color: var(--app-white);

  & > :deep(.cy-card-row):nth-child(even) {
    background-color: --alpha(var(--app-primary-5) / 50%);
  }
}
</style>
