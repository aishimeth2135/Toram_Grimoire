<template>
  <div class="app-left-menu--wrapper">
    <div class="content-container" @click.stop>
      <div class="h-full overflow-y-auto">
        <div class="mx-1 mt-6">
          <AppSideMenuContent />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AppLeftMenu',
}
</script>

<script lang="ts" setup>
import AppSideMenuContent from './app-side-menu-content.vue'
</script>

<style lang="postcss" scoped>
.app-left-menu--wrapper {
  @apply fixed w-64 top-0 left-0 opacity-100 h-full;

  & > .content-container {
    @apply h-full w-full border-r border-light;
  }
}

@media screen and (max-width: 82rem) {
  .app-left-menu--wrapper {
    @apply hidden;
  }
}
</style>
