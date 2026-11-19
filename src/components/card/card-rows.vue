<template>
  <div class="cy-card-rows-content">
    <slot />
  </div>
</template>

<style>
.cy-card-rows-content {
  background-color: var(--app-white);

  & > .cy-card-row:nth-child(even) {
    background-color: --alpha(var(--app-primary-5) / 50%);
  }
}
</style>
